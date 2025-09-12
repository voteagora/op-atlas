"use client"

import { PrivyProvider } from "@privy-io/react-auth"
import { createConfig, WagmiProvider } from "@privy-io/wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { mainnet, optimism, optimismSepolia, sepolia } from "viem/chains"
import { http } from "wagmi"

import { SafeContextProvider } from "@/providers/SafeContextProvider"
import { isTestMode } from "@/lib/auth/testMode"
import TestModeProvider from "@/providers/TestModeProvider"

export const privyWagmiConfig = createConfig({
  chains: [mainnet, sepolia, optimismSepolia, optimism],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [optimismSepolia.id]: http(),
    [optimism.id]: http(),
  },
})

const PrivyAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient()

  // In test mode, use the test provider that doesn't depend on Privy
  if (isTestMode()) {
    return <TestModeProvider>{children}</TestModeProvider>
  }

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
        externalWallets: {
          signatureRequestTimeouts: {
            safe: 600000,
            wallet_connect: 600000,
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={privyWagmiConfig}>
          <SafeContextProvider>{children}</SafeContextProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}

export default PrivyAuthProvider
