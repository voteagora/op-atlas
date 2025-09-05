import { KYCUser, Prisma } from "@prisma/client"

/**
 * Type representing a Project with its KYC team information.
 * Used for components that need to access the project's KYC team data,
 * particularly the wallet address for grant delivery.
 */
export type ProjectWithKycTeam = Prisma.ProjectGetPayload<{
  include: {
    organization: {
      select: {
        organization: {
          select: {
            id: true
          }
        }
      }
    }
    kycTeam: {
      include: {
        team: {
          select: {
            users: true
          }
        }
        rewardStreams: true
        projects: {
          include: {
            blacklist: true
          }
        }
      }
    }
  }
}>

// Useful to add project problems to persona status
export type ExtendedPersonaStatus =
  | import("@prisma/client").KYCStatus
  | "project_issue"

export enum EmailState {
  NOT_SENT = "NOT_SENT",
  SENDING = "SENDING",
  SENT = "SENT",
}
export interface KYCUserStatusProps {
  user: KYCUser
  isUser?: boolean
  handleEmailResend: (kycUser: KYCUser) => void
  emailResendBlock?: boolean
  emailState: EmailState
}
