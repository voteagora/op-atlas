import { PrismaClient } from "@prisma/client"
import { writeFile } from "fs/promises"

const prisma = new PrismaClient()

async function getApplicants() {
  const applicants = (await prisma.$queryRawUnsafe(
    `
    with applied_projects as (
      select distinct "projectId"
      from "Application"
      where "createdAt" <= '2024-05-31 14:00:00'
    ),
    members as (
      select distinct "userId" as "uid"
      from "UserProjects"
      where "deletedAt" IS NULL AND "projectId" IN (select "projectId" from applied_projects)
    )
    
    select "farcasterId", "name", "username", "email"
    from "User"
    where "id" IN (select "uid" from members);
    `,
  )) as {
    farcasterId: string
    name: string
    username: string
    email?: string | null
  }[]

  return applicants
}

/**
 * We use the Neynar API here, so make sure you set the key in the environment
 * See: https://docs.neynar.com/reference/user-bulk
 */

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

async function generateApplicantData() {
  const applicants = await getApplicants()
  const fids = applicants.map((a) => a.farcasterId)

  const profiles: Record<string, FarcasterUser> = {}

  // Can only fetch so many profiles at a time
  const chunkSize = 50
  for (let i = 0; i < fids.length; i += chunkSize) {
    const chunk = fids.slice(i, i + chunkSize)
    const chunkProfiles = await getFarcasterProfiles(chunk)
    chunkProfiles.forEach((p) => {
      profiles[`${p.fid}`] = p
    })
  }

  const data = applicants.map((applicant) => {
    const profile = profiles[applicant.farcasterId]
    return {
      farcasterId: applicant.farcasterId,
      name: applicant.name,
      username: applicant.username,
      email: applicant.email,
      custodyAddress: profile.custody_address,
      verifiedAddresses: profile.verified_addresses.eth_addresses,
    }
  })

  // Output to CSV
  const headers = [
    "farcasterId",
    "username",
    "name",
    "email",
    "custodyAddress",
    "verifiedAddresses",
  ].join(",")

  const csv = [
    headers,
    ...data.map((d) =>
      [
        d.farcasterId,
        d.username,
        d.name,
        d.email,
        d.custodyAddress,
        d.verifiedAddresses.join(","),
      ].join(","),
    ),
  ].join("\n")

  await writeFile("applicants.csv", csv)
}

generateApplicantData().then(() => {
  console.log("Done")
})
