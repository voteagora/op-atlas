-- Idempotently enforce default on UserSafeAddresses.id to gen_random_uuid() cast to text
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'UserSafeAddresses'
      AND column_name = 'id'
  ) THEN
    -- Safe to run multiple times
    EXECUTE 'ALTER TABLE "public"."UserSafeAddresses" ALTER COLUMN "id" SET DEFAULT (gen_random_uuid())::text';
  END IF;
END
$$;

-- Ensure unique composite key exists as per Prisma schema
CREATE UNIQUE INDEX IF NOT EXISTS "UserSafeAddresses_userId_safeAddress_key"
  ON "public"."UserSafeAddresses" ("userId", "safeAddress");

-- Ensure index on userId exists (matches @@index in schema)
CREATE INDEX IF NOT EXISTS "UserSafeAddresses_userId_idx"
  ON "public"."UserSafeAddresses" ("userId");

-- Drop deprecated column from KYCUser (align with schema)
ALTER TABLE "public"."KYCUser"
  DROP COLUMN IF EXISTS "businessName";


