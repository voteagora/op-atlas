"use client"

import { PrivyProvider } from "@privy-io/react-auth"

const PrivyAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  if (!appId) {
    throw new Error("Missing NEXT_PUBLIC_PRIVY_APP_ID environment variable")
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["email", "farcaster", "wallet"],
        appearance: {
          theme: "light",
          accentColor: "#FF0420",
          logo: "/assets/images/welcome-privy.svg",
        },
      }}
    >
      {children}
    </PrivyProvider>
  )
}

export default PrivyAuthProvider
