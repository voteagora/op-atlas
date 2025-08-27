import { KYCUser } from "@prisma/client"

export type PersonaStatus =
  | "created"
  | "pending"
  | "completed"
  | "failed"
  | "expired"
  | "needs_review"
  | "approved"
  | "declined"

// Useful to add project problems to persona status
export type ExtendedPersonaStatus = PersonaStatus | "project_issue"

export interface KYCUserStatusProps {
  user: KYCUser
  isUser?: boolean
  handleEmailResend: (kycUser: KYCUser) => void
  emailResendBlock?: boolean
}
