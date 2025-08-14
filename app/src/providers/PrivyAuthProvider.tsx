"use client"

import { PrivyProvider } from "@privy-io/react-auth"
import { createConfig, WagmiProvider } from "@privy-io/wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { mainnet, optimism, optimismSepolia, sepolia } from "viem/chains"
import { http } from "wagmi"

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
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  const disablePrivy = process.env.NEXT_PUBLIC_E2E === "true" || !appId

  const queryClient = new QueryClient()

  return disablePrivy ? (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  ) : (
    <PrivyProvider
      appId={appId as string}
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
        <WagmiProvider config={privyWagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}

export default PrivyAuthProvider
