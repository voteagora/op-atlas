"use client"
import { AuthKitProvider } from "@farcaster/auth-kit"
import "@farcaster/auth-kit/styles.css"
import type { Metadata } from "next"

const config = {
  rpcUrl: "https://mainnet.optimism.io",
  domain: "example.com",
  siweUri: "https://example.com/login",
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
