-- Rename legacy KYC tables and columns to new naming convention, guarding each change
DO $$
BEGIN
    -- Rename LegalEntity table to KYCLegalEntity
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'LegalEntity'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'KYCLegalEntity'
    ) THEN
        EXECUTE 'ALTER TABLE "LegalEntity" RENAME TO "KYCLegalEntity"';
    END IF;

    -- Rename LegalEnitityController table to KYCLegalEntityController
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'LegalEnitityController'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'KYCLegalEntityController'
    ) THEN
        EXECUTE 'ALTER TABLE "LegalEnitityController" RENAME TO "KYCLegalEntityController"';
    END IF;

    -- Rename KYCTeamEntity table to KYCLegalEntityTeams
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'KYCTeamEntity'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'KYCLegalEntityTeams'
    ) THEN
        EXECUTE 'ALTER TABLE "KYCTeamEntity" RENAME TO "KYCLegalEntityTeams"';
    END IF;

    -- Rename foreign key column on KYCLegalEntity if the legacy column is still present
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'KYCLegalEntity'
          AND column_name = 'legalEnitityControllerId'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'KYCLegalEntity'
          AND column_name = 'kycLegalEntityControllerId'
    ) THEN
        EXECUTE 'ALTER TABLE "KYCLegalEntity" RENAME COLUMN "legalEnitityControllerId" TO "kycLegalEntityControllerId"';
    END IF;

    -- Rename EmailNotification.ReferenceId column to referenceId
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'EmailNotification'
          AND column_name = 'ReferenceId'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'EmailNotification'
          AND column_name = 'referenceId'
    ) THEN
        EXECUTE 'ALTER TABLE "EmailNotification" RENAME COLUMN "ReferenceId" TO "referenceId"';
    END IF;
END
$$;
