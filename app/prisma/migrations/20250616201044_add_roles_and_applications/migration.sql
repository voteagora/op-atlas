CREATE TYPE "RoleApplicationStatus" AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT,
    "description" VARCHAR(500),
    "requirements" JSONB NOT NULL DEFAULT '{}',
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);


CREATE TABLE "RoleApplication" (
    "id" SERIAL NOT NULL,
    "status" "RoleApplicationStatus" NOT NULL,
    "roleId" INTEGER NOT NULL,
    "userId" TEXT,
    "organizationId" TEXT,
    "application" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoleApplication_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_or_org_exclusive" CHECK (
        ("userId" IS NOT NULL AND "organizationId" IS NULL) OR
        ("userId" IS NULL AND "organizationId" IS NOT NULL)
    )
);

-- indexes for faster queries
CREATE INDEX "RoleApplication_roleId_idx" ON "RoleApplication"("roleId");
CREATE INDEX "RoleApplication_userId_idx" ON "RoleApplication"("userId");
CREATE INDEX "RoleApplication_organizationId_idx" ON "RoleApplication"("organizationId");

-- cleanup
ALTER TABLE "RoleApplication" ADD CONSTRAINT "RoleApplication_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RoleApplication" ADD CONSTRAINT "RoleApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RoleApplication" ADD CONSTRAINT "RoleApplication_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE; 