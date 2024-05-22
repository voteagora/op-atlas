"use client"

import "@farcaster/auth-kit/styles.css"

import { AuthKitProvider } from "@farcaster/auth-kit"
import { SessionProvider } from "next-auth/react"

import { AnalyticsProvider } from "./AnalyticsProvider"
import { DialogProvider } from "./DialogProvider"
import { LayoutWrapper } from "./LayoutProvider"

if (
  process.env.NEXT_PUBLICVERCEL_ENV === "production" &&
  !process.env.NEXT_PUBLIC_APP_DOMAIN
) {
  throw new Error("Please define NEXT_PUBLIC_APP_DOMAIN in env.")
}

const farcasterDomain =
  process.env.NEXT_PUBLICVERCEL_ENV === "production"
    ? process.env.NEXT_PUBLIC_APP_DOMAIN
    : process.env.NEXT_PUBLIC_VERCEL_URL

const farcasterConfig = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
  siweUri: `https://${farcasterDomain}`,
  domain: farcasterDomain,
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthKitProvider config={farcasterConfig}>
        <AnalyticsProvider>
          <DialogProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </DialogProvider>
        </AnalyticsProvider>
      </AuthKitProvider>
    </SessionProvider>
  )
}
