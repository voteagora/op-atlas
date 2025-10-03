import { NextResponse } from "next/server"

// Mocks for modules used by the route handler
jest.mock("@/lib/actions/persona", () => ({
  createPersonaCase: jest.fn(),
  createPersonaInquiry: jest.fn(),
  attachInquiryToCase: jest.fn(),
  generatePersonaOneTimeLink: jest.fn(),
}))

jest.mock("@/lib/persona", () => ({
  personaClient: {
    getCases: jest.fn(),
  },
}))

// Import after mocks so the route uses the mocked implementations
import { GET } from "@/app/api/kyc/validate/route"
import {
  attachInquiryToCase,
  createPersonaCase,
  createPersonaInquiry,
  generatePersonaOneTimeLink,
} from "@/lib/actions/persona"
import { personaClient } from "@/lib/persona"

const mockedCreatePersonaCase = createPersonaCase as jest.Mock
const mockedCreatePersonaInquiry = createPersonaInquiry as jest.Mock
const mockedAttachInquiryToCase = attachInquiryToCase as jest.Mock
const mockedGeneratePersonaOneTimeLink = generatePersonaOneTimeLink as jest.Mock
const mockedGetCases = personaClient.getCases as unknown as jest.Mock

describe("/api/kyc/validate GET", () => {
  const POC_EMAIL = "poc@example.com"
  const TEMPLATE_ID = "tmpl_kyb_123"
  beforeEach(() => {
    jest.resetAllMocks()
    process.env.PERSONA_INQUIRY_KYB_TEMPLATE = TEMPLATE_ID
  })

  it("redirects immediately using OTL when an existing inquiry is found", async () => {
    // Arrange: personaClient returns a case with an inquiry
    mockedGetCases.mockResolvedValueOnce({
      data: [
        {
          id: "case_1",
          attributes: {
            status: "Open",
            resolution: "",
            "created-at": new Date().toISOString(),
            "updated-at": new Date().toISOString(),
            "started-at": new Date().toISOString(),
            "resolved-at": null,
            "reference-id": "ref-1",
            fields: {
              "business-name": { type: "string", value: "Biz" },
              "form-filler-email-address": { type: "string", value: POC_EMAIL },
            },
          },
          relationships: {
            inquiries: { data: [{ type: "inquiry", id: "inquiry_abc" }] },
          },
        },
      ],
      links: { next: undefined },
    })

    mockedGeneratePersonaOneTimeLink.mockResolvedValueOnce({
      success: true,
      inquiryId: "inquiry_abc",
      inquiryUrl: "https://persona.test/otl/inquiry_abc",
    })

    // Act
    const req = {
      url: `http://localhost/api/kyc/validate?pocEmail=${encodeURIComponent(
        POC_EMAIL,
      )}`,
    } as any
    const res = (await GET(req)) as NextResponse

    // Assert: redirect to OTL, no creation calls
    expect(res.status).toBe(302)
    expect(res.headers.get("location")).toBe(
      "https://persona.test/otl/inquiry_abc",
    )

    expect(mockedCreatePersonaCase).not.toHaveBeenCalled()
    expect(mockedCreatePersonaInquiry).not.toHaveBeenCalled()
    expect(mockedAttachInquiryToCase).not.toHaveBeenCalled()
    expect(mockedGeneratePersonaOneTimeLink).toHaveBeenCalledWith("inquiry_abc")
  })

  it("creates case and inquiry, attaches, then redirects via OTL when none exist", async () => {
    // Arrange: personaClient returns no matching case
    mockedGetCases.mockResolvedValueOnce({
      data: [],
      links: { next: undefined },
    })

    mockedCreatePersonaCase.mockResolvedValueOnce({
      success: true,
      caseId: "case_new",
    })
    mockedCreatePersonaInquiry.mockResolvedValueOnce({
      success: true,
      inquiryId: "inq_new",
      referenceId: "ref_new",
    })
    mockedAttachInquiryToCase.mockResolvedValueOnce({
      success: true,
      caseId: "case_new",
    })
    mockedGeneratePersonaOneTimeLink.mockResolvedValueOnce({
      success: true,
      inquiryId: "inq_new",
      inquiryUrl: "https://persona.test/otl/inq_new",
    })

    // Act
    const req = {
      url: `http://localhost/api/kyc/validate?POCEmail=${encodeURIComponent(
        POC_EMAIL,
      )}`,
    } as any
    const res = (await GET(req)) as NextResponse

    // Assert: redirect to OTL
    expect(res.status).toBe(302)
    expect(res.headers.get("location")).toBe("https://persona.test/otl/inq_new")

    // Verify call order and parameters
    expect(mockedCreatePersonaCase).toHaveBeenCalledWith({
      pocEmail: POC_EMAIL,
    })
    expect(mockedCreatePersonaInquiry).toHaveBeenCalledWith({
      templateId: TEMPLATE_ID,
    })
    expect(mockedAttachInquiryToCase).toHaveBeenCalledWith({
      inquiryId: "inq_new",
      caseId: "case_new",
    })
    expect(mockedGeneratePersonaOneTimeLink).toHaveBeenCalledWith("inq_new")
  })

  it("returns 400 when pocEmail is missing", async () => {
    const req = { url: `http://localhost/api/kyc/validate` } as any
    const res = (await GET(req)) as NextResponse

    expect(res.status).toBe(400)
    const body = await (res as any).json()
    expect(body).toEqual({
      success: false,
      error: "Missing required query param: pocEmail",
    })
  })
})
