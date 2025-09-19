"use server"

import { auth } from "@/auth"
import { prisma } from "@/db/client"
import { GrantType, Prisma, KYCUser } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { sendKYCStartedEmail, sendKYBStartedEmail } from "./emails"

import { getGrantEligibilityFormStatus, GrantEligibilityFormStatus } from "@/lib/utils/grantEligibilityFormStatus"
import { withChangelogTracking } from "@/lib/utils/changelog"
import { verifyAdminStatus, verifyOrganizationAdmin } from "./utils"
import { getLatestDraftForm, getGrantEligibilityExpiration } from "@/db/grantEligibility"

export interface CreateGrantEligibilityFormParams {
  projectId?: string
  organizationId?: string
  grantType?: GrantType
}

export interface UpdateGrantEligibilityFormParams {
  formId: string
  currentStep?: number
  grantType?: GrantType
  walletAddress?: string
  kycTeamId?: string
  attestations?: Record<string, boolean>
  data?: {
    signers?: Array<{
      firstName: string
      lastName: string
      email: string
      company?: string
    }>
    entities?: Array<{
      company: string
      controllerFirstName: string
      controllerLastName: string
      controllerEmail: string
    }>
  }
}

export async function createGrantEligibilityForm(
  params: CreateGrantEligibilityFormParams
) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { error: "Unauthorized" }
  }

  const { projectId, organizationId, grantType } = params

  // Verify permissions
  if (projectId) {
    const isInvalid = await verifyAdminStatus(projectId, userId)
    if (isInvalid?.error) {
      return { error: isInvalid.error }
    }
  } else if (organizationId) {
    const isInvalid = await verifyOrganizationAdmin(organizationId, userId)
    if (isInvalid?.error) {
      return { error: isInvalid.error }
    }
  } else {
    return { error: "Project or organization ID required" }
  }

  try {
    const result = await withChangelogTracking(async (tx) => {
      // Check for existing draft forms
      const existingDrafts = await tx.grantEligibility.findMany({
        where: {
          ...(projectId ? { projectId } : {  }),
          ...(organizationId ? { organizationId } : {}),
          deletedAt: null,
          submittedAt: null,
          expiresAt: {
            gt: new Date(),
          },
        },
      })
      
      if (existingDrafts.length > 0) {
        return { 
          form: existingDrafts[0],
          message: "Continuing existing draft"
        }
      }

      // Create new form
      const form = await tx.grantEligibility.create({
        data: {
          currentStep: 1,
          projectId,
          organizationId,
          grantType,
          data: {
            signers: [],
            entities: []
          },
          expiresAt: getGrantEligibilityExpiration(),
        },
      })

      return { form }
    })

    if (result.message) {
      return result
    }

    if (projectId) {
      revalidatePath(`/projects/${projectId}/grant-address`)
    } else if (organizationId) {
      revalidatePath(`/profile/organizations/${organizationId}/grant-address`)
    }

    return result
  } catch (error) {
    console.error("Error creating grant eligibility form:", error)
    return { error: "Failed to create form" }
  }
}

export async function updateGrantEligibilityForm(
  params: UpdateGrantEligibilityFormParams
) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { error: "Unauthorized" }
  }

  const { formId, ...updates } = params

  try {
    const form = await withChangelogTracking(async (tx) => {
      // Get existing form
      const existingForm = await tx.grantEligibility.findUnique({
        where: { id: formId },
      })

      if (!existingForm) {
        throw new Error("Form not found")
      }

      const formStatus = getGrantEligibilityFormStatus(existingForm)
      if (formStatus !== GrantEligibilityFormStatus.DRAFT) {
        throw new Error("Can only update draft forms")
      }

      // Verify permissions
      if (existingForm.projectId) {
        const isInvalid = await verifyAdminStatus(existingForm.projectId, userId)
        if (isInvalid?.error) {
          throw new Error(isInvalid.error)
        }
      } else if (existingForm.organizationId) {
        const isInvalid = await verifyOrganizationAdmin(existingForm.organizationId, userId)
        if (isInvalid?.error) {
          throw new Error(isInvalid.error)
        }
      }

      // Merge existing data with updates
      const updatedData = updates.data ? {
        ...((existingForm.data as any) || {}),
        ...updates.data,
      } : existingForm.data

      // Prepare attestations value - handle null properly for Prisma
      let attestationsValue: Prisma.InputJsonValue | undefined = undefined
      if (updates.attestations !== undefined) {
        attestationsValue = updates.attestations
      } else if (existingForm.attestations !== null) {
        attestationsValue = existingForm.attestations as Prisma.InputJsonValue
      }

      // Update form
      return await tx.grantEligibility.update({
        where: { id: formId },
        data: {
          currentStep: updates.currentStep ?? existingForm.currentStep,
          grantType: updates.grantType ?? existingForm.grantType,
          walletAddress: updates.walletAddress ?? existingForm.walletAddress,
          kycTeamId: updates.kycTeamId ?? existingForm.kycTeamId,
          attestations: attestationsValue,
          data: updatedData,
          expiresAt: getGrantEligibilityExpiration(),
        },
      })
    })

    // Revalidate canonical wizard route
    revalidatePath(`/grant-eligibility/${formId}`)

    return { form }
  } catch (error) {
    console.error("Error updating grant eligibility form:", error)
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Failed to update form" }
  }
}

export async function getGrantEligibilityForm(formId: string) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { error: "Unauthorized" }
  }

  try {
    const form = await prisma.grantEligibility.findUnique({
      where: { id: formId },
      include: {
        project: true,
        organization: true,
        kycTeam: true,
      },
    })

    if (!form) {
      return { error: "Form not found" }
    }

    // Verify permissions
    if (form.projectId) {
      const isInvalid = await verifyAdminStatus(form.projectId, userId)
      if (isInvalid?.error) {
        return { error: isInvalid.error }
      }
    } else if (form.organizationId) {
      const isInvalid = await verifyOrganizationAdmin(form.organizationId, userId)
      if (isInvalid?.error) {
        return { error: isInvalid.error }
      }
    }

    return { form }
  } catch (error) {
    console.error("Error getting grant eligibility form:", error)
    return { error: "Failed to get form" }
  }
}

export async function submitGrantEligibilityForm(params: {
  formId: string
  finalAttestations: Record<string, boolean>
}) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { error: "Unauthorized" }
  }

  const { formId, finalAttestations } = params

  try {
    // Get existing form (read-only) first to validate and to avoid long-running work inside a transaction
    const existingForm = await prisma.grantEligibility.findUnique({
      where: { id: formId },
      include: {
        kycTeam: true,
      },
    })

    if (!existingForm) {
      return { error: "Form not found" }
    }

    const formStatus = getGrantEligibilityFormStatus(existingForm)
    if (formStatus !== GrantEligibilityFormStatus.DRAFT) {
      return { error: "Form has already been submitted or is not in draft status" }
    }

    if (existingForm.projectId) {
      const isInvalid = await verifyAdminStatus(existingForm.projectId, userId)
      if (isInvalid?.error) {
        return { error: isInvalid.error }
      }
    } else if (existingForm.organizationId) {
      const isInvalid = await verifyOrganizationAdmin(existingForm.organizationId, userId)
      if (isInvalid?.error) {
        return { error: isInvalid.error }
      }
    }

    // Verify KYC team exists
    if (!existingForm.kycTeamId || !existingForm.kycTeam) {
      return { error: "KYC team not found. Please verify wallet address first." }
    }

    // Parse signers and entities from form data
    const formData = (existingForm.data as any) || {}
    const signers = formData.signers || []
    const entities = formData.entities || []
    const kycTeamId: string = existingForm.kycTeamId as string

    // Do ONLY database work inside the transaction
    const { updatedForm, kycEmailTargets, kybEmailTargets } = await withChangelogTracking(async (tx) => {
      const updated = await tx.grantEligibility.update({
        where: { id: formId },
        data: {
          submittedAt: new Date(),
          attestations: {
            ...((existingForm.attestations as any) || {}),
            ...finalAttestations,
          },
          expiresAt: getGrantEligibilityExpiration(),
        },
      })

      const kycTargets: KYCUser[] = []
      const kybTargets: KYCUser[] = []

      // Process signers (individual KYC)
      for (const signer of signers) {
        if (!signer.email || !signer.firstName || !signer.lastName) {
          console.warn("Skipping signer with incomplete data:", signer)
          continue
        }

        let kycUser = await tx.kYCUser.findFirst({
          where: { email: signer.email.toLowerCase(), kycUserType: "USER" },
        })

        let isNewUser = false
        
        // If user doesn't exist or is expired, create/recreate them
        if (!kycUser || (kycUser.expiry && kycUser.expiry < new Date())) {
          kycUser = await tx.kYCUser.create({
            data: {
              email: signer.email.toLowerCase(),
              firstName: signer.firstName,
              lastName: signer.lastName,
              kycUserType: "USER",
              status: "PENDING",
              expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
          })
          isNewUser = true
        }

        const existingLink = await tx.kYCUserTeams.findFirst({
          where: {
            kycUserId: kycUser.id,
            kycTeamId,
          },
        })

        if (!existingLink) {
          await tx.kYCUserTeams.create({
            data: {
              kycUserId: kycUser.id,
              kycTeamId,
            },
          })
        }

        // Only send email if this is a new user
        if (isNewUser) {
          kycTargets.push(kycUser)
        }
      }

      // Process entities (business KYB)
      for (const entity of entities) {
        if (!entity.controllerEmail || !entity.controllerFirstName || !entity.controllerLastName || !entity.company) {
          console.warn("Skipping entity with incomplete data:", entity)
          continue
        }

        // For KYB case, check organization along with email and user type
        // If form is tied to a project (no organization), always create new KYC user
        // If form is tied to an organization, check if KYC user exists for same email, type, and organization
        let kycUser = null
        if (existingForm.organizationId) {
          kycUser = await tx.kYCUser.findFirst({
            where: {
              email: entity.controllerEmail.toLowerCase(),
              kycUserType: "LEGAL_ENTITY",
              KYCUserTeams: {
                some: {
                  team: {
                    OrganizationKYCTeams: {
                      some: {
                        organizationId: existingForm.organizationId,
                        deletedAt: null
                      }
                    }
                  }
                }
              }
            },
          })
        }
        // If form is tied to project (no organization), we always create new KYC user, so kycUser stays null

        let isNewUser = false

        // If user doesn't exist or is expired, create/recreate them
        if (!kycUser || (kycUser.expiry && kycUser.expiry < new Date())) {
          kycUser = await tx.kYCUser.create({
            data: {
              email: entity.controllerEmail.toLowerCase(),
              firstName: entity.controllerFirstName,
              lastName: entity.controllerLastName,
              businessName: entity.company,
              kycUserType: "LEGAL_ENTITY",
              status: "PENDING",
              expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
          })
          isNewUser = true
        }

        const existingLink = await tx.kYCUserTeams.findFirst({
          where: {
            kycUserId: kycUser.id,
            kycTeamId,
          },
        })

        if (!existingLink) {
          await tx.kYCUserTeams.create({
            data: {
              kycUserId: kycUser.id,
              kycTeamId,
            },
          })
        }

        // Only send email if this is a new user
        if (isNewUser) {
          kybTargets.push(kycUser)
        }
      }

      return { updatedForm: updated, kycEmailTargets: kycTargets, kybEmailTargets: kybTargets }
    })

    const emailPromises: Array<Promise<{
      type: "KYC" | "KYB"
      user?: string
      email: string
      company?: string
      success: boolean
      error?: string
    }>> = []

    for (const user of kycEmailTargets) {
      emailPromises.push(
        (async () => {
          try {
            const res = await sendKYCStartedEmail(user)
            return { type: "KYC" as const, user: `${user.firstName} ${user.lastName}`, email: user.email, success: res.success, error: res.error }
          } catch (e: any) {
            return { type: "KYC" as const, user: `${user.firstName} ${user.lastName}`, email: user.email, success: false, error: e?.message || "Unknown error" }
          }
        })(),
      )
    }

    for (const user of kybEmailTargets) {
      emailPromises.push(
        (async () => {
          try {
            const res = await sendKYBStartedEmail(user)
            return { type: "KYB" as const, user: `${user.firstName} ${user.lastName}`, email: user.email, company: user.businessName ?? undefined, success: res.success, error: res.error }
          } catch (e: any) {
            return { type: "KYB" as const, user: `${user.firstName} ${user.lastName}`, email: user.email, company: user.businessName ?? undefined, success: false, error: e?.message || "Unknown error" }
          }
        })(),
      )
    }

    const emailResults = await Promise.all(emailPromises)

    // Revalidate related pages and canonical wizard route
    if (existingForm.projectId) {
      revalidatePath(`/projects/${existingForm.projectId}/grant-address`)
    } else if (existingForm.organizationId) {
      revalidatePath(`/profile/organizations/${existingForm.organizationId}/grant-address`)
    }
    revalidatePath(`/grant-eligibility/${formId}`)

    const failedEmails = emailResults.filter((r) => !r.success)
    if (failedEmails.length > 0) {
      console.warn("Some KYC/KYB emails failed to send:", failedEmails)
      return {
        success: true,
        warning: `Form submitted successfully, but ${failedEmails.length} email(s) failed to send. The recipients may need to be contacted manually.`,
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error submitting grant eligibility form:", error)
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Failed to submit form" }
  }
}

// Get latest draft form for a project or organization
export async function getLatestDraftFormAction(params: {
  projectId?: string
  organizationId?: string
}) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { error: "Unauthorized" }
  }

  const { projectId, organizationId } = params

  // Verify permissions
  if (projectId) {
    const isInvalid = await verifyAdminStatus(projectId, userId)
    if (isInvalid?.error) {
      return { error: isInvalid.error }
    }
  } else if (organizationId) {
    const isInvalid = await verifyOrganizationAdmin(organizationId, userId)
    if (isInvalid?.error) {
      return { error: isInvalid.error }
    }
  } else {
    return { error: "Project or organization ID required" }
  }

  try {
    const form = await getLatestDraftForm({ projectId, organizationId })
    return { form }
  } catch (error) {
    console.error("Error getting latest draft form:", error)
    return { error: "Failed to get latest draft form" }
  }
}

// Cancel a grant eligibility form
export async function cancelGrantEligibilityForm(formId: string) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { error: "Unauthorized" }
  }

  try {
    const form = await withChangelogTracking(async (tx) => {
      const form = await tx.grantEligibility.findUnique({
        where: { id: formId },
      })

      if (!form) {
        throw new Error("Form not found")
      }

      const formStatus = getGrantEligibilityFormStatus(form)
      if (formStatus !== GrantEligibilityFormStatus.DRAFT) {
        throw new Error("Can only cancel draft forms")
      }

      // Verify permissions
      if (form.projectId) {
        const isInvalid = await verifyAdminStatus(form.projectId, userId)
        if (isInvalid?.error) {
          throw new Error(isInvalid.error)
        }
      } else if (form.organizationId) {
        const isInvalid = await verifyOrganizationAdmin(form.organizationId, userId)
        if (isInvalid?.error) {
          throw new Error(isInvalid.error)
        }
      }

      // Mark form as deleted
      await tx.grantEligibility.update({
        where: { id: formId },
        data: {
          deletedAt: new Date(),
        },
      })

      return form
    })

    if (form.projectId) {
      revalidatePath(`/projects/${form.projectId}/grant-address`)
    } else if (form.organizationId) {
      revalidatePath(`/profile/organizations/${form.organizationId}/grant-address`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error canceling grant eligibility form:", error)
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Failed to cancel form" }
  }
}

// Clear/reset a grant eligibility form to initial state
export async function clearGrantEligibilityForm(formId: string) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { error: "Unauthorized" }
  }

  try {
    const result = await withChangelogTracking(async (tx) => {
      const form = await tx.grantEligibility.findUnique({
        where: { id: formId },
        include: {
          kycTeam: true,
        },
      })

      if (!form) {
        throw new Error("Form not found")
      }

      const formStatus = getGrantEligibilityFormStatus(form)
      if (formStatus !== GrantEligibilityFormStatus.DRAFT) {
        throw new Error("Can only clear draft forms")
      }

      // Verify permissions
      if (form.projectId) {
        const isInvalid = await verifyAdminStatus(form.projectId, userId)
        if (isInvalid?.error) {
          throw new Error(isInvalid.error)
        }
      } else if (form.organizationId) {
        const isInvalid = await verifyOrganizationAdmin(form.organizationId, userId)
        if (isInvalid?.error) {
          throw new Error(isInvalid.error)
        }
      }

      // Delete associated KYC team if it exists
      if (form.kycTeamId && form.kycTeam) {
        await tx.kYCTeam.delete({
          where: { id: form.kycTeamId },
        })
      }

      // Reset form to initial state
      const clearedForm = await tx.grantEligibility.update({
        where: { id: formId },
        data: {
          currentStep: 1,
          grantType: null,
          walletAddress: null,
          kycTeamId: null,
          attestations: Prisma.DbNull,
          data: {
            signers: [],
            entities: [],
          },
          expiresAt: getGrantEligibilityExpiration(),
        },
      })

      return clearedForm
    })

    // Revalidate paths
    revalidatePath(`/grant-eligibility/${formId}`)
    if (result.projectId) {
      revalidatePath(`/projects/${result.projectId}/grant-address`)
    } else if (result.organizationId) {
      revalidatePath(`/profile/organizations/${result.organizationId}/grant-address`)
    }

    return { success: true, form: result }
  } catch (error) {
    console.error("Error clearing grant eligibility form:", error)
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Failed to clear form" }
  }
}