"use client"

import { addRpcUrlOverrideToChain, PrivyProvider } from "@privy-io/react-auth"
import { createConfig, WagmiProvider } from "@privy-io/wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { mainnet, optimism, optimismSepolia, sepolia } from "viem/chains"
import { http } from "wagmi"

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY

const mainnetRpc = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
const sepoliaRpc = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
const optimismRpc = `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
const optimismSepoliaRpc = `https://opt-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`

const mainnetOverride = addRpcUrlOverrideToChain(mainnet, mainnetRpc)

const sepoliaOverride = addRpcUrlOverrideToChain(sepolia, sepoliaRpc)

const optimismOverride = addRpcUrlOverrideToChain(optimism, optimismRpc)

const optimismSepoliaOverride = addRpcUrlOverrideToChain(
  optimismSepolia,
  optimismSepoliaRpc,
)

export const privyWagmiConfig = createConfig({
  chains: [
    mainnetOverride,
    sepoliaOverride,
    optimismSepoliaOverride,
    optimismOverride,
  ],
  transports: {
    [mainnet.id]: http(mainnetRpc),
    [sepolia.id]: http(sepoliaRpc),
    [optimismSepolia.id]: http(optimismSepoliaRpc),
    [optimism.id]: http(optimismRpc),
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
        supportedChains: [
          mainnetOverride,
          sepoliaOverride,
          optimismSepoliaOverride,
          optimismOverride,
        ],
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
