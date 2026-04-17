-- Drop the foreign key from SuperfluidStream.receiver -> KYCTeam.walletAddress.
-- This lets us ingest grant vesting schedules for receivers Atlas does not
-- know about (no KYCTeam row), so they show up in the Retool grant-disbursement
-- report alongside tracked projects.
ALTER TABLE "SuperfluidStream" DROP CONSTRAINT "SuperfluidStream_receiver_fkey";
