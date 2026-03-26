-- Safe drop plan for legacy users columns:
--   users.email_verified
--   users.phone_verified
--
-- Run this only after application rollout that no longer references legacy columns.
-- Recommended: run in maintenance window with a DB backup/checkpoint available.

-- 0) Pre-check: inspect current users shape
SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND column_name IN ('is_email_verified', 'is_phone_verified', 'email_verified', 'phone_verified')
ORDER BY column_name;

-- 1) Pre-check: ensure trigger exists to keep flags synced during transition
SELECT tgname
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname = 'users'
  AND t.tgname = 'trg_users_normalize_flags'
  AND NOT t.tgisinternal;

-- 2) Pre-check: no data drift between legacy and canonical columns
SELECT
  COUNT(*) FILTER (WHERE email_verified IS DISTINCT FROM is_email_verified) AS email_mismatch,
  COUNT(*) FILTER (WHERE phone_verified IS DISTINCT FROM is_phone_verified) AS phone_mismatch
FROM public.users;

-- Expect both mismatch counts to be 0 before proceeding.

BEGIN;

-- 3) Final one-time sync (defensive)
UPDATE public.users
SET
  is_email_verified = COALESCE(is_email_verified, email_verified, FALSE),
  is_phone_verified = COALESCE(is_phone_verified, phone_verified, FALSE);

-- 4) Drop legacy columns
ALTER TABLE public.users
  DROP COLUMN IF EXISTS email_verified,
  DROP COLUMN IF EXISTS phone_verified;

COMMIT;

-- 5) Post-check: verify remaining canonical columns
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND column_name IN ('is_email_verified', 'is_phone_verified', 'email_verified', 'phone_verified')
ORDER BY column_name;

-- Rollback strategy:
-- If migration fails before COMMIT, transaction rollback preserves original columns.
-- If migration already committed and rollback is required:
--   ALTER TABLE public.users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;
--   ALTER TABLE public.users ADD COLUMN phone_verified BOOLEAN NOT NULL DEFAULT FALSE;
--   UPDATE public.users
--   SET email_verified = is_email_verified,
--       phone_verified = is_phone_verified;
