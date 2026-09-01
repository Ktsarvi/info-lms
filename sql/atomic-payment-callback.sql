-- Atomic function to grant subscription and mark payment as paid in a single transaction
-- This prevents the race condition where one update succeeds and the other fails
create or replace function grant_subscription_and_mark_paid (
    p_user_id uuid,
    p_payment_id bigint,
    p_plan_months int,
    p_card_uuid text default null,
    p_transaction_id text default null
  ) returns void as $$
declare base_date timestamptz;
current_expiry timestamptz;
target_expiry timestamptz;
original_day int;
begin -- Get current subscription expiry
select subscription_expires_at into current_expiry
from profiles
where id = p_user_id for
update;
-- Lock the row to prevent concurrent updates
-- Calculate base date: if subscription is still valid, extend from there; otherwise use now
if current_expiry is not null
and current_expiry > now() then base_date := current_expiry;
else base_date := now();
end if;
-- Calculate target expiry date (handle month-end rollover)
original_day := extract(
  day
  from base_date
);
target_expiry := base_date + (p_plan_months || ' months')::interval;
-- If the day of month decreased (e.g., Jan 31 -> Feb 28), we rolled back to previous month end
-- This is correct behavior, but ensure we don't go backward
if extract(
  day
  from target_expiry
) < original_day then -- PostgreSQL already handles this correctly by rolling to month end
-- No additional adjustment needed
end if;
-- Update profile with subscription and optionally card info
update profiles
set is_subscribed = true,
  subscription_expires_at = target_expiry,
  card_uuid = coalesce(p_card_uuid, card_uuid),
  auto_renew = case
    when p_card_uuid is not null then true
    else auto_renew
  end
where id = p_user_id;
-- Mark payment as paid
update payments
set status = 'paid',
  payriff_transaction_id = p_transaction_id
where id = p_payment_id;
end;
$$ language plpgsql security definer;