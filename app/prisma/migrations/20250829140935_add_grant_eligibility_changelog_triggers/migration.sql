-- Create trigger function for GrantEligibility changelog
CREATE OR REPLACE FUNCTION grant_eligibility_changelog_trigger()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    action_type TEXT;
    performer TEXT;
BEGIN
    performer := current_setting('app.current_user_id', true);

    -- Determine action type
    IF TG_OP = 'INSERT' THEN
        action_type := 'created';
        old_data := NULL;
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        -- Ignore cosmetic-only updates: updatedAt only
        IF (to_jsonb(NEW) - 'updatedAt') = (to_jsonb(OLD) - 'updatedAt') THEN
          RETURN NEW;
        END IF;

        -- Check for special state changes
        IF OLD."submittedAt" IS NULL AND NEW."submittedAt" IS NOT NULL THEN
            action_type := 'submitted';
        ELSIF OLD."deletedAt" IS NULL AND NEW."deletedAt" IS NOT NULL THEN
            action_type := 'canceled';
        ELSIF OLD."currentStep" IS DISTINCT FROM NEW."currentStep" AND NEW."currentStep" > OLD."currentStep" THEN
            action_type := 'advanced';
        ELSE
            action_type := 'updated';
        END IF;
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
    END IF;

    -- Insert changelog entry
    INSERT INTO "GrantEligibilityChangelog" (
        "id",
        "formId",
        "action",
        "performedBy",
        "oldData",
        "newData",
        "createdAt"
    ) VALUES (
        gen_random_uuid(),
        COALESCE(NEW.id, OLD.id),
        action_type,
        NULLIF(performer, ''),
        old_data,
        new_data,
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for GrantEligibility table
CREATE TRIGGER grant_eligibility_changelog_insert_trigger
    AFTER INSERT ON "GrantEligibility"
    FOR EACH ROW
    EXECUTE FUNCTION grant_eligibility_changelog_trigger();

CREATE TRIGGER grant_eligibility_changelog_update_trigger
    AFTER UPDATE ON "GrantEligibility"
    FOR EACH ROW
    EXECUTE FUNCTION grant_eligibility_changelog_trigger();