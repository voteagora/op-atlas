"use client"

import { PrivyProvider } from "@privy-io/react-auth"
import { createConfig, WagmiProvider } from "@privy-io/wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { mainnet, sepolia, optimismSepolia, optimism } from "viem/chains"
import { http } from "wagmi"

export const privyWagmiConfig = createConfig({
  chains: [mainnet, sepolia, optimismSepolia, optimism], // Pass your required chains as an array
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [optimismSepolia.id]: http(),
    [optimism.id]: http(),

    // For each of your required chains, add an entry to `transports` with
    // a key of the chain's `id` and a value of `http()`
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
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={privyWagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}

export default PrivyAuthProvider
