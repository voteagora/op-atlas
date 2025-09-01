"use server"

import { auth } from "@/auth"
import { prisma } from "@/db/client"
import { GrantType, Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { sendKYCStartedEmail, sendKYBStartedEmail } from "./emails"

import { getGrantEligibilityFormStatus, GrantEligibilityFormStatus } from "@/lib/utils/grantEligibilityFormStatus"
import { verifyAdminStatus, verifyOrganizationAdmin } from "./utils"
import { getLatestDraftForm } from "@/db/grantEligibility"

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
    // Check for existing draft forms
    const existingDrafts = await prisma.grantEligibility.findMany({
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
    const form = await prisma.grantEligibility.create({
      data: {
        currentStep: 1,
        projectId,
        organizationId,
        grantType,
        data: {
          signers: [],
          entities: []
        },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })

    // Create initial changelog entry
    await prisma.grantEligibilityChangelog.create({
      data: {
        formId: form.id,
        action: "created",
        performedBy: userId,
        newData: {
          currentStep: form.currentStep,
          projectId,
          organizationId,
        },
      },
    })

    if (projectId) {
      revalidatePath(`/projects/${projectId}/grant-address`)
    } else if (organizationId) {
      revalidatePath(`/profile/organizations/${organizationId}/grant-address`)
    }

    return { form }
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
    // Get existing form
    const existingForm = await prisma.grantEligibility.findUnique({
      where: { id: formId },
    })

    if (!existingForm) {
      return { error: "Form not found" }
    }

    const formStatus = getGrantEligibilityFormStatus(existingForm)
    if (formStatus !== GrantEligibilityFormStatus.DRAFT) {
      return { error: "Can only update draft forms" }
    }

    // Verify permissions
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
    const form = await prisma.grantEligibility.update({
      where: { id: formId },
      data: {
        currentStep: updates.currentStep ?? existingForm.currentStep,
        grantType: updates.grantType ?? existingForm.grantType,
        walletAddress: updates.walletAddress ?? existingForm.walletAddress,
        kycTeamId: updates.kycTeamId ?? existingForm.kycTeamId,
        attestations: attestationsValue,
        data: updatedData,
      },
    })

    // Log changes if step completed
    const shouldLogChange = 
      updates.currentStep && 
      updates.currentStep > (existingForm.currentStep || 1)

    if (shouldLogChange) {
      await prisma.grantEligibilityChangelog.create({
        data: {
          formId: form.id,
          action: "saved",
          performedBy: userId,
          oldData: {
            currentStep: existingForm.currentStep,
            grantType: existingForm.grantType,
            walletAddress: existingForm.walletAddress,
          },
          newData: {
            currentStep: form.currentStep,
            grantType: form.grantType,
            walletAddress: form.walletAddress,
          },
        },
      })
    }

    if (existingForm.projectId) {
      revalidatePath(`/projects/${existingForm.projectId}/grant-eligibility/${formId}`)
    } else if (existingForm.organizationId) {
      revalidatePath(`/profile/organizations/${existingForm.organizationId}/grant-eligibility/${formId}`)
    }

    return { form }
  } catch (error) {
    console.error("Error updating grant eligibility form:", error)
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
    // Get existing form
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

    // Verify permissions
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
    const formData = existingForm.data as any || {}
    const signers = formData.signers || []
    const entities = formData.entities || []

    // Update form with submittedAt and final attestations
    const updatedForm = await prisma.grantEligibility.update({
      where: { id: formId },
      data: {
        submittedAt: new Date(),
        attestations: {
          ...((existingForm.attestations as any) || {}),
          ...finalAttestations,
        },
      },
    })

    // Create KYCUser records and send emails
    const emailResults = []

    // Process signers (individual KYC)
    for (const signer of signers) {
      if (!signer.email || !signer.firstName || !signer.lastName) {
        console.warn("Skipping signer with incomplete data:", signer)
        continue
      }

      try {
        // Check if KYCUser already exists
        let kycUser = await prisma.kYCUser.findFirst({
          where: { email: signer.email.toLowerCase() },
        })

        if (!kycUser) {
          // Create new KYCUser for signer
          kycUser = await prisma.kYCUser.create({
            data: {
              email: signer.email.toLowerCase(),
              firstName: signer.firstName,
              lastName: signer.lastName,
              kycUserType: "USER",
              status: "PENDING",
              expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            },
          })
        }

        // Check if already linked to this KYC team
        const existingLink = await prisma.kYCUserTeams.findFirst({
          where: {
            kycUserId: kycUser.id,
            kycTeamId: existingForm.kycTeamId,
          },
        })

        if (!existingLink) {
          // Link to KYC team
          await prisma.kYCUserTeams.create({
            data: {
              kycUserId: kycUser.id,
              kycTeamId: existingForm.kycTeamId,
            },
          })
        }

        // Send KYC email
        const emailResult = await sendKYCStartedEmail(kycUser)
        emailResults.push({
          type: "KYC",
          user: `${signer.firstName} ${signer.lastName}`,
          email: signer.email,
          success: emailResult.success,
        })
      } catch (error) {
        console.error("Error processing signer:", signer, error)
        emailResults.push({
          type: "KYC",
          user: `${signer.firstName} ${signer.lastName}`,
          email: signer.email,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    // Process entities (business KYB)
    for (const entity of entities) {
      if (!entity.controllerEmail || !entity.controllerFirstName || !entity.controllerLastName || !entity.company) {
        console.warn("Skipping entity with incomplete data:", entity)
        continue
      }

      try {
        // Check if KYCUser already exists
        let kycUser = await prisma.kYCUser.findFirst({
          where: { email: entity.controllerEmail.toLowerCase() },
        })

        if (!kycUser) {
          // Create new KYCUser for entity controller
          kycUser = await prisma.kYCUser.create({
            data: {
              email: entity.controllerEmail.toLowerCase(),
              firstName: entity.controllerFirstName,
              lastName: entity.controllerLastName,
              businessName: entity.company,
              kycUserType: "LEGAL_ENTITY",
              status: "PENDING",
              expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            },
          })
        }

        // Check if already linked to this KYC team
        const existingLink = await prisma.kYCUserTeams.findFirst({
          where: {
            kycUserId: kycUser.id,
            kycTeamId: existingForm.kycTeamId,
          },
        })

        if (!existingLink) {
          // Link to KYC team
          await prisma.kYCUserTeams.create({
            data: {
              kycUserId: kycUser.id,
              kycTeamId: existingForm.kycTeamId,
            },
          })
        }

        // Send KYB email
        const emailResult = await sendKYBStartedEmail(kycUser)
        emailResults.push({
          type: "KYB",
          user: `${entity.controllerFirstName} ${entity.controllerLastName}`,
          email: entity.controllerEmail,
          company: entity.company,
          success: emailResult.success,
        })
      } catch (error) {
        console.error("Error processing entity:", entity, error)
        emailResults.push({
          type: "KYB",
          user: `${entity.controllerFirstName} ${entity.controllerLastName}`,
          email: entity.controllerEmail,
          company: entity.company,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    // Log submission in changelog
    await prisma.grantEligibilityChangelog.create({
      data: {
        formId: updatedForm.id,
        action: "submitted",
        performedBy: userId,
        newData: {
          submittedAt: updatedForm.submittedAt,
          attestations: finalAttestations,
          kycUsersCreated: signers.length + entities.length,
          emailResults,
        },
      },
    })

    // Revalidate paths
    if (existingForm.projectId) {
      revalidatePath(`/projects/${existingForm.projectId}/grant-address`)
      revalidatePath(`/projects/${existingForm.projectId}/grant-eligibility/${formId}`)
    } else if (existingForm.organizationId) {
      revalidatePath(`/profile/organizations/${existingForm.organizationId}/grant-address`)
      revalidatePath(`/profile/organizations/${existingForm.organizationId}/grant-eligibility/${formId}`)
    }

    // Check if any emails failed
    const failedEmails = emailResults.filter(r => !r.success)
    if (failedEmails.length > 0) {
      console.warn("Some KYC/KYB emails failed to send:", failedEmails)
      // Still return success but with a warning
      return { 
        success: true, 
        warning: `Form submitted successfully, but ${failedEmails.length} email(s) failed to send. The recipients may need to be contacted manually.` 
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error submitting grant eligibility form:", error)
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
    const form = await prisma.grantEligibility.findUnique({
      where: { id: formId },
    })

    if (!form) {
      return { error: "Form not found" }
    }

    const formStatus = getGrantEligibilityFormStatus(form)
    if (formStatus !== GrantEligibilityFormStatus.DRAFT) {
      return { error: "Can only cancel draft forms" }
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

    // Mark form as deleted
    await prisma.grantEligibility.update({
      where: { id: formId },
      data: {
        deletedAt: new Date(),
      },
    })

    // Log cancellation
    await prisma.grantEligibilityChangelog.create({
      data: {
        formId: form.id,
        action: "canceled",
        performedBy: userId,
      },
    })

    if (form.projectId) {
      revalidatePath(`/projects/${form.projectId}/grant-address`)
    } else if (form.organizationId) {
      revalidatePath(`/profile/organizations/${form.organizationId}/grant-address`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error canceling grant eligibility form:", error)
    return { error: "Failed to cancel form" }
  }
}