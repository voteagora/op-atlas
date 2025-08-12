-- Create trigger function for User changelog
CREATE OR REPLACE FUNCTION user_changelog_trigger()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    action_type TEXT;
BEGIN
    -- Determine action type
    IF TG_OP = 'INSERT' THEN
        action_type := 'created';
        old_data := NULL;
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        action_type := 'updated';
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        action_type := 'deleted';
        old_data := to_jsonb(OLD);
        new_data := NULL;
    END IF;

    -- Insert changelog entry
    INSERT INTO "UserChangelog" (
        "id",
        "userId",
        "action",
        "oldData",
        "newData",
        "createdAt"
    ) VALUES (
        gen_random_uuid(),
        COALESCE(NEW.id, OLD.id),
        action_type,
        old_data,
        new_data,
        NOW()
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for Project changelog
CREATE OR REPLACE FUNCTION project_changelog_trigger()
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
        -- Ignore cosmetic-only updates: updatedAt and/or lastMetadataUpdate
        IF (to_jsonb(NEW) - 'lastMetadataUpdate' - 'updatedAt') = (to_jsonb(OLD) - 'lastMetadataUpdate' - 'updatedAt') THEN
          RETURN NEW;
        END IF;

        IF OLD."deletedAt" IS NULL AND NEW."deletedAt" IS NOT NULL THEN
            action_type := 'status_change';
        ELSE
            action_type := 'updated';
        END IF;
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        action_type := 'deleted';
        old_data := to_jsonb(OLD);
        new_data := NULL;
    END IF;

    -- Insert changelog entry
    INSERT INTO "ProjectChangelog" (
        "id",
        "projectId",
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

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for Application changelog
CREATE OR REPLACE FUNCTION application_changelog_trigger()
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
        action_type := 'submitted';
        old_data := NULL;
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        -- Check for status changes
        IF OLD.status != NEW.status THEN
            CASE NEW.status
                WHEN 'approved' THEN action_type := 'approved';
                WHEN 'rejected' THEN action_type := 'rejected';
                ELSE action_type := 'updated';
            END CASE;
        ELSE
            action_type := 'updated';
        END IF;
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        action_type := 'deleted';
        old_data := to_jsonb(OLD);
        new_data := NULL;
    END IF;

    -- Insert changelog entry
    INSERT INTO "ApplicationChangelog" (
        "id",
        "applicationId",
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

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for User table
CREATE TRIGGER user_changelog_insert_trigger
    AFTER INSERT ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION user_changelog_trigger();

CREATE TRIGGER user_changelog_update_trigger
    AFTER UPDATE ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION user_changelog_trigger();

CREATE TRIGGER user_changelog_delete_trigger
    AFTER DELETE ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION user_changelog_trigger();

-- Create triggers for Project table
CREATE TRIGGER project_changelog_insert_trigger
    AFTER INSERT ON "Project"
    FOR EACH ROW
    EXECUTE FUNCTION project_changelog_trigger();

CREATE TRIGGER project_changelog_update_trigger
    AFTER UPDATE ON "Project"
    FOR EACH ROW
    EXECUTE FUNCTION project_changelog_trigger();

CREATE TRIGGER project_changelog_delete_trigger
    AFTER DELETE ON "Project"
    FOR EACH ROW
    EXECUTE FUNCTION project_changelog_trigger();

-- Create triggers for Application table
CREATE TRIGGER application_changelog_insert_trigger
    AFTER INSERT ON "Application"
    FOR EACH ROW
    EXECUTE FUNCTION application_changelog_trigger();

CREATE TRIGGER application_changelog_update_trigger
    AFTER UPDATE ON "Application"
    FOR EACH ROW
    EXECUTE FUNCTION application_changelog_trigger();

CREATE TRIGGER application_changelog_delete_trigger
    AFTER DELETE ON "Application"
    FOR EACH ROW
    EXECUTE FUNCTION application_changelog_trigger();

-- Create trigger function for UserProjects (team member changes)
CREATE OR REPLACE FUNCTION user_projects_changelog_trigger()
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
        action_type := 'collaborator_added';
        old_data := NULL;
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD."deletedAt" IS NULL AND NEW."deletedAt" IS NOT NULL THEN
            action_type := 'collaborator_removed';
        ELSIF OLD."deletedAt" IS NOT NULL AND NEW."deletedAt" IS NULL THEN
            action_type := 'collaborator_added';
        ELSIF OLD.role IS DISTINCT FROM NEW.role THEN
            action_type := 'collaborator_updated';
        ELSE
            RETURN NEW; -- ignore no-op updates
        END IF;
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        action_type := 'collaborator_removed';
        old_data := to_jsonb(OLD);
        new_data := NULL;
    END IF;

    -- Insert changelog entry for the project
    INSERT INTO "ProjectChangelog" (
        "id",
        "projectId",
        "action",
        "performedBy",
        "oldData",
        "newData",
        "createdAt"
    ) VALUES (
        gen_random_uuid(),
        COALESCE(NEW."projectId", OLD."projectId"),
        action_type,
        NULLIF(performer, ''),
        old_data,
        new_data,
        NOW()
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for UserProjects table
CREATE TRIGGER user_projects_changelog_insert_trigger
    AFTER INSERT ON "UserProjects"
    FOR EACH ROW
    EXECUTE FUNCTION user_projects_changelog_trigger();

CREATE TRIGGER user_projects_changelog_update_trigger
    AFTER UPDATE ON "UserProjects"
    FOR EACH ROW
    EXECUTE FUNCTION user_projects_changelog_trigger();

CREATE TRIGGER user_projects_changelog_delete_trigger
    AFTER DELETE ON "UserProjects"
    FOR EACH ROW
    EXECUTE FUNCTION user_projects_changelog_trigger();
