"use client"
import { AuthKitProvider } from "@farcaster/auth-kit"
import "@farcaster/auth-kit/styles.css"

const config = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
  siweUri: window.location.href,
  domain: window.location.host,
}

export default function AppProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AuthKitProvider config={config}>{children}</AuthKitProvider>
}
