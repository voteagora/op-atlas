CREATE TABLE IF NOT EXISTS "UserKYCUser" (
  "id" TEXT NOT NULL,
  "kycUserId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserKYCUser_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "UserKYCUser_userId_idx" ON "UserKYCUser"("userId");
CREATE INDEX IF NOT EXISTS "UserKYCUser_kycUserId_idx" ON "UserKYCUser"("kycUserId");
CREATE UNIQUE INDEX IF NOT EXISTS "UserKYCUser_userId_kycUserId_key"
  ON "UserKYCUser"("userId","kycUserId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'UserKYCUser_userId_fkey'
  ) THEN
    ALTER TABLE "UserKYCUser"
      ADD CONSTRAINT "UserKYCUser_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'UserKYCUser_kycUserId_fkey'
  ) THEN
    ALTER TABLE "UserKYCUser"
      ADD CONSTRAINT "UserKYCUser_kycUserId_fkey"
      FOREIGN KEY ("kycUserId") REFERENCES "KYCUser"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END$$;
