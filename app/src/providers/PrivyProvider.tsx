"use client"

import { PrivyProvider as BaseProvider } from "@privy-io/react-auth"

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  if (!appId) {
    console.error("Please define NEXT_PUBLIC_PRIVY_APP_ID")
    return <>{children}</>
  }

  return (
    <BaseProvider
      appId={appId}
      config={{
        loginMethods: ["farcaster"],
        // Customize Privy's appearance in your app
        appearance: {
          theme: "light",
          accentColor: "#FF0420",
          logo: "https://atlas.optimism.io/assets/images/logo.svg",
        },
      }}
    >
      {children}
    </BaseProvider>
  )
}
