"use client"

import { toast } from "sonner"

import { UserAddressSource } from "@/lib/types"

import { AddressConnection } from "@/components/profile/AddressConnection"
import { syncPrivyUser } from "@/db/privy"
import { useUser } from "@/hooks/useUser"
import { usePrivy } from "@privy-io/react-auth"
import { useQueryClient } from "@tanstack/react-query"
import { Session } from "next-auth"
import { makeUserAddressPrimaryAction } from "./actions"
import { VerifiedAddress } from "./verified-address"

interface AddressData {
  address: string
  source: UserAddressSource | string
  primary: boolean
}

export function VerifiedAddressesContent({
  session
}: {
  session: Session
}) {

  const { user: privyUser, unlinkWallet } = usePrivy()
  const { user } = useUser({ id: session.user.id, enabled: !!session.user })

  const queryClient = useQueryClient()


  const privyWallets = privyUser?.linkedAccounts?.filter(
    account => account.type === "wallet" && account.chainType === "ethereum"
  ) || []

  const walletAddresses = privyWallets.map((wallet: any) => ({
    address: wallet.address,
    source: "atlas",
    primary: false
  }))


  const onCopy = (address: string) => {
    navigator.clipboard.writeText(address)
    toast.success("Address copied")
  }

  const handleSetPrimary = (address: string) => {
    toast.promise(makeUserAddressPrimaryAction(address).then(() => {
      queryClient.invalidateQueries({ queryKey: ["user", user?.id] })
    }), {
      loading: "Setting primary address...",
      success: "Primary address set",
      error: "Failed to set primary address",
    })
  }

  const handleWalletUnlink = (address: string) => {
    toast.promise(unlinkWallet(address), {
      loading: "Deleting wallet address...",
      success: (updatedPrivyUser) => {
        syncPrivyUser(updatedPrivyUser).then(() => {
          queryClient.invalidateQueries({ queryKey: ["user", user?.id] })
        })
        return "Wallet address deleted successfully"
      },
      error: "Failed to delete wallet address",
    })
  }

  const renderAddresses = (addresses: AddressData[]) => {

    if (addresses.length > 0) {
      return <div className="flex flex-col gap-2">
        <div className="font-medium text-sm text-foreground">
          Your verified addresses
        </div>

        <div className="flex flex-col gap-2">
          {addresses.map(({ address, source, primary }) => (
            <VerifiedAddress
              key={address}
              address={address}
              source={source as UserAddressSource}
              primary={primary}
              onCopy={onCopy}
              onRemove={handleWalletUnlink}
              onSetPrimary={handleSetPrimary}
            />
          ))}
        </div>
      </div>
    }
  }


  return (
    <div className="flex flex-col gap-6">
      {user ? renderAddresses(user?.addresses) : renderAddresses(walletAddresses)}

      {user && (
        <div className="flex items-center gap-2">
          <AddressConnection user={user}>
            Verify {Boolean(user?.addresses.length) && "another "}address
          </AddressConnection>
        </div>
      )}
    </div>
  )
}
