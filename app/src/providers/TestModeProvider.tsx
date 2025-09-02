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

// Test-safe version of SafeContextProvider that doesn't use Privy hooks
const TestSafeContextProvider = ({ children }: { children: React.ReactNode }) => {
  // In test mode, we don't need real Safe wallet functionality
  // Just provide a minimal context that won't cause errors
  return <>{children}</>
}

const TestModeProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={testWagmiConfig}>
        <TestSafeContextProvider>{children}</TestSafeContextProvider>
      </WagmiProvider>
    </QueryClientProvider>
  )
}

export default TestModeProvider
