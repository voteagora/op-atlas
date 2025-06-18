import { useSession } from "next-auth/react"

import { PrimaryAddress } from "@/app/profile/verified-addresses/primary-address"
import { DialogProps } from "@/components/dialogs/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useUser } from "@/hooks/db/useUser"
import { usePrivyLinkWallet } from "@/hooks/privy/usePrivyLinkWallet"
import { UserAddressSource } from "@/lib/types"

function GovernanceAddressDialog({ open, onOpenChange }: DialogProps<object>) {
  const { data: session } = useSession()
  const userId = session?.user?.id ?? ""

  const { user } = useUser({ id: userId })
  const { linkWallet } = usePrivyLinkWallet(userId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <div className="font-semibold">Governance Wallet</div>
            <div className="text-sm text-muted-foreground">
              Optimism will issue a citizen badge to the wallet of your choice.
            </div>
          </div>

          <div className="flex flex-col gap-2 text-center">
            {user?.addresses.map(({ address, source, primary }) => (
              <PrimaryAddress
                key={address}
                address={address}
                primary={primary}
                showCheckmark={false}
                truncateAddress={true}
                source={source as UserAddressSource}
                userId={user.id}
              />
            ))}
          </div>

          <Button
            onClick={() => linkWallet()}
            className="button-primary w-full"
          >
            Add another wallet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default GovernanceAddressDialog
