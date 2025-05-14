import { prisma } from "@/db/client"
import { getAddress } from "viem"

export const maxDuration = 900

export async function GET() {
  try {
    // Get all UserAddress records
    const userAddresses = await prisma.userAddress.findMany()

    let successCount = 0
    let errorCount = 0
    let skippedCount = 0

    // Update each address with its checksummed version
    const updates = userAddresses.map(async (record) => {
      try {
        const checksummedAddress = getAddress(record.address) as string

        // Skip if address is already checksummed
        if (checksummedAddress === record.address) {
          skippedCount++
          return
        }

        // First delete the old record since we need to update the primary key
        await prisma.userAddress.delete({
          where: {
            address_userId: {
              address: record.address,
              userId: record.userId
            }
          }
        })

        // Then create new record with checksummed address
        await prisma.userAddress.create({
          data: {
            address: checksummedAddress,
            userId: record.userId,
            source: record.source,
            primary: record.primary,
            createdAt: record.createdAt,
            updatedAt: new Date()
          }
        })

        successCount++
      } catch (error) {
        console.error(`Failed to update address ${record.address}:`, error)
        errorCount++
      }
    })

    await Promise.all(updates)

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully updated ${successCount} addresses, skipped ${skippedCount} already-checksummed addresses, failed to update ${errorCount} addresses`
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    console.error("Failed to update addresses:", error)
    return new Response(JSON.stringify({
      success: false,
      message: "Failed to update addresses",
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}