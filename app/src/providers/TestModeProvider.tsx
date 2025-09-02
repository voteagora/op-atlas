"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createConfig, WagmiProvider } from "wagmi"
import { mainnet, optimism, optimismSepolia, sepolia } from "viem/chains"
import { http } from "wagmi"

import { SafeContextProvider } from "@/providers/SafeContextProvider"

// Create a standard Wagmi config (not Privy-dependent)
export const testWagmiConfig = createConfig({
  chains: [mainnet, sepolia, optimismSepolia, optimism],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [optimismSepolia.id]: http(),
    [optimism.id]: http(),
  },
})

const TestModeProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={testWagmiConfig}>
        <SafeContextProvider>{children}</SafeContextProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}

export default TestModeProvider
