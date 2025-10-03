import { NextRequest, NextResponse } from "next/server"

import {
  attachInquiryToCase,
  createPersonaCase,
  createPersonaInquiry,
  generatePersonaOneTimeLink,
} from "@/lib/actions/persona"
import { type PersonaCase, personaClient } from "@/lib/persona"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const pocEmail =
      url.searchParams.get("POCEmail") ?? url.searchParams.get("pocEmail")

    if (!pocEmail) {
      return NextResponse.json(
        { success: false, error: "Missing required query param: pocEmail" },
        { status: 400 },
      )
    }

    const templateId = process.env.PERSONA_INQUIRY_KYB_TEMPLATE

    // 0) Try to find an existing case/inquiry for this email and short-circuit
    const findExistingCaseAndInquiryByEmail = async (
      email: string,
    ): Promise<{ caseId?: string; inquiryId?: string } | null> => {
      try {
        let nextUrl: string | undefined = undefined
        const target = email.toLowerCase()
        do {
          const res = await personaClient.getCases(nextUrl)
          const match = res.data.find((c: PersonaCase) => {
            const formEmail =
              c.attributes?.fields?.["form-filler-email-address"]?.value
            return (
              typeof formEmail === "string" &&
              formEmail.toLowerCase() === target
            )
          })
          if (match) {
            const inquiryId = match.relationships?.inquiries?.data?.[0]?.id
            return { caseId: match.id, inquiryId }
          }
          nextUrl = res.links?.next
        } while (nextUrl)
        return null
      } catch (e) {
        console.warn(
          "Persona case lookup failed; proceeding with create flow:",
          e,
        )
        return null
      }
    }

    const existing = await findExistingCaseAndInquiryByEmail(pocEmail)
    if (existing?.inquiryId) {
      const linkRes = await generatePersonaOneTimeLink(existing.inquiryId)
      if (!linkRes.success || !linkRes.inquiryUrl) {
        return NextResponse.json(
          {
            success: false,
            error: linkRes.error ?? "Failed to generate Persona one-time link",
          },
          { status: 500 },
        )
      }
      return NextResponse.redirect(linkRes.inquiryUrl, 302)
    }

    // 1) Ensure we have a case (reuse existing if found)
    let caseId: string
    if (existing?.caseId) {
      caseId = existing.caseId
    } else {
      const caseRes = await createPersonaCase({ pocEmail })
      if (!caseRes.success || !caseRes.caseId) {
        return NextResponse.json(
          {
            success: false,
            error: caseRes.error ?? "Failed to create Persona case",
          },
          { status: 502 },
        )
      }
      caseId = caseRes.caseId
    }

    // 2) Create Persona Inquiry (KYB template)
    const inquiryRes = await createPersonaInquiry({ templateId })
    if (
      !inquiryRes.success ||
      !inquiryRes.inquiryId ||
      !inquiryRes.referenceId
    ) {
      return NextResponse.json(
        {
          success: false,
          error: inquiryRes.error ?? "Failed to create Persona inquiry",
        },
        { status: 502 },
      )
    }

    // 3) Attach Inquiry to Case
    const attachRes = await attachInquiryToCase({
      inquiryId: inquiryRes.inquiryId,
      caseId: caseId,
    })
    if (!attachRes.success) {
      return NextResponse.json(
        {
          success: false,
          error: attachRes.error ?? "Failed to attach inquiry to case",
        },
        { status: 502 },
      )
    }

    // 4) Generate one-time link and redirect user
    const linkRes = await generatePersonaOneTimeLink(inquiryRes.inquiryId)

    if (!linkRes.success || !linkRes.inquiryUrl) {
      return NextResponse.json(
        {
          success: false,
          error: linkRes.error ?? "Failed to generate Persona one-time link",
        },
        { status: 500 },
      )
    }

    return NextResponse.redirect(linkRes.inquiryUrl, 302)
  } catch (error) {
    console.error("/api/kyc/validate GET error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 },
    )
  }
}
