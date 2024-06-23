"use client"

import { User } from "@prisma/client"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { UserWithAddresses } from "@/lib/types"
import { useAppDialogs } from "@/providers/DialogProvider"

export function VerifiedAddressesContent({
  user,
}: {
  user: UserWithAddresses
}) {
  const { setOpenDialog } = useAppDialogs()

  const onCopy = (address: string) => () => {
    navigator.clipboard.writeText(address)
    toast.success("Address copied")
  }

  const hasAddress = Boolean(user.addresses.length)

  return (
    <div className="flex flex-col gap-6 text-secondary-foreground">
      <div className="text-foreground text-2xl font-semibold">
        Verified addresses
      </div>
      <div className="text-secondary-foreground">
        Add a proof of ownership of an Ethereum account to your public profile,
        so ENS and attestations can be displayed. Required for Badgeholders.
      </div>
      {hasAddress && (
        <div className="flex flex-col gap-2">
          <div className="font-medium text-sm text-foreground">
            Your verified addresses
          </div>
        </div>
      )}
      <Button
        className="self-start"
        onClick={() => setOpenDialog("verify_address")}
        variant="destructive"
      >
        Verify {hasAddress && "another "}address
      </Button>
    </div>
  )
}
