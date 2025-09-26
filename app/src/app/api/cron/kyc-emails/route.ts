import { NextRequest } from "next/server"

import { prisma } from "@/db/client"
import { withCronObservability } from "@/lib/cron"
import { sendKYBReminderEmail, sendKYCApprovedEmail, sendKYBApprovedEmail } from "@/lib/actions/emails"
import { sendKYCReminderEmail } from "@/lib/actions/emails"

export const maxDuration = 300
export const dynamic = "force-dynamic"
export const revalidate = 0

const MONITOR_SLUG = "cron-kyc-emails"
// Only send reminder and approval emails to KYCUsers created after this date
const EMAIL_START_DATE = new Date('2025-09-15')

async function handleKYCEmailsCron(request: NextRequest) {
  const results = {
    remindersSent: 0,
    approvalsSent: 0,
    errors: [] as string[]
  }

  try {
    console.log("🔍 Processing KYC/KYB reminder emails...")
    
    const threshold = new Date()
    threshold.setDate(threshold.getDate() - 7)
    
    const reminderCandidates = await prisma.kYCUser.findMany({
      where: {
        status: 'PENDING',
        personaStatus: { in: ['created', 'pending', 'needs_review'] },
        createdAt: { 
          lte: threshold,
          gte: EMAIL_START_DATE
        },
        EmailNotifications: {
          none: {
            type: 'KYCB_REMINDER'
          }
        }
      },
      take: 500
    })

    console.log(`Found ${reminderCandidates.length} reminder candidates`)

    for (const user of reminderCandidates) {
      try {
        // Double-check to prevent race conditions
        const alreadySent = await prisma.emailNotification.findFirst({
          where: { kycUserId: user.id, type: 'KYCB_REMINDER' }
        })

        if (!alreadySent) {
          const isKYB = user.kycUserType === 'LEGAL_ENTITY' || !!user.businessName
          
          console.log(`Sending ${isKYB ? 'KYB' : 'KYC'} reminder to ${user.email}`)
          
          const result = isKYB 
            ? await sendKYBReminderEmail(user, { bypassAuth: true })
            : await sendKYCReminderEmail(user, { bypassAuth: true })
            
          if (result.success) {
            results.remindersSent++
          } else {
            results.errors.push(`Reminder failed for ${user.email}: ${result.error}`)
          }
        }
      } catch (error) {
        results.errors.push(`Reminder error for ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Process approval notifications
    console.log("🔍 Processing KYC/KYB approval notifications...")
    
    const approvalCandidates = await prisma.kYCUser.findMany({
      where: {
        status: 'APPROVED',
        createdAt: {
          gte: EMAIL_START_DATE
        },
        EmailNotifications: {
          none: {
            type: 'KYCB_APPROVED'
          }
        }
      },
      take: 500
    })

    console.log(`Found ${approvalCandidates.length} approval candidates`)

    for (const user of approvalCandidates) {
      try {
        // Double-check to prevent race conditions
        const alreadySent = await prisma.emailNotification.findFirst({
          where: { kycUserId: user.id, type: 'KYCB_APPROVED' }
        })

        if (!alreadySent) {
          const isKYB = user.kycUserType === 'LEGAL_ENTITY' || !!user.businessName
          
          console.log(`Sending ${isKYB ? 'KYB' : 'KYC'} approval to ${user.email}`)
          
          const result = isKYB
            ? await sendKYBApprovedEmail(user)
            : await sendKYCApprovedEmail(user)
            
          if (result.success) {
            results.approvalsSent++
          } else {
            results.errors.push(`Approval failed for ${user.email}: ${result.error}`)
          }
        }
      } catch (error) {
        results.errors.push(`Approval error for ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

  } catch (error) {
    results.errors.push(`General error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  console.log("📧 KYC Email Cron Results:", results)

  return Response.json({
    status: "KYC/KYB email processing completed",
    remindersSent: results.remindersSent,
    approvalsSent: results.approvalsSent,
    errors: results.errors,
    errorCount: results.errors.length
  })
}

export const GET = withCronObservability(handleKYCEmailsCron, {
  monitorSlug: MONITOR_SLUG,
  requireAuth: true,
})