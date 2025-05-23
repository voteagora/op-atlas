"use client"

import { usePrivy } from "@privy-io/react-auth"

import { AddressConnection } from "@/components/profile/AddressConnection"
import { useUser } from "@/hooks/db/useUser"
import { usePrivyLinkWallet } from "@/hooks/privy/usePrivyLinkWallet"
import { UserAddressSource } from "@/lib/types"

import { VerifiedAddress } from "./verified-address"

interface AddressData {
  address: string
  source: UserAddressSource | string
  primary: boolean
  isMismatched?: boolean
}

interface PrivyWallet {
  type: "wallet"
  address: string
  chainType: string
}

export function VerifiedAddressesContent({ userId }: { userId: string }) {
  const { user: privyUser } = usePrivy()
  const { user } = useUser({ id: userId, enabled: !!userId })

  const { unlinkWallet } = usePrivyLinkWallet(userId)

  const privyWallets = (privyUser?.linkedAccounts?.filter(
    (account) => account.type === "wallet" && account.chainType === "ethereum",
  ) || []) as PrivyWallet[]

  // In order to make the UI snappy, we display addresses from Privy as well as from the user object.
  // If an address does not appear in both places, we assume that we are dealing with an intermediate
  // state (deleting, updating, etc.) and gray out the address box.
  // This way, a user has a clear understanding of what is going on.

  const userAddressMap = new Set(
    user?.addresses?.map((addr) => addr.address.toLowerCase()) || [],
  )
  const allAddresses = new Map<string, AddressData>()

  // Add Privy addresses
  privyWallets.forEach((wallet) => {
    const address = wallet.address.toLowerCase()
    allAddresses.set(address, {
      address,
      source: "atlas",
      primary: false,
      isMismatched: !userAddressMap.has(address),
    })
  })

  // Add user addresses, updating existing entries if they exist
  user?.addresses?.forEach((addr) => {
    const address = addr.address.toLowerCase()
    const existing = allAddresses.get(address)
    if (existing) {
      // If address exists in both, it's not mismatched
      existing.isMismatched = false
      existing.primary = addr.primary
      existing.source = addr.source
    } else {
      allAddresses.set(address, {
        ...addr,
        address: address,
        isMismatched: true,
      })
    }
  })

  const renderAddresses = () => {
    const addresses = Array.from(allAddresses.values())

    if (addresses.length > 0) {
      return (
        <div className="flex flex-col gap-2">
          <div className="font-medium text-sm text-foreground">
            Your verified addresses
          </div>

          <div className="flex flex-col gap-2">
            {addresses.map(({ address, source, primary, isMismatched }) => (
              <div key={address} className={isMismatched ? "opacity-50" : ""}>
                <VerifiedAddress
                  address={address}
                  source={source as UserAddressSource}
                  primary={primary}
                  onRemove={unlinkWallet}
                  userId={userId}
                />
              </div>
            ))}
          </div>
        </div>
      )
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {renderAddresses()}

      {user && (
        <div className="flex items-center gap-2">
          <AddressConnection userId={user.id}>
            Verify {Boolean(user?.addresses.length) && "another "}address
          </AddressConnection>
        </div>
      )}
    </div>
  )
}
