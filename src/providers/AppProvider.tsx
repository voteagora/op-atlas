"use client"

import { AuthKitProvider } from "@farcaster/auth-kit"
import "@farcaster/auth-kit/styles.css"

if (!process.env.NEXT_PUBLIC_VERCEL_URL) {
  throw new Error("Please define NEXT_PUBLIC_VERCEL_URL in env.")
}

const config = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
  siweUri: `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
  domain: process.env.NEXT_PUBLIC_VERCEL_URL,
}

export default function AppProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AuthKitProvider config={config}>{children}</AuthKitProvider>
}
