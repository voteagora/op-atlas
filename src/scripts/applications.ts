import { PrismaClient } from "@prisma/client"
import { writeFile } from "fs/promises"

const prisma = new PrismaClient()

async function getApplications() {
  const applications = await prisma.application.findMany({
    where: {
      roundId: "5",
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
              organization: true,
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
  const params = new URLSearchParams({ fids: farcasterIds.join(",") })
  const url = `https://api.neynar.com/v2/farcaster/user/bulk?${params.toString()}`
  const options = {
    headers: { accept: "application/json", api_key: NEYNAR_API_KEY ?? "" },
  }

  const results = await fetch(url, options)
  const data = (await results.json()) as { users: FarcasterUser[] }
  return data.users
}

async function generateApplicationData() {
  const applications = await Promise.all(
    (
      await getApplications()
    ).map(async (application) => {
      // get farcasterId for each team member
      await Promise.all(
        application.project.team.map(async (member) => {
          const user = await getFarcasterProfiles([member.user.farcasterId])
          member.user = {
            ...member.user,
            ...user[0],
          }
        }),
      )

      return application
    }),
  )

  // write to file
  await writeFile("applications.json", JSON.stringify(applications, null, 2))
}

generateApplicationData()
