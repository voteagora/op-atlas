"use client"

import "@farcaster/auth-kit/styles.css"

import { SignInButton, StatusAPIResponse } from "@farcaster/auth-kit"
import { getCsrfToken, signIn, signOut, useSession } from "next-auth/react"
import { useCallback, useState } from "react"

export default function Page() {
  const [error, setError] = useState(false)

  const getNonce = useCallback(async () => {
    const nonce = await getCsrfToken()
    if (!nonce) throw new Error("Unable to generate nonce")
    return nonce
  }, [])

  const handleSuccess = useCallback(
    (res: StatusAPIResponse) => {
      signIn("credentials", {
        message: res.message,
        signature: res.signature,
        name: res.username,
        pfp: res.pfpUrl,
        redirect: false,
      })
    },
    [signIn],
  )

  return (
    <div>
      <div style={{ position: "fixed", top: "12px", right: "12px" }}>
        <SignInButton
          nonce={getNonce}
          onSuccess={handleSuccess}
          onError={() => setError(true)}
          onSignOut={() => signOut()}
        />
        {error && <div>Unable to sign in at this time.</div>}
      </div>
      <div>
        <Profile />
      </div>
    </div>
  )
}

function Profile() {
  const { data: session } = useSession()

  return session ? (
    <div style={{ fontFamily: "sans-serif" }}>
      <p>Signed in as {session.user?.name}</p>
      <p>
        <button
          type="button"
          style={{ padding: "6px 12px", cursor: "pointer" }}
          onClick={() => signOut()}
        >
          Click here to sign out
        </button>
      </p>
    </div>
  ) : (
    <p>
      Click the `Sign in with Farcaster`` button above, then scan the QR code to
      sign in.
    </p>
  )
}
