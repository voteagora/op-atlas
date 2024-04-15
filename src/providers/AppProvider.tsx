"use client"

import { AuthKitProvider } from "@farcaster/auth-kit"
import "@farcaster/auth-kit/styles.css"

if (!process.env.NEXT_PUBLIC_APP_DOMAIN) {
  throw new Error("Please define NEXT_PUBLIC_APP_DOMAIN in env.")
}

const config = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
  siweUri: process.env.NEXT_PUBLIC_APP_DOMAIN,
  domain: process.env.NEXT_PUBLIC_APP_DOMAIN,
}

export default function AppProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AuthKitProvider config={config}>{children}</AuthKitProvider>
}
