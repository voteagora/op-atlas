"use client"

import { PrivyProvider } from "@privy-io/react-auth"
import { createConfig, WagmiProvider } from "@privy-io/wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { mainnet, sepolia, optimismSepolia, optimism } from "viem/chains"
import { http } from "wagmi"
import { addRpcUrlOverrideToChain } from "@privy-io/chains"

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY

const optimismOverride = addRpcUrlOverrideToChain(
  optimism,
  `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
)

const optimismSepoliaOverride = addRpcUrlOverrideToChain(
  optimismSepolia,
  `https://opt-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
)

export const privyWagmiConfig = createConfig({
  chains: [mainnet, sepolia, optimismSepolia, optimism],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [optimismSepolia.id]: http(`https://opt-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
    [optimism.id]: http(`https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
  },
})

const PrivyAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  if (!appId) {
    throw new Error("Missing NEXT_PUBLIC_PRIVY_APP_ID environment variable")
  }

  const queryClient = new QueryClient()

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
        supportedChains: [mainnet, sepolia, optimismSepoliaOverride, optimismOverride],
        externalWallets: {
          signatureRequestTimeouts: {
            safe: 600000,
            wallet_connect: 600000,
          },
        },        
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={privyWagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}

export default PrivyAuthProvider
