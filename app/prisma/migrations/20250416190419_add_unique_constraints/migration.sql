-- Add unique constraint to UserAddress.address
ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_address_key" UNIQUE ("address");

-- Add unique constraint to UserEmail.email
ALTER TABLE "UserEmail" ADD CONSTRAINT "UserEmail_email_key" UNIQUE ("email"); 