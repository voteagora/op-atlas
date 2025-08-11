import { prisma } from "@/db/client"
import { rejectProjectKYC } from "@/db/kyc"
import { blacklistProject } from "@/db/projects"

async function blacklistProjectScript() {
    const projectId = process.argv[2]
    const reason = process.argv[3] || "Manual blacklist"

    if (!projectId) {
        console.error("Usage: npm run blacklist-project <projectId> [reason]")
        process.exit(1)
    }

    try {
        // Check if project exists
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true, name: true },
        })

        if (!project) {
            console.error(`Project ${projectId} not found`)
            process.exit(1)
        }

        console.log(`Blacklisting project: ${project.name} (${projectId})`)
        console.log(`Reason: ${reason}`)

        // Add to blacklist
        await blacklistProject(projectId, reason)
        console.log("✅ Project added to blacklist")

        // Reject KYC status
        const rejectedCount = await rejectProjectKYC(projectId)
        console.log(`✅ Rejected KYC for ${rejectedCount} users`)

        console.log("✅ Project blacklisting completed successfully")
    } catch (error) {
        console.error("❌ Error blacklisting project:", error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

blacklistProjectScript()
