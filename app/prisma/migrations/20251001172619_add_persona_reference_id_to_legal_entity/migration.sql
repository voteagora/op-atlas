-- Ensure personaReferenceId exists on the legal entity table regardless of rename state
DO $$
BEGIN
    -- Legacy schema (pre-rename)
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'LegalEntity'
    ) THEN
        EXECUTE 'ALTER TABLE "LegalEntity" ADD COLUMN IF NOT EXISTS "personaReferenceId" TEXT';
        EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS "LegalEntity_personaReferenceId_key" ON "LegalEntity"("personaReferenceId")';

    -- Renamed schema (post-rename)
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'KYCLegalEntity'
    ) THEN
        EXECUTE 'ALTER TABLE "KYCLegalEntity" ADD COLUMN IF NOT EXISTS "personaReferenceId" TEXT';
        EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS "KYCLegalEntity_personaReferenceId_key" ON "KYCLegalEntity"("personaReferenceId")';
    END IF;
END
$$;
