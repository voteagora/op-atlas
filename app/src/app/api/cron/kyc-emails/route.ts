import { NextRequest } from "next/server"

import { prisma } from "@/db/client"
import { withCronObservability } from "@/lib/cron"
import {
  sendKYBReminderEmail,
  sendKYCApprovedEmail,
  sendKYBApprovedEmail,
  sendKYCReminderEmail,
} from "@/lib/actions/emails"

export const maxDuration = 300
export const dynamic = "force-dynamic"
export const revalidate = 0

const MONITOR_SLUG = "cron-kyc-emails"
// Only send reminder and approval emails to KYCUsers created after this date
const EMAIL_START_DATE = new Date("2025-09-15")

async function handleKYCEmailsCron(request: NextRequest) {
  const results = {
    remindersSent: 0,
    approvalsSent: 0,
    errors: [] as string[],
  }

  try {
    console.log("🔍 Processing KYC reminder emails...")

    const threshold = new Date()
    threshold.setDate(threshold.getDate() - 7)

    // Process KYC (individual) reminders
    const kycReminderCandidates = await prisma.kYCUser.findMany({
      where: {
        status: "PENDING",
        personaStatus: { in: ["created", "pending", "needs_review"] },
        createdAt: {
          lte: threshold,
          gte: EMAIL_START_DATE,
        },
      },
      include: {
        KYCUserTeams: true,
        UserKYCUsers: {
          include: {
            user: true
          }
        }
      },
      take: 500
    })

    console.log(`Found ${kycReminderCandidates.length} KYC reminder candidates`)

    for (const user of kycReminderCandidates) {
      try {
        // Double-check to prevent race conditions
        const alreadySent = await prisma.emailNotification.findFirst({
          where: { referenceId: user.personaReferenceId || user.id, type: "KYCB_REMINDER" },
        })

        if (!alreadySent) {
          console.log(`Sending KYC reminder to ${user.email}`)

          const result = await sendKYCReminderEmail(user, { bypassAuth: true })

          if (result.success) {
            results.remindersSent++
          } else {
            results.errors.push(
              `KYC reminder failed for ${user.email}: ${result.error}`,
            )
          }
        }
      } catch (error) {
        results.errors.push(
          `KYC reminder error for ${user.email}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        )
      }
    }

    // Process KYB (business/legal entity) reminders
    console.log("🔍 Processing KYB reminder emails...")

    const kybReminderCandidates = await prisma.kYCLegalEntity.findMany({
      where: {
        status: "PENDING",
        createdAt: {
          lte: threshold,
          gte: EMAIL_START_DATE,
        },
      },
      include: {
        kycLegalEntityController: true,
      },
      take: 500
    })

    console.log(`Found ${kybReminderCandidates.length} KYB reminder candidates`)

    for (const entity of kybReminderCandidates) {
      try {
        if (!entity.kycLegalEntityController) {
          console.warn(`Skipping legal entity ${entity.id} - no controller`)
          continue
        }

        // Double-check to prevent race conditions
        const alreadySent = await prisma.emailNotification.findFirst({
          where: { referenceId: entity.personaReferenceId || entity.id, type: "KYCB_REMINDER" },
        })

        if (!alreadySent) {
          console.log(`Sending KYB reminder to ${entity.kycLegalEntityController.email} for ${entity.name}`)

          const result = await sendKYBReminderEmail(entity as any, {
            bypassAuth: true,
          })

          if (result.success) {
            results.remindersSent++
          } else {
            results.errors.push(
              `KYB reminder failed for ${entity.name}: ${result.error}`,
            )
          }
        }
      } catch (error) {
        results.errors.push(
          `KYB reminder error for ${entity.name}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        )
      }
    }

    // Process KYC approval notifications
    console.log("🔍 Processing KYC approval notifications...")

    const kycApprovalCandidates = await prisma.kYCUser.findMany({
      where: {
        status: "APPROVED",
        createdAt: {
          gte: EMAIL_START_DATE,
        },
      },
      include: {
        KYCUserTeams: true,
        UserKYCUsers: {
          include: {
            user: true
          }
        }
      },
      take: 500
    })

    console.log(`Found ${kycApprovalCandidates.length} KYC approval candidates`)

    for (const user of kycApprovalCandidates) {
      try {
        // Double-check to prevent race conditions
        const alreadySent = await prisma.emailNotification.findFirst({
          where: { referenceId: user.personaReferenceId || user.id, type: "KYCB_APPROVED" },
        })

        if (!alreadySent) {
          console.log(`Sending KYC approval to ${user.email}`)

          const result = await sendKYCApprovedEmail(user)

          if (result.success) {
            results.approvalsSent++
          } else {
            results.errors.push(
              `KYC approval failed for ${user.email}: ${result.error}`,
            )
          }
        }
      } catch (error) {
        results.errors.push(
          `KYC approval error for ${user.email}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        )
      }
    }

    // Process KYB approval notifications
    console.log("🔍 Processing KYB approval notifications...")

    const kybApprovalCandidates = await prisma.kYCLegalEntity.findMany({
      where: {
        status: "APPROVED",
        createdAt: {
          gte: EMAIL_START_DATE,
        },
      },
      include: {
        kycLegalEntityController: true,
      },
      take: 500
    })

    console.log(`Found ${kybApprovalCandidates.length} KYB approval candidates`)

    for (const entity of kybApprovalCandidates) {
      try {
        if (!entity.kycLegalEntityController) {
          console.warn(`Skipping legal entity ${entity.id} - no controller`)
          continue
        }

        // Double-check to prevent race conditions
        const alreadySent = await prisma.emailNotification.findFirst({
          where: { referenceId: entity.personaReferenceId || entity.id, type: "KYCB_APPROVED" },
        })

        if (!alreadySent) {
          console.log(`Sending KYB approval to ${entity.kycLegalEntityController.email} for ${entity.name}`)

          const result = await sendKYBApprovedEmail(
            entity.kycLegalEntityController.firstName,
            entity.kycLegalEntityController.email,
            entity.personaReferenceId || entity.id
          )

          if (result.success) {
            results.approvalsSent++
          } else {
            results.errors.push(
              `KYB approval failed for ${entity.name}: ${result.error}`,
            )
          }
        }
      } catch (error) {
        results.errors.push(
          `KYB approval error for ${entity.name}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        )
      }
    }
  } catch (error) {
    results.errors.push(
      `General error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    )
  }

  console.log("📧 KYC Email Cron Results:", results)

  return Response.json({
    status: "KYC/KYB email processing completed",
    remindersSent: results.remindersSent,
    approvalsSent: results.approvalsSent,
    errors: results.errors,
    errorCount: results.errors.length,
  })
}

export const GET = withCronObservability(handleKYCEmailsCron, {
  monitorSlug: MONITOR_SLUG,
  requireAuth: true,
})
