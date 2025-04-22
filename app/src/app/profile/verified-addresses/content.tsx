"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/common/Button"
import {
  deleteUserAddress,
  syncFarcasterAddresses,
} from "@/lib/actions/addresses"
import { UserAddressSource, UserWithAddresses } from "@/lib/types"

import { AddAddress } from "@/components/profile/AddAddress"
import { syncPrivyUser } from "@/db/users"
import { usePrivy } from "@privy-io/react-auth"
import { VerifiedAddress } from "./verified-address"

export function VerifiedAddressesContent({
  user,
}: {
  user: UserWithAddresses
}) {

  const { unlinkWallet } = usePrivy()
  const [loading, setLoading] = useState(false)

  const onCopy = (address: string) => {
    navigator.clipboard.writeText(address)
    toast.success("Address copied")
  }

  const onSyncFarcaster = async () => {
    if (loading) {
      return
    }

    setLoading(true)

    const promise: Promise<UserWithAddresses | null> = new Promise(
      async (resolve, reject) => {
        try {
          const result = await syncFarcasterAddresses()
          if (result.error !== null) {
            throw result.error
          }

          resolve(result.user)
        } catch (error: unknown) {
          console.error("Error syncing Farcaster addresses", error)
          reject(error)
        }
      },
    )

    toast.promise(promise, {
      loading: "Syncing Farcaster addresses",
      success: () => {
        setLoading(false)
        return "Farcaster addresses synced"
      },
      error: () => {
        setLoading(false)
        return "Error syncing Farcaster addresses"
      },
    })
  }


  const handleWalletUnlink = (address: string) => {
    toast.promise(unlinkWallet(address), {
      loading: "Deleting wallet address...",
      success: (updatedPrivyUser) => {
        syncPrivyUser(updatedPrivyUser)
        return "Wallet address deleted successfully"
      },
      error: "Failed to delete wallet address",
    })
  }

  const onRemove = async (address: string) => {
    if (loading) {
      return
    }

    setLoading(true)

    try {
      const result = await deleteUserAddress(address)
      if (result.error !== null) {
        throw result.error
      }
      toast.success("Address removed")
    } catch (error: unknown) {
      toast.error("Error removing address, please try again")
    } finally {
      setLoading(false)
    }
  }

  const hasAddress = Boolean(user.addresses.length)

  return (
    <div className="flex flex-col gap-6 text-secondary-foreground">
      <h2 className="text-foreground text-2xl font-semibold">
        Verified addresses
      </h2>
      <div className="text-secondary-foreground">
        Add a proof of ownership of an Ethereum address to your public profile,
        so ENS and attestations can be displayed. Required for Badgeholders.
      </div>
      {hasAddress && (
        <div className="flex flex-col gap-2">
          <div className="font-medium text-sm text-foreground">
            Your verified addresses
          </div>
          {user.addresses.map(({ address, source, primary }) => (
            <VerifiedAddress
              key={address}
              address={address}
              source={source as UserAddressSource}
              primary={primary}
              onCopy={onCopy}
              onRemove={() => source === "privy" ? handleWalletUnlink(address) : onRemove(address)}
            />
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <AddAddress>
          Verify {hasAddress && "another "}address
        </AddAddress>


        {user?.farcasterId && (
          <Button onClick={onSyncFarcaster} variant="secondary">
            Import from Farcaster
          </Button>
        )}
      </div>
    </div>
  )
}
