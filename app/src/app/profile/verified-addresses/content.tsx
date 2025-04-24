"use client"

import { toast } from "sonner"

import { UserAddressSource } from "@/lib/types"

import { AddressConnection } from "@/components/profile/AddressConnection"
import { syncPrivyUser } from "@/db/privy"
import { useUser } from "@/hooks/useUser"
import { usePrivy } from "@privy-io/react-auth"
import { useQueryClient } from "@tanstack/react-query"
import { Session } from "next-auth"
import { VerifiedAddress } from "./verified-address"
import { makeUserAddressPrimaryAction } from "./actions"
import { Skeleton } from "@/components/ui/skeleton"

export function VerifiedAddressesContent({
  session
}: {
  session: Session
}) {

  const { unlinkWallet } = usePrivy()
  const { user } = useUser({ id: session.user.id, enabled: !!session.user })

  const queryClient = useQueryClient()

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

  if (!user) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="font-medium text-sm text-foreground">
            Your verified addresses
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-[40px] w-full" />
            <Skeleton className="h-[40px] w-full" />
          </div>
        </div>
      </div>
    )
  }

  const hasAddress = Boolean(user?.addresses.length)


  return (
    <div className="flex flex-col gap-6">
      {hasAddress && (
        <div className="flex flex-col gap-2">
          <div className="font-medium text-sm text-foreground">
            Your verified addresses
          </div>

          {user && <div className="flex flex-col gap-2">
            {user.addresses.map(({ address, source, primary }) => (
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
          }
        </div>
      )}

      <div className="flex items-center gap-2">
        <AddressConnection user={user}>
          Verify {hasAddress && "another "}address
        </AddressConnection>
      </div>
    </div>
  )
}
