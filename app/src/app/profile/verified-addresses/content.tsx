"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/common/Button"
import {
  deleteUserAddress,
  syncFarcasterAddresses,
} from "@/lib/actions/addresses"
import { isBadgeholderAddress } from "@/lib/badgeholders"
import { UserAddressSource, UserWithAddresses } from "@/lib/types"
import { useAppDialogs } from "@/providers/DialogProvider"

import { VerifiedAddress } from "./verified-address"

export function VerifiedAddressesContent({
  user,
}: {
  user: UserWithAddresses
}) {
  const { setOpenDialog } = useAppDialogs()

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
              isBadgeholder={isBadgeholderAddress(address)}
              onCopy={onCopy}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button onClick={() => setOpenDialog("verify_address")}>
          Verify {hasAddress && "another "}address
        </Button>

        <Button onClick={onSyncFarcaster} variant="secondary">
          Import from Farcaster
        </Button>
      </div>
    </div>
  )
}
