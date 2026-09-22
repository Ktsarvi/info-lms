create or replace function grant_subscription_and_mark_paid (
    p_user_id uuid,
    p_payment_id bigint,
    p_plan_months int,
    p_card_uuid text default null,
    p_transaction_id text default null
  ) returns void as $$
declare
  base_date timestamptz;
  current_expiry timestamptz;
  target_expiry timestamptz;
  v_period_type text;
  v_status text;
begin
  -- Idempotency guard: if this payment was already marked paid, do nothing
  select status into v_status
  from payments
  where id = p_payment_id
  for update;

  if v_status = 'paid' then
    return;
  end if;

  select subscription_expires_at into current_expiry
  from profiles
  where id = p_user_id
  for update;

  if current_expiry is not null and current_expiry > now() then
    base_date := current_expiry;
  else
    base_date := now();
  end if;

  select period_type into v_period_type
  from payments
  where id = p_payment_id;

  if v_period_type = 'week' then
    target_expiry := base_date + (p_plan_months * 7 || ' days')::interval;
  else
    if p_plan_months <= 0 then
      target_expiry := base_date + (greatest(7, abs(p_plan_months)) || ' days')::interval;
    else
      target_expiry := base_date + (p_plan_months || ' months')::interval;
    end if;
  end if;

  update profiles
  set is_subscribed = true,
      subscription_expires_at = target_expiry
  where id = p_user_id;

  update payments
  set status = 'paid',
      payriff_transaction_id = p_transaction_id
  where id = p_payment_id;
end;
$$ language plpgsql security definer;