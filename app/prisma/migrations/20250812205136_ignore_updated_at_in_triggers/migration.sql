-- AlterTable
CREATE OR REPLACE FUNCTION user_changelog_trigger()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    action_type TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        action_type := 'created';
        old_data := NULL;
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        IF (to_jsonb(NEW) - 'updatedAt') = (to_jsonb(OLD) - 'updatedAt') THEN
            RETURN NEW;
        END IF;
        action_type := 'updated';
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        action_type := 'deleted';
        old_data := to_jsonb(OLD);
        new_data := NULL;
    END IF;

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

CREATE OR REPLACE FUNCTION application_changelog_trigger()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    action_type TEXT;
    performer TEXT;
BEGIN
    performer := current_setting('app.current_user_id', true);

    IF TG_OP = 'INSERT' THEN
        action_type := 'submitted';
        old_data := NULL;
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        IF (to_jsonb(NEW) - 'updatedAt') = (to_jsonb(OLD) - 'updatedAt') THEN
            RETURN NEW;
        END IF;

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


