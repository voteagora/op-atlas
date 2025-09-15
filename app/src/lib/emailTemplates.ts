import { KYCUser } from "@prisma/client"

// Template for KYC started email
export function getKYCEmailTemplate(kycUser: KYCUser, kycLink: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://atlas.optimism.io/assets/images/sunny_default.png" alt="Sunny Logo" style="width: 120px; height: auto;"/>
    </div>

    <h1 style="color: #333; text-align: center; margin: 0 0 40px 0; font-size: 24px;">Hi ${kycUser.firstName},<br>Congratulations on your Optimism Grant! 🎉</h1>
    
    <p style="font-size: 16px; margin-bottom: 40px;">To receive your OP tokens, we need you to complete a quick KYC (Know Your Customer) verification for your project. This is a standard security procedure that helps us ensure proper distribution of rewards.</p>
    
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
    
    <p style="font-size: 16px;">Stay Optimistic,<br>The Optimism Team</p>
    
    <div style="padding-bottom: 48px; margin-top: 18px; border-top: 1px solid #e0e0e0;"></div>
    <div style="text-align: center;">
        <img src="https://atlas.optimism.io/assets/icons/optimism_logo_email.png" alt="OP Atlas Logo" style="width: 264px; height: auto;"/>
    </div>
</div>
    `
}

// Template for KYC reminder email
export function getKYCReminderEmailTemplate(kycUser: KYCUser, kycLink: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://atlas.optimism.io/assets/images/sunny_default.png" alt="Sunny Logo" style="width: 120px; height: auto;"/>
    </div>

    <h1 style="color: #333; text-align: center; margin: 0 0 40px 0; font-size: 24px;">Hi ${kycUser.firstName},<br>You haven't completed KYC verification for your Optimism grant yet</h1>
    
    <p style="font-size: 16px;">Your verification is just a few steps away:</p>
    
    <ol style="font-size: 16px; padding-left: 0; margin-left: 0; list-style-position: inside;">
        <li>Return to the verification portal using the link below</li>
        <li>Complete any remaining document uploads or information fields</li>
        <li>Submit your completed verification</li>
    </ol>
    
    <p style="font-size: 16px; margin-bottom: 40px;">Your information is securely handled according to our privacy policy.</p>
    
    <div style="text-align: center; margin-bottom: 24px;">
        <a href="${kycLink}" style="background-color: #FF0420; color: white; padding: 10px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">Complete KYC Verification Now</a>
    </div>
    
    <p style="text-align: center; font-size: 16px; margin-bottom: 40px;">Link expires in 7 days.</p>
    
    <p style="font-size: 16px;">Need help? Check KYC <a href="https://kyc.optimism.io/faq" style="color: black; text-decoration: underline;">FAQs</a>. Our support team are also happy to assist you. If you have any questions or run into issues, feel free to reach out to us via <a href="mailto:compliance@optimism.io" style="color: black; text-decoration: underline;">compliance@optimism.io</a>. We are happy to help!</p>
    
    <p style="font-size: 16px;">Stay Optimistic,<br>The Optimism Team</p>
    
    <div style="padding-bottom: 48px; margin-top: 18px; border-top: 1px solid #e0e0e0;"></div>
    <div style="text-align: center;">
        <img src="https://atlas.optimism.io/assets/icons/optimism_logo_email.png" alt="OP Atlas Logo" style="width: 264px; height: auto;"/>
    </div>
</div>
    `
}

// Template for KYB reminder email
export function getKYBReminderEmailTemplate(kycUser: KYCUser, kycLink: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://atlas.optimism.io/assets/images/sunny_default.png" alt="Sunny Logo" style="width: 120px; height: auto;"/>
    </div>

    <h1 style="color: #333; text-align: center; margin: 0 0 40px 0; font-size: 24px;">Hi ${kycUser.firstName},<br>You haven't completed KYB verification for your Optimism grant yet</h1>
    
    <p style="font-size: 16px;">Your verification is just a few steps away:</p>
    
    <ol style="font-size: 16px; padding-left: 0; margin-left: 0; list-style-position: inside;">
        <li>Return to the verification portal using the link below</li>
        <li>Complete any remaining document uploads or information fields</li>
        <li>Submit your completed verification</li>
    </ol>
    
    <p style="font-size: 16px; margin-bottom: 40px;">Your information is securely handled according to our privacy policy.</p>
    
    <div style="text-align: center; margin-bottom: 24px;">
        <a href="${kycLink}" style="background-color: #FF0420; color: white; padding: 10px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">Complete KYB Verification Now</a>
    </div>
    
    <p style="text-align: center; font-size: 16px; margin-bottom: 40px;">Link expires in 7 days.</p>
    
    <p style="font-size: 16px;">Need help? Check KYB <a href="https://kyc.optimism.io/faq" style="color: black; text-decoration: underline;">FAQs</a>. Our support team are also happy to assist you. If you have any questions or run into issues, feel free to reach out to us via <a href="mailto:compliance@optimism.io" style="color: black; text-decoration: underline;">compliance@optimism.io</a>. We are happy to help!</p>
    
    <p style="font-size: 16px;">Stay Optimistic,<br>The Optimism Team</p>
    
    <div style="padding-bottom: 48px; margin-top: 18px; border-top: 1px solid #e0e0e0;"></div>
    <div style="text-align: center;">
        <img src="https://atlas.optimism.io/assets/icons/optimism_logo_email.png" alt="OP Atlas Logo" style="width: 264px; height: auto;"/>
    </div>
</div>
    `
}

// Template for business KYB users
export function getKYBEmailTemplate(kycUser: KYCUser, kycLink: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://atlas.optimism.io/assets/images/sunny_default.png" alt="Sunny Logo" style="width: 120px; height: auto;"/>
    </div>

    <h1 style="color: #333; text-align: center; margin: 0 0 40px 0; font-size: 24px;">Hi ${kycUser.firstName},<br>Congratulations on your Optimism Grant! 🎉</h1>
    
    <p style="font-size: 16px; margin-bottom: 40px;">To receive your OP tokens, we need you to complete a quick KYB (Know Your Business) verification for <strong>${kycUser.businessName}</strong>. This is a standard security procedure that helps us ensure proper distribution of rewards.</p>
    
    <p style="font-size: 16px;">Complete your verification in 3 easy steps:</p>
    <ol style="font-size: 16px; padding-left: 0; margin-left: 0; list-style-position: inside;">
        <li>Click the secure verification link below</li>
        <li>Upload the requested documents</li>
        <li>Submit your information</li>
    </ol>
    
    <p style="font-size: 16px; margin-bottom: 40px;">Most users complete this process in under 10 minutes. Your information is securely handled according to our privacy policy.</p>
    
    <div style="text-align: center; margin-bottom: 24px;">
        <a href="${kycLink}" style="background-color: #FF0420; color: white; padding: 10px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">Complete KYB Verification Now</a>
    </div>
    
    <p style="text-align: center; font-size: 16px; margin-bottom: 40px;">Link expires in 7 days.</p>
    
    <p style="font-size: 16px;">Questions or need assistance? Contact our support team via <a href="mailto:compliance@optimism.io" style="color: black; text-decoration: underline;">compliance@optimism.io</a>.</p>
    
    <p style="font-size: 16px;">Stay Optimistic,<br>The Optimism Team</p>
    
    <div style="padding-bottom: 48px; margin-top: 18px; border-top: 1px solid #e0e0e0;"></div>
    <div style="text-align: center;">
        <img src="https://atlas.optimism.io/assets/icons/optimism_logo_email.png" alt="OP Atlas Logo" style="width: 264px; height: auto;"/>
    </div>
</div>
    `
}

export function getKYCApprovedEmailTemplate(kycUser: KYCUser): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://atlas.optimism.io/assets/images/sunny_default.png" alt="Sunny Logo" style="width: 120px; height: auto;"/>
    </div>

    <h1 style="color: #333; text-align: center; margin: 0 0 40px 0; font-size: 24px;">Thank you for completing KYC!</h1>
    
    <p style="font-size: 16px; margin-bottom: 24px;">In the coming days, the team will be in touch regarding next steps in your grant award and disbursement process. Keep an eye on your inbox!</p>
    
    <p style="font-size: 16px; margin-bottom: 24px;">Questions or need support? Check our <a href="https://kyc.optimism.io/faq" style="color: black; text-decoration: underline;">FAQs</a> or reach out to our team via <a href="mailto:compliance@optimism.io" style="color: black; text-decoration: underline;">compliance@optimism.io</a> —we're here to help.</p>
    
    <p style="font-size: 16px; margin-bottom: 24px;">Thank you for being part of the Optimism ecosystem 💫</p>
    
    <p style="font-size: 16px;">— The Optimism Team</p>
    
    <div style="text-align: center; margin: 40px 0;">
        <a href="https://atlas.optimism.io" style="background-color: #FF0420; color: white; padding: 10px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">Go to Optimism Atlas</a>
    </div>
    
    <div style="padding-bottom: 48px; margin-top: 18px; border-top: 1px solid #e0e0e0;"></div>
    <div style="text-align: center;">
        <img src="https://atlas.optimism.io/assets/icons/optimism_logo_email.png" alt="OP Atlas Logo" style="width: 264px; height: auto;"/>
    </div>
</div>
    `
}

export function getKYBApprovedEmailTemplate(kycUser: KYCUser): string {
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
        <img src="https://atlas.optimism.io/assets/icons/optimism_logo_email.png" alt="OP Atlas Logo" style="width: 264px; height: auto;"/>
    </div>
</div>
    `
}