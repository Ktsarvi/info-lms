DO $$
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


ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS card_uuid text;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS auto_renew boolean NOT NULL DEFAULT true;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS renewal_attempt_count int NOT NULL DEFAULT 0;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_renewal_attempt_at timestamptz;


CREATE OR REPLACE FUNCTION get_due_renewals()
RETURNS TABLE (
  user_id uuid,
  card_uuid text,
  amount numeric,
  plan_months int
)
LANGUAGE sql
AS $$
  SELECT
    p.id,
    p.card_uuid,
    pay.amount,
    pay.plan_months
  FROM profiles p
  JOIN LATERAL (
    SELECT
      amount,
      plan_months
    FROM payments
    WHERE payments.user_id = p.id
      AND payments.status = 'paid'
    ORDER BY created_at DESC
    LIMIT 1
  ) pay ON true
  WHERE p.auto_renew = true
    AND p.card_uuid IS NOT NULL
    AND p.subscription_expires_at <= now() + interval '1 day'
    AND p.subscription_expires_at > now() - interval '3 days'
    AND (
      p.last_renewal_attempt_at IS NULL
      OR p.last_renewal_attempt_at < current_date
    );
$$;