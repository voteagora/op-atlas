import { NextRequest } from "next/server"
import { z } from "zod"

import { addKYCTeamMembers, createProjectKycTeams } from "@/db/projects"
import { authenticateApiUser } from "@/serverAuth"

const KYCRequestSchema = z.object({
  kycTeamId: z.string(),
  individuals: z.array(
    z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
    }),
  ),
  businesses: z.array(
    z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      companyName: z.string(),
    }),
  ),
})

export const POST = async (req: NextRequest) => {
  const authResponse = await authenticateApiUser(req)

  if (!authResponse.authenticated) {
    return new Response(authResponse.failReason, { status: 401 })
  }

  try {
    const jsonData = await req.json()

    const validatedData = KYCRequestSchema.parse(jsonData)

    await addKYCTeamMembers(validatedData)

    return new Response("KYC Team added successfully", { status: 200 })
  } catch (error: any) {
    console.error("Error processing request", error)
    return new Response(`Error processing request: ${error.message}`, {
      status: 400,
    })
  }
}
