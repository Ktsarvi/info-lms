do $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
      AND column_name = 'card_id'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
      AND column_name = 'card_uuid'
  ) THEN
    ALTER TABLE profiles
      RENAME COLUMN card_id TO card_uuid;
  END IF;
END
$$;

alter table profiles
add column if not exists card_uuid text;

alter table profiles
add column if not exists auto_renew boolean not null default true;

alter table profiles
add column if not exists renewal_attempt_count int not null default 0;

alter table profiles
add column if not exists last_renewal_attempt_at timestamptz;

drop function IF exists get_due_renewals ();

create or replace function get_due_renewals () RETURNS table (
  user_id uuid,
  card_uuid text,
  amount numeric,
  plan_months int
) LANGUAGE plpgsql SECURITY DEFINER
set
  search_path = public,
  pg_temp as $$
BEGIN
  RETURN QUERY
  WITH candidates AS (
    SELECT p.id
    FROM profiles p
    WHERE p.auto_renew = true
      AND p.card_uuid IS NOT NULL
      AND p.subscription_expires_at <= now() + interval '1 day'
      AND p.subscription_expires_at > now() - interval '3 days'
      AND (
        p.last_renewal_attempt_at IS NULL
        OR p.last_renewal_attempt_at < current_date
      )
      AND EXISTS (
        SELECT 1 FROM payments pay
        WHERE pay.user_id = p.id AND pay.status = 'paid'
      )
    FOR UPDATE SKIP LOCKED
  ),
  claimed AS (
    UPDATE profiles
    SET last_renewal_attempt_at = now()
    FROM candidates
    WHERE profiles.id = candidates.id
    RETURNING profiles.id, profiles.card_uuid
  )
  SELECT
    c.id,
    c.card_uuid,
    pay.amount,
    pay.plan_months
  FROM claimed c
  JOIN LATERAL (
    SELECT
      p.amount,
      p.plan_months
    FROM payments p
    WHERE p.user_id = c.id
      AND p.status = 'paid'
    ORDER BY p.created_at DESC
    LIMIT 1
  ) pay ON true;
END;
$$;

revoke
execute on FUNCTION get_due_renewals ()
from
  PUBLIC,
  authenticated;

grant
execute on FUNCTION get_due_renewals () to service_role;