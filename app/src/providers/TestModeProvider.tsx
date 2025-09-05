"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createConfig, WagmiProvider } from "wagmi"
import { mainnet, optimism, optimismSepolia, sepolia } from "viem/chains"
import { http } from "wagmi"
import { createContext, useContext } from "react"

import type { SafeContextValue, SignerWallet } from "@/types/safe"
import { SafeContext } from "@/providers/SafeContextProvider"

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

// Test-safe version of SafeContextProvider that provides mock data
const TestSafeContextProvider = ({ children }: { children: React.ReactNode }) => {
  // Create a mock SafeContextValue that won't cause errors
  const mockSafeContextValue: SafeContextValue = {
    currentContext: "EOA",
    signerWallet: null,
    selectedSafeWallet: null,
    availableSafeWallets: [],
    isLoadingSafeWallets: false,
    error: null,
    switchToSafe: () => Promise.resolve(),
    switchToEOA: () => {},
    refreshSafeWallets: () => Promise.resolve(),
    isFeatureEnabled: () => true,
    clearError: () => {},
  }

  return (
    <SafeContext.Provider value={mockSafeContextValue}>
      {children}
    </SafeContext.Provider>
  )
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
