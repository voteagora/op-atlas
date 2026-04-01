import { Prisma, KYCStatus } from "@prisma/client"

import type { KycUserAdminDTO, KycUserMemberDTO } from "@/lib/dto"

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
  | "EXPIRED"

export enum EmailState {
  NOT_SENT = "NOT_SENT",
  SENDING = "SENDING",
  SENT = "SENT",
}

export type KycStatusRowUser = KycUserMemberDTO &
  Partial<Pick<KycUserAdminDTO, "firstName" | "lastName" | "email" | "personaReferenceId">>

// Minimal shape for a Legal Entity contact used in status rows
export type LegalEntityContact = {
  id: string
  email?: string
  firstName?: string
  lastName?: string
  businessName?: string
  status?: KYCStatus | string | null
  expiry?: Date | string | null
  // discriminator
  kycUserType?: "LEGAL_ENTITY"
}

// Union of supported targets for status rows and resend actions
export type KYCOrLegal = KycStatusRowUser | LegalEntityContact

export interface KYCUserStatusProps {
  user: KYCOrLegal
  isUser?: boolean
  handleEmailResend: (target: KYCOrLegal) => void | Promise<void>
  handleRestart?: (target: KYCOrLegal) => void | Promise<void>
  emailResendBlock?: boolean
  emailState: EmailState
  restartState?: EmailState
}

// Type guard: determine if a KYCOrLegal target is a LegalEntityContact
export function isLegalEntityContact(
  target: KYCOrLegal,
): target is LegalEntityContact {
  return (
    typeof target === "object" &&
    target !== null &&
    "kycUserType" in target &&
    (target as Partial<LegalEntityContact>).kycUserType === "LEGAL_ENTITY"
  )
}
