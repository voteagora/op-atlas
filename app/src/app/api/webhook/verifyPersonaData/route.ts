import { type NextRequest } from "next/server"
import { z } from "zod"

import { isKYBMatch, isKYCMatch } from "@/lib/utils/stringSimilarity"

const PersonaSchema = z.object({
  individuals: z.array(
    z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      companyName: z.string(),
    }),
  ),
})

const MOCK_KYC_PERSONA_DATA = {
  individuals: [
    {
      firstName: "Alice",
      lastName: "Smith",
      email: "alice.smith@example.com",
      companyName: "",
    },
    {
      firstName: "Charlie",
      lastName: "Brown",
      email: "charlie.brown@example.com",
      companyName: "Brown Enterprises",
    },
  ],
}

export async function POST(req: NextRequest) {
  const data = await req.json()

  const { individuals } = PersonaSchema.parse(data)

  const results: { similarity: number; match: boolean }[] = []

  individuals.forEach((individual) => {
    const { companyName, email, firstName, lastName } = individual

    const persona = MOCK_KYC_PERSONA_DATA.individuals.find(
      (persona) => persona.email === email,
    )
    if (!persona) {
      console.log("No persona found for email", email)
      return
    }

    if (Boolean(persona.companyName)) {
      const kybMatch = isKYBMatch(
        { businessName: companyName },
        { businessName: persona.companyName },
      )

      results.push(kybMatch)
    } else {
      const kycMatch = isKYCMatch(
        { firstName, lastName, email },
        {
          nameFirst: persona.firstName,
          nameLast: persona.lastName,
          personalEmail: persona.email,
        },
      )

      results.push(kycMatch)
    }
  })
  const resultsResponse = JSON.stringify(results, null, 2)
  return new Response(resultsResponse, { status: 200 })
}
