-- Remove the trigger and function for grant eligibility expiration
DROP TRIGGER IF EXISTS grant_eligibility_set_expiration_trigger ON "GrantEligibility";
DROP FUNCTION IF EXISTS grant_eligibility_set_expiration();