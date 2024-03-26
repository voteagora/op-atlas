"use client"
import { AuthKitProvider } from "@farcaster/auth-kit"
import "@farcaster/auth-kit/styles.css"
import type { Metadata } from "next"

const config = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
  siweUri: "http://example.com/login",
  domain: "example.com",
}

export const metadata: Metadata = {
  title: "OP Atlas",
  description: "",
}

export default function AppProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AuthKitProvider config={config}>{children}</AuthKitProvider>
}
