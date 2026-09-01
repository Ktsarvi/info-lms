-- 1. Migrate the existing column (rename, not duplicate)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'profiles' and column_name = 'card_id'
  ) and not exists (
    select 1 from information_schema.columns
    where table_name = 'profiles' and column_name = 'card_uuid'
  ) then
    alter table profiles rename column card_id to card_uuid;
  end if;
end $$;

alter table profiles
add column if not exists card_uuid text;

alter table profiles
add column if not exists auto_renew boolean not null default true;

alter table profiles
add column if not exists renewal_attempt_count int not null default 0;

alter table profiles
add column if not exists last_renewal_attempt_at timestamptz;

-- Payriff-specific columns on payments, in case they weren't added yet
alter table payments
add column if not exists payriff_order_id text;

alter table payments
add column if not exists payriff_transaction_id text;

alter table payments
add column if not exists is_renewal boolean not null default false;

-- 2. Drop before recreate — output column name changed from card_id to card_uuid
drop function if exists get_due_renewals();

create or replace function get_due_renewals () returns table (
  user_id uuid,
  card_uuid text,
  amount numeric,
  plan_months int
) language sql as $$
select p.id,
  p.card_uuid,
  pay.amount,
  pay.plan_months
from profiles p
  join lateral (
    select amount,
      plan_months
    from payments
    where payments.user_id = p.id
      and payments.status = 'paid'
    order by created_at desc
    limit 1
  ) pay on true
where p.auto_renew = true
  and p.card_uuid is not null
  and p.subscription_expires_at <= now() + interval '1 day'
  and p.subscription_expires_at > now() - interval '3 days'
  and (
    p.last_renewal_attempt_at is null
    or p.last_renewal_attempt_at < current_date
  )
$$;