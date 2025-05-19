CREATE TABLE "UserPOF" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL CHECK ("source" IN ('world', 'passport')),
    "sourceId" TEXT,
    "sourceMeta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPOF_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPOF_userId_source_key" ON "UserPOF"("userId", "source");

-- CreateIndex
CREATE INDEX "UserPOF_userId_idx" ON "UserPOF"("userId");

-- AddForeignKey
ALTER TABLE "UserPOF" ADD CONSTRAINT "UserPOF_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_user_pof_updated_at
    BEFORE UPDATE ON "UserPOF"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 