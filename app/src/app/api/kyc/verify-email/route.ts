import { NextRequest, NextResponse } from "next/server"
import { linkKYCToUser } from "@/lib/actions/userKyc"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.redirect(
        new URL("/profile/kyc?error=missing-token", request.url)
      )
    }

    // Verify and link KYC to user
    const result = await linkKYCToUser(token)

    if (result.success) {
      // Create a success page that shows the message and then redirects
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Email Verified - OP Atlas</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: #f9fafb;
              }
              .container {
                text-align: center;
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                max-width: 400px;
              }
              .success { color: #059669; }
              .loading { color: #6b7280; margin-top: 1rem; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="success">Email Verified Successfully!</h1>
              <p>Your KYC verification has been linked to your account.</p>
              <p class="loading">Redirecting you back to your profile...</p>
            </div>
            <script>
              setTimeout(() => {
                window.location.href = '/profile/kyc';
              }, 2000);
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      })
    } else {
      // Create an error page that shows the message and then redirects
      const errorMessage = result.error || "Unknown error occurred"
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Verification Error - OP Atlas</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: #f9fafb;
              }
              .container {
                text-align: center;
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                max-width: 400px;
              }
              .error { color: #dc2626; }
              .loading { color: #6b7280; margin-top: 1rem; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="error">Verification Failed</h1>
              <p>${errorMessage}</p>
              <p class="loading">Redirecting you back to try again...</p>
            </div>
            <script>
              setTimeout(() => {
                window.location.href = '/profile/kyc';
              }, 3000);
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      })
    }
  } catch (error) {
    console.error("Error in email verification endpoint:", error)
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Verification Error - OP Atlas</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #f9fafb;
            }
            .container {
              text-align: center;
              background: white;
              padding: 2rem;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              max-width: 400px;
            }
            .error { color: #dc2626; }
            .loading { color: #6b7280; margin-top: 1rem; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">Verification Failed</h1>
            <p>An unexpected error occurred during verification. Please try again.</p>
            <p class="loading">Redirecting you back to try again...</p>
          </div>
          <script>
            setTimeout(() => {
              window.location.href = '/profile/kyc';
            }, 3000);
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
}