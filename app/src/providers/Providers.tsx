"use client"

import "@farcaster/auth-kit/styles.css"

import { AuthKitProvider } from "@farcaster/auth-kit"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionProvider } from "next-auth/react"

import { TooltipProvider } from "@/components/ui/tooltip"

import { AnalyticsProvider } from "./AnalyticsProvider"
import { DialogProvider } from "./DialogProvider"
import { LayoutWrapper } from "./LayoutProvider"

if (
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production" &&
  !process.env.NEXT_PUBLIC_APP_DOMAIN
) {
  throw new Error("Please define NEXT_PUBLIC_APP_DOMAIN in env.")
}

const farcasterDomain =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? process.env.NEXT_PUBLIC_APP_DOMAIN
    : process.env.NEXT_PUBLIC_VERCEL_URL

const farcasterConfig = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
  siweUri: `https://${farcasterDomain}`,
  domain: farcasterDomain,
}

const queryClient = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthKitProvider config={farcasterConfig}>
        <QueryClientProvider client={queryClient}>
          <AnalyticsProvider>
            <DialogProvider>
              <TooltipProvider>
                <LayoutWrapper>{children}</LayoutWrapper>
              </TooltipProvider>
            </DialogProvider>
          </AnalyticsProvider>
        </QueryClientProvider>
      </AuthKitProvider>
    </SessionProvider>
  )
}
