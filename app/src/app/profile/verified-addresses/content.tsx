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

type HookedUser = ReturnType<typeof useUser>["user"]
type InvalidateUser = ReturnType<typeof useUser>["invalidate"]

type VerifiedAddressesContentProps = {
  userId: string
  impersonationMode?: boolean
}

export function VerifiedAddressesContent({
  userId,
  impersonationMode = false,
}: VerifiedAddressesContentProps) {
  const {
    user,
    invalidate: invalidateUser,
  } = useUser({
    id: userId,
    enabled: !!userId,
  })

  if (!user) {
    return null
  }

  if (impersonationMode) {
    return <VerifiedAddressesReadOnly user={user} />
  }

  return (
    <VerifiedAddressesInteractive
      user={user}
      userId={userId}
      invalidateUser={invalidateUser}
    />
  )
}

const VerifiedAddressesReadOnly = ({ user }: { user: HookedUser }) => {
  const addresses = user?.addresses ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-muted-foreground">
        Wallet management is unavailable while impersonating another user. You
        can still view their linked wallets below.
      </div>
      {addresses.length ? (
        <ul className="space-y-2">
          {addresses.map((addr) => (
            <li
              key={addr.address}
              className="rounded-md border border-border px-3 py-2 text-sm"
            >
              <div className="font-medium break-all">{addr.address}</div>
              <div className="text-xs text-muted-foreground">
                {addr.primary ? "Governance address • " : ""}
                Source: {addr.source}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-muted-foreground">
          No wallets linked for this user.
        </div>
      )}
      {user?.safeAddresses?.length ? (
        <div className="mt-4">
          <div className="text-sm font-medium text-foreground mb-2">
            Safe addresses
          </div>
          <ul className="space-y-2">
            {user.safeAddresses.map((safe) => (
              <li
                key={safe.id}
                className="rounded-md border border-border px-3 py-2 text-sm break-all"
              >
                {safe.safeAddress}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

const VerifiedAddressesInteractive = ({
  user,
  userId,
  invalidateUser,
}: {
  user: HookedUser
  userId: string
  invalidateUser: InvalidateUser
}) => {
  const { user: privyUser } = usePrivy()
  const { unlinkWallet } = usePrivyLinkWallet(userId)
  const [isSafeDialogOpen, setIsSafeDialogOpen] = useState(false)

  const privyWallets = (privyUser?.linkedAccounts?.filter(
    (account) => account.type === "wallet" && account.chainType === "ethereum",
  ) || []) as PrivyWallet[]

  const userAddressMap = new Set(
    user?.addresses?.map((addr) => addr.address.toLowerCase()) || [],
  )
  const allAddresses = new Map<string, AddressData>()

  privyWallets.forEach((wallet) => {
    const address = wallet.address.toLowerCase()
    allAddresses.set(address, {
      address,
      source: "atlas",
      primary: false,
      isMismatched: !userAddressMap.has(address),
    })
  })

  user?.addresses?.forEach((addr) => {
    const address = addr.address.toLowerCase()
    const existing = allAddresses.get(address)
    if (existing) {
      existing.isMismatched = false
      existing.primary = addr.primary
      existing.source = addr.source
    } else {
      allAddresses.set(address, {
        ...addr,
        address,
        isMismatched: true,
      })
    }
  })

  const renderAddresses = () => {
    const addresses = Array.from(allAddresses.values())

    if (!addresses.length) return null

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
