import { PrismaClient } from "@prisma/client"
import { writeFile } from "fs/promises"

const prisma = new PrismaClient()

async function getApplications() {
  const applications = await prisma.application.findMany({
    where: {
      roundId: "6",
    },
    distinct: ["projectId"],
    select: {
      attestationId: true,
      projectDescriptionOptions: true,
      impactStatementAnswer: {
        include: {
          impactStatement: {
            include: {
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      category: {
        select: {
          name: true,
          description: true,
        },
      },
      project: {
        include: {
          team: {
            include: {
              user: true,
            },
          },
          organization: {
            include: {
              organization: {
                include: {
                  team: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
          repos: true,
          contracts: true,
          funding: true,
          rewards: true,
          links: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return applications
}

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY
if (!NEYNAR_API_KEY) {
  throw new Error("NEYNAR_API_KEY is missing from env")
}

type FarcasterUser = {
  fid: number
  username: string
  display_name: string
  custody_address: string
  verified_addresses: {
    eth_addresses: string[]
    sol_addresses: string[]
  }
}

async function getFarcasterProfiles(farcasterIds: string[]) {
  if (farcasterIds.length === 0) {
    return []
  }

  const params = new URLSearchParams({ fids: farcasterIds.join(",") })
  const url = `https://api.neynar.com/v2/farcaster/user/bulk?${params.toString()}`
  const options = {
    headers: { accept: "application/json", api_key: NEYNAR_API_KEY ?? "" },
  }

  const results = await fetch(url, options)
  const data = (await results.json()) as { users: FarcasterUser[] }

  if (!data.users) {
    return getFarcasterProfiles(farcasterIds)
  }
  return data.users
}

async function generateApplicationData() {
  const applications = await Promise.all(
    (
      await getApplications()
    ).map(async (application) => {
      // get farcasterId for each team member
      const projectTeam = await getFarcasterProfiles(
        application.project.team
          .map((member) => member.user.farcasterId)
          .filter(Boolean) as string[],
      )

      // TODO: This will miss any user that does not have a farcasterId
      const organizationTeam = await getFarcasterProfiles(
        (application.project.organization?.organization.team
          .map((member) => member.user.farcasterId)
          .filter(Boolean) as string[]) ?? [],
      )

      // assemeble the team
      const team = [
        ...projectTeam,
        ...organizationTeam.filter(
          (member) => !projectTeam.some((m) => m.fid === member.fid),
        ),
      ]

      // add team to application
      application.project.team = team as any

      return {
        attestationId: application.attestationId,
        team: team,
      }
    }),
  )

  // write to file
  await writeFile("team.json", JSON.stringify(applications, null, 2))
}

generateApplicationData()
