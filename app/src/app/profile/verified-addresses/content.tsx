"use client"

import { usePrivy } from "@privy-io/react-auth"
import { useState } from "react"
import { toast } from "sonner"

import { AddressConnection } from "@/components/profile/AddressConnection"
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/db/useUser"
import { usePrivyLinkWallet } from "@/hooks/privy/usePrivyLinkWallet"
import { UserAddressSource } from "@/lib/types"

import { removeSafeAddressAction } from "./actions"
import {
  SafeAddressRow,
  VerifiedAddress,
  VerifySafeAddressDialog,
} from "./verified-address"

export interface AddressData {
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
  const { user, invalidate: invalidateUser } = useUser({
    id: userId,
    enabled: !!userId,
  })

  const { unlinkWallet } = usePrivyLinkWallet(userId)
  const [isSafeDialogOpen, setIsSafeDialogOpen] = useState(false)

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
          <div className="text-foreground text-base font-medium mt-4 mb-2">
            Your wallets
          </div>

          <div className="flex flex-col gap-2">
            {addresses.map(({ address, source, primary }) => (
              <div key={address}>
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

  const handleRemoveSafeAddress = (address: string) => {
    const promise = removeSafeAddressAction(address).then((res) => {
      if (res.error) {
        throw new Error(res.error)
      }
      return invalidateUser()
    })

    toast.promise(promise, {
      loading: "Removing Safe address...",
      success: "Safe address removed",
      error: (err) => err.message ?? "Failed to remove Safe address",
    })
  }

  const safeAddresses = user?.safeAddresses ?? []

  const handleSafeAddressVerified = async (_safeAddress: string) => {
    await invalidateUser()
  }

  return (
    <div className="flex flex-col gap-2">
      {renderAddresses()}
      {user && (
        <div className="flex items-center gap-2 mb-6">
          <AddressConnection userId={user.id}>
            Link {Boolean(user?.addresses.length) && "another "}wallet
          </AddressConnection>
        </div>
      )}

      {user && (
        <div className="flex flex-col gap-0.5 mt-2">
          <div className="flex items-center justify-between">
            <span className="text-foreground text-base font-medium mt-0.5">
              Safe address for Top 100 Delegates
            </span>
          </div>

          {safeAddresses.length === 0 ? (
            <p className="text-sm text-muted-foreground mt-0">
              Add an Optimism Safe address you control to participate in
              elections as a Top 100 delegate.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {safeAddresses.map((entry) => (
                <SafeAddressRow
                  key={entry.id}
                  address={entry.safeAddress}
                  onRemove={handleRemoveSafeAddress}
                />
              ))}
            </div>
          )}
          {safeAddresses.length === 0 && (
            <Button
              className="button-secondary w-fit mt-3"
              onClick={() => setIsSafeDialogOpen(true)}
            >
              Verify
            </Button>
          )}
        </div>
      )}

      <VerifySafeAddressDialog
        open={isSafeDialogOpen}
        onOpenChange={setIsSafeDialogOpen}
        onVerified={handleSafeAddressVerified}
        allAddresses={allAddresses}
      />
    </div>
  )
}
