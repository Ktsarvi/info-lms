alter table profiles
add column if not exists card_id text;

alter table profiles
add column if not exists auto_renew boolean not null default true;

alter table profiles
add column if not exists renewal_attempt_count int not null default 0;

create or replace function get_due_renewals () returns table (
  user_id uuid,
  card_id text,
  amount numeric,
  plan_months int
) language sql as $$
select p.id,
  p.card_id,
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
  and p.card_id is not null
  and p.subscription_expires_at <= now() + interval '1 day'
  and p.subscription_expires_at > now() - interval '3 days' $$;