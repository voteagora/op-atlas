-- AddForeignKey
ALTER TABLE "SuperfluidStream" ADD CONSTRAINT "SuperfluidStream_receiver_fkey" FOREIGN KEY ("receiver") REFERENCES "KYCTeam"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;
