"use client"

import { toast } from "sonner"

import { UserAddressSource, UserWithAddresses } from "@/lib/types"

import { AddAddress } from "@/components/profile/AddAddress"
import { syncPrivyUser } from "@/db/privy"
import { usePrivy } from "@privy-io/react-auth"
import { VerifiedAddress } from "./verified-address"

export function VerifiedAddressesContent({
  user,
}: {
  user: UserWithAddresses
}) {

  const { unlinkWallet } = usePrivy()

  const onCopy = (address: string) => {
    navigator.clipboard.writeText(address)
    toast.success("Address copied")
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
              onRemove={handleWalletUnlink}
            />
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <AddAddress>
          Verify {hasAddress && "another "}address
        </AddAddress>
      </div>
    </div>
  )
}
