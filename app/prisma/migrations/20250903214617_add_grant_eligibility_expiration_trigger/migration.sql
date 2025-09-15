-- Create trigger function to set expiration date to 30 days from now
CREATE OR REPLACE FUNCTION grant_eligibility_set_expiration()
RETURNS TRIGGER AS $$
BEGIN
    -- Set expiresAt to 30 days from now on INSERT or UPDATE
    NEW."expiresAt" := NOW() + INTERVAL '30 days';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create BEFORE trigger to set expiration date (runs before changelog trigger)
CREATE TRIGGER grant_eligibility_set_expiration_trigger
    BEFORE INSERT OR UPDATE ON "GrantEligibility"
    FOR EACH ROW
    EXECUTE FUNCTION grant_eligibility_set_expiration();