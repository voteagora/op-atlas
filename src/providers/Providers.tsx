"use client"

import "@farcaster/auth-kit/styles.css"

import { AuthKitProvider } from "@farcaster/auth-kit"
import { SessionProvider } from "next-auth/react"

import { AnalyticsProvider } from "./AnalyticsProvider"
import { DialogProvider } from "./DialogProvider"
import { LayoutWrapper } from "./LayoutProvider"

if (!process.env.NEXT_PUBLIC_VERCEL_URL) {
  throw new Error("Please define NEXT_PUBLIC_VERCEL_URL in env.")
}

const farcasterConfig = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
  siweUri: "https://retrofunding.optimism.io/",
  domain: "https://retrofunding.optimism.io/",
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
