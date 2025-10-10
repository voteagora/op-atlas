import { KYCUser, User } from "@prisma/client"

type KYCUserWithRelations = KYCUser & {
  KYCUserTeams?: any[]
  UserKYCUsers?: { user: User }[]
}

// Helper function to get display name with fallbacks
function getDisplayName(kycUser: KYCUserWithRelations): string {
  if (kycUser.firstName) {
    return kycUser.firstName
  }

  // Try to get name from linked User
  if (kycUser.UserKYCUsers && kycUser.UserKYCUsers.length > 0) {
    const linkedUser = kycUser.UserKYCUsers[0].user
    if (linkedUser?.name) {
      return linkedUser.name
    }
  }

  // Final fallback
  return "Optimist"
}

// Helper function to check if KYCUser is orphaned (no KYCTeam)
function isOrphanedKYCUser(kycUser: KYCUserWithRelations): boolean {
  return !kycUser.KYCUserTeams || kycUser.KYCUserTeams.length === 0
}

// =============================================================================
// KYC EMAIL TEMPLATES
// =============================================================================

// Template for KYC started email
export function getKYCEmailTemplate(
  kycUser: KYCUserWithRelations,
  kycLink: string,
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://atlas.optimism.io/assets/images/sunny_default.png" alt="Sunny Logo" style="width: 120px; height: auto;"/>
    </div>

    <h1 style="color: #333; text-align: center; margin: 0 0 40px 0; font-size: 24px;">Hi ${getDisplayName(
      kycUser,
    )}, ${
    isOrphanedKYCUser(kycUser)
      ? "please complete the following steps to verify your identity"
      : "Congratulations on applying for your Optimism Grant! 🎉"
  }</h1>

    <p style="font-size: 16px; margin-bottom: 40px;">${
      isOrphanedKYCUser(kycUser)
        ? "To verify your identity within Optimism Atlas, please complete this quick KYC (Know Your Customer) process."
        : "To receive your OP tokens, we need you to complete a quick KYC (Know Your Customer) verification for your project. This is a standard security procedure that helps us ensure proper distribution of rewards."
    }</p>

    <p style="font-size: 16px;">Complete your verification in 3 easy steps:</p>
    <ol style="font-size: 16px; padding-left: 0; margin-left: 0; list-style-position: inside;">
        <li>Click the secure verification link below</li>
        <li>Upload the requested documents</li>
        <li>Submit your information</li>
    </ol>

    <p style="font-size: 16px; margin-bottom: 40px;">Most users complete this process in under 10 minutes. Your information is securely handled according to our privacy policy.</p>

    <div style="text-align: center; margin-bottom: 24px;">
        <a href="${kycLink}" style="background-color: #FF0420; color: white; padding: 10px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">Complete KYC Verification Now</a>
    </div>

    <p style="text-align: center; font-size: 16px; margin-bottom: 40px;">Link expires in 7 days.</p>

    <p style="font-size: 16px;">Questions or need assistance? Contact our support team via <a href="mailto:compliance@optimism.io" style="color: black; text-decoration: underline;">compliance@optimism.io</a>.</p>

    <p style="font-size: 16px; margin-bottom: 24px;">Stay Optimistic,<br>The Optimism Team</p>

    <div style="padding-bottom: 48px; margin-top: 18px; border-top: 1px solid #e0e0e0;"></div>
    <div style="text-align: center;">
        <img src="https://atlas.optimism.io/assets/icons/optimism_logo_email.png" alt="OP Atlas Logo" style="width: 132px; height: auto;"/>
    </div>
</div>
    `
}

// Template for KYC reminder email
export function getKYCReminderEmailTemplate(
  kycUser: KYCUserWithRelations,
  kycLink: string,
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://atlas.optimism.io/assets/images/sunny_default.png" alt="Sunny Logo" style="width: 120px; height: auto;"/>
    </div>

    <h1 style="color: #333; text-align: center; margin: 0 0 40px 0; font-size: 24px;">Hi ${getDisplayName(
      kycUser,
    )}, ${
    isOrphanedKYCUser(kycUser)
      ? "you haven't completed your KYC verification yet"
      : "You haven't completed KYC verification for your Optimism grant yet"
  }</h1>

    <p style="font-size: 16px;">Finish your verification in a few quick steps:</p>

    <ol style="font-size: 16px; padding-left: 0; margin-left: 0; list-style-position: inside;">
        <li>Click the link below to return to the verification portal.</li>
        <li>Upload any remaining documents and add any missing details.</li>
        <li>Submit your verification once everything looks good.</li>
    </ol>

    <p style="font-size: 16px; margin-bottom: 40px;">Your information is handled securely in line with our <a href="https://www.optimism.io/data-privacy-policy" style="color: black; text-decoration: underline;">Privacy Policy</a>.</p>

    <div style="text-align: center; margin-bottom: 24px;">
        <a href="${kycLink}" style="background-color: #FF0420; color: white; padding: 10px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">Complete KYC Verification Now</a>
    </div>

    <p style="text-align: center; font-size: 16px; margin-bottom: 40px;">Link expires in 7 days.</p>

    <p style="font-size: 16px;">Need help? You can find answers to common questions in our <a href="https://kyc.optimism.io/faq" style="color: black; text-decoration: underline;">KYC FAQs</a>. If you still need a hand, our support team is happy to help — simply email <a href="mailto:compliance@optimism.io" style="color: black; text-decoration: underline;">compliance@optimism.io</a>, and someone from the team will be in touch shortly.</p>

    <p style="font-size: 16px; margin-bottom: 24px;">Stay Optimistic,<br>The Optimism Team</p>

    <div style="padding-bottom: 48px; margin-top: 18px; border-top: 1px solid #e0e0e0;"></div>
    <div style="text-align: center;">
        <img src="https://atlas.optimism.io/assets/icons/optimism_logo_email.png" alt="OP Atlas Logo" style="width: 132px; height: auto;"/>
    </div>
</div>
    `
}

export function getKYCApprovedEmailTemplate(
  kycUser: KYCUserWithRelations,
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://atlas.optimism.io/assets/images/sunny_default.png" alt="Sunny Logo" style="width: 120px; height: auto;"/>
    </div>

    <h1 style="color: #333; text-align: center; margin: 0 0 40px 0; font-size: 24px;">Thank you for completing KYC!</h1>

    <p style="font-size: 16px; margin-bottom: 24px;">${
      isOrphanedKYCUser(kycUser)
        ? "You should see your verification status update in Optimism Atlas within the next few days."
        : "In the coming days, the team will be in touch regarding next steps in your grant award and disbursement process. Keep an eye on your inbox!"
    }</p>

    <p style="font-size: 16px; margin-bottom: 24px;">Questions or need support? Check our <a href="https://kyc.optimism.io/faq" style="color: black; text-decoration: underline;">FAQs</a> or reach out to our team via <a href="mailto:compliance@optimism.io" style="color: black; text-decoration: underline;">compliance@optimism.io</a> —we're here to help.</p>

    <p style="font-size: 16px; margin-bottom: 24px;">Thank you for being part of the Optimism ecosystem 💫</p>

    <p style="font-size: 16px;">— The Optimism Team</p>

    <div style="text-align: center; margin: 40px 0;">
        <a href="https://atlas.optimism.io" style="background-color: #FF0420; color: white; padding: 10px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">Go to Optimism Atlas</a>
    </div>

    <div style="padding-bottom: 48px; margin-top: 18px; border-top: 1px solid #e0e0e0;"></div>
    <div style="text-align: center;">
        <img src="https://atlas.optimism.io/assets/icons/optimism_logo_email.png" alt="OP Atlas Logo" style="width: 132px; height: auto;"/>
    </div>
</div>
    `
}

export function getKYCEmailVerificationTemplate(
  firstName: string,
  verificationLink: string,
): string {
  const displayName = firstName || "Optimist"
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://atlas.optimism.io/assets/images/sunny_default.png" alt="Sunny Logo" style="width: 120px; height: auto;"/>
    </div>

    <h1 style="color: #333; text-align: center; margin: 0 0 40px 0; font-size: 24px;">Hi ${displayName}, Verify your email to link your KYC verification</h1>

    <p style="font-size: 16px; margin-bottom: 40px;">We found an existing KYC verification associated with this email address. To link it to your Optimism Atlas account, please verify that you own this email address.</p>

    <p style="font-size: 16px;">Click the button below to verify your email and link your KYC verification:</p>

    <div style="text-align: center; margin: 40px 0;">
        <a href="${verificationLink}" style="background-color: #FF0420; color: white; padding: 10px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">Verify Email & Link KYC</a>
    </div>

    <p style="text-align: center; font-size: 16px; margin-bottom: 40px;">This link expires in 7 days.</p>

    <p style="font-size: 16px;">Once verified, your existing KYC status will be available in your Optimism Atlas profile, and you won't need to complete the verification process again.</p>

    <p style="font-size: 16px;">Questions or need assistance? Contact our support team via <a href="mailto:compliance@optimism.io" style="color: black; text-decoration: underline;">compliance@optimism.io</a>.</p>

    <p style="font-size: 16px; margin-bottom: 24px;">Stay Optimistic,<br>The Optimism Team</p>

    <div style="padding-bottom: 48px; margin-top: 18px; border-top: 1px solid #e0e0e0;"></div>
    <div style="text-align: center;">
        <img src="https://atlas.optimism.io/assets/icons/optimism_logo_email.png" alt="OP Atlas Logo" style="width: 132px; height: auto;"/>
    </div>
</div>
    `
}

export function getFindMyKYCVerificationTemplate(
  verificationCode: string,
): string {
  const digits = verificationCode.split("")
  const digitWidth = 42
  const digitHeight = 42
  const borderWidth = 1
  const selectAllStyles =
    "cursor: text; user-select: all; -webkit-user-select: all; -moz-user-select: all; -ms-user-select: all;"
  const digitCells = digits
    .map(
      (digit) =>
        `<td style="padding: 0;"><div style="width: ${digitWidth}px; height: ${digitHeight}px; border: ${borderWidth}px solid #E0E2EB; border-radius: 8px; background-color: #FFFFFF; font-size: 14px; font-weight: 500; line-height: ${digitHeight}px; text-align: center; ${selectAllStyles}">${digit}</div></td>`,
    )
    .join("")

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://atlas.optimism.io/assets/images/sunny_default.png" alt="Sunny Logo" style="width: 120px; height: auto;"/>
    </div>

    <h1 style="color: #333; text-align: center; margin: 0 0 40px 0; font-size: 24px;">Use this code to confirm your email</h1>

    <p style="font-size: 16px; text-align: center; margin-bottom: 40px;">Please confirm your email in Optimism Atlas, then we'll search for your existing KYC record.</p>

    <div style="text-align: center; margin: 40px 0;">
        <table role="presentation" cellpadding="0" cellspacing="8" style="margin: 0 auto; border-collapse: separate; ${selectAllStyles}">
            <tr>
                ${digitCells}
            </tr>
        </table>

        <p style="font-size: 12px; color: #6B7280; text-align: center; margin-top: 8px; margin-bottom: 0;">Select the code above and press Ctrl+C (or Cmd+C on Mac) to copy.</p>
    </div>

    <p style="font-size: 16px;">Questions or need assistance? Contact our support team via <a href="mailto:compliance@optimism.io" style="color: black; text-decoration: underline;">compliance@optimism.io</a>.</p>

    <p style="font-size: 16px; margin-bottom: 24px;">Stay Optimistic,<br>The Optimism Team</p>

    <div style="padding-bottom: 48px; margin-top: 18px; border-top: 1px solid #e0e0e0;"></div>
    <div style="text-align: center;">
        <img src="https://atlas.optimism.io/assets/icons/optimism_logo_email.png" alt="OP Atlas Logo" style="width: 132px; height: auto;"/>
    </div>
</div>
    `
}

// =============================================================================
// KYB EMAIL TEMPLATES
// =============================================================================

// Template for business KYB users
export function getKYBEmailTemplate(params: {
  firstName: string
  businessName: string
  kycLink: string
}): string {
  const displayName = params.firstName || "Optimist"
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://atlas.optimism.io/assets/images/sunny_default.png" alt="Sunny Logo" style="width: 120px; height: auto;"/>
    </div>

    <h1 style="color: #333; text-align: center; margin: 0 0 40px 0; font-size: 24px;">Hi ${displayName}, Congratulations on applying for your Optimism Grant! 🎉</h1>

    <p style="font-size: 16px; margin-bottom: 40px;">To receive your OP tokens, we need you to complete a quick KYB (Know Your Business) verification for <strong>${params.businessName}</strong>. This is a standard security procedure that helps us ensure proper distribution of rewards.</p>

    <p style="font-size: 16px;">Complete your verification in 3 easy steps:</p>
    <ol style="font-size: 16px; padding-left: 0; margin-left: 0; list-style-position: inside;">
        <li>Click the secure verification link below</li>
        <li>Upload the requested documents</li>
        <li>Submit your information</li>
    </ol>

    <p style="font-size: 16px; margin-bottom: 40px;">Most users complete this process in under 10 minutes. Your information is securely handled according to our privacy policy.</p>

    <div style="text-align: center; margin-bottom: 24px;">
        <a href="${params.kycLink}" style="background-color: #FF0420; color: white; padding: 10px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">Complete KYB Verification Now</a>
    </div>

    <p style="text-align: center; font-size: 16px; margin-bottom: 40px;">Link expires in 7 days.</p>

    <p style="font-size: 16px;">Questions or need assistance? Contact our support team via <a href="mailto:compliance@optimism.io" style="color: black; text-decoration: underline;">compliance@optimism.io</a>.</p>

    <p style="font-size: 16px; margin-bottom: 24px;">Stay Optimistic,<br>The Optimism Team</p>

    <div style="padding-bottom: 48px; margin-top: 18px; border-top: 1px solid #e0e0e0;"></div>
    <div style="text-align: center;">
        <img src="https://atlas.optimism.io/assets/icons/optimism_logo_email.png" alt="OP Atlas Logo" style="width: 132px; height: auto;"/>
    </div>
</div>
    `
}

// Template for KYB reminder email
export function getKYBReminderEmailTemplate(params: {
  firstName: string
  kycLink: string
}): string {
  const displayName = params.firstName || "Optimist"
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://atlas.optimism.io/assets/images/sunny_default.png" alt="Sunny Logo" style="width: 120px; height: auto;"/>
    </div>

    <h1 style="color: #333; text-align: center; margin: 0 0 40px 0; font-size: 24px;">Hi ${displayName}, You haven't completed KYB verification for your Optimism grant yet</h1>

    <p style="font-size: 16px;">Finish your verification in a few quick steps:</p>

    <ol style="font-size: 16px; padding-left: 0; margin-left: 0; list-style-position: inside;">
        <li>Click the link below to return to the verification portal.</li>
        <li>Upload any remaining documents and add any missing details.</li>
        <li>Submit your verification once everything looks good.</li>
    </ol>

    <p style="font-size: 16px; margin-bottom: 40px;">Your information is handled securely in line with our <a href="https://www.optimism.io/data-privacy-policy" style="color: black; text-decoration: underline;">Privacy Policy</a>.</p>

    <div style="text-align: center; margin-bottom: 24px;">
        <a href="${params.kycLink}" style="background-color: #FF0420; color: white; padding: 10px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">Complete KYB Verification Now</a>
    </div>

    <p style="text-align: center; font-size: 16px; margin-bottom: 40px;">Link expires in 7 days.</p>

    <p style="font-size: 16px;">Need help? You can find answers to common questions in our <a href="https://kyc.optimism.io/faq" style="color: black; text-decoration: underline;">KYB FAQs</a>. If you still need a hand, our support team is happy to help — simply email <a href="mailto:compliance@optimism.io" style="color: black; text-decoration: underline;">compliance@optimism.io</a>, and someone from the team will be in touch shortly.</p>

    <p style="font-size: 16px; margin-bottom: 24px;">Stay Optimistic,<br>The Optimism Team</p>

    <div style="padding-bottom: 48px; margin-top: 18px; border-top: 1px solid #e0e0e0;"></div>
    <div style="text-align: center;">
        <img src="https://atlas.optimism.io/assets/icons/optimism_logo_email.png" alt="OP Atlas Logo" style="width: 132px; height: auto;"/>
    </div>
</div>
    `
}

export function getKYBApprovedEmailTemplate(firstName: string): string {
  const displayName = firstName || "Optimist"
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://atlas.optimism.io/assets/images/sunny_default.png" alt="Sunny Logo" style="width: 120px; height: auto;"/>
    </div>

    <h1 style="color: #333; text-align: center; margin: 0 0 40px 0; font-size: 24px;">Thank you for completing KYB!</h1>

    <p style="font-size: 16px; margin-bottom: 24px;">In the coming days, the team will be in touch regarding next steps in your grant award and disbursement process. Keep an eye on your inbox!</p>

    <p style="font-size: 16px; margin-bottom: 24px;">Questions or need support? Check our <a href="https://kyc.optimism.io/faq" style="color: black; text-decoration: underline;">FAQs</a> or reach out to our team via <a href="mailto:compliance@optimism.io" style="color: black; text-decoration: underline;">compliance@optimism.io</a> —we're here to help.</p>

    <p style="font-size: 16px; margin-bottom: 24px;">Thank you for being part of the Optimism ecosystem 💫</p>

    <p style="font-size: 16px;">— The Optimism Team</p>

    <div style="text-align: center; margin: 40px 0;">
        <a href="https://atlas.optimism.io" style="background-color: #FF0420; color: white; padding: 10px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">Go to Optimism Atlas</a>
    </div>

    <div style="padding-bottom: 48px; margin-top: 18px; border-top: 1px solid #e0e0e0;"></div>
    <div style="text-align: center;">
        <img src="https://atlas.optimism.io/assets/icons/optimism_logo_email.png" alt="OP Atlas Logo" style="width: 132px; height: auto;"/>
    </div>
</div>
    `
}
