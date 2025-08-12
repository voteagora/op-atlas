import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function blacklistProject(projectId: string, reason?: string) {
    return prisma.projectBlacklist.upsert({
        where: { projectId },
        update: {
            reason,
            updatedAt: new Date(),
        },
        create: {
            projectId,
            reason,
        },
    })
}

async function rejectProjectKYC(projectId: string): Promise<number> {
    // Find all KYC users associated with this project
    const kycUsers = await prisma.kYCUser.findMany({
        where: {
            KYCUserTeams: {
                some: {
                    team: {
                        projects: {
                            some: {
                                id: projectId,
                            },
                        },
                    },
                },
            },
        },
        select: {
            id: true,
        },
    })

    // Update KYC status to rejected for all found users
    if (kycUsers.length > 0) {
        await prisma.kYCUser.updateMany({
            where: {
                id: {
                    in: kycUsers.map((user) => user.id),
                },
            },
            data: {
                status: "REJECTED",
            },
        })
    }

    return kycUsers.length
}

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
