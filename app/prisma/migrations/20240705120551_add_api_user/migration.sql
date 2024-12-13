-- CreateTable
CREATE TABLE "api_users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "chain_id" INTEGER,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "api_users_api_key_key" ON "api_users"("api_key");

-- CreateIndex
CREATE INDEX "api_users_api_key_idx" ON "api_users"("api_key");
