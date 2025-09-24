CREATE TABLE IF NOT EXISTS "UserSafeAddresses" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" text NOT NULL,
  "safeAddress" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "UserSafeAddresses_userId_safeAddress_key" ON "UserSafeAddresses"("userId", "safeAddress");
CREATE INDEX IF NOT EXISTS "UserSafeAddresses_userId_idx" ON "UserSafeAddresses"("userId");
ALTER TABLE "UserSafeAddresses"
  ADD CONSTRAINT "UserSafeAddresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE;
