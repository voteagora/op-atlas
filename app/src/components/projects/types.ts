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
  name: string
  email: string
  organization: string
  isUser?: boolean
  status?: PersonaStatus
  expirationDate?: Date
  handleEmailResend: (emailAddress: string) => void
  emailResendBlock?: boolean
}
