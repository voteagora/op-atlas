import { PrimaryAddress } from "@/app/profile/verified-addresses/primary-address"
import { DialogProps } from "@/components/dialogs/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useUser } from "@/hooks/db/useUser"
import { usePrivyLinkWallet } from "@/hooks/privy/usePrivyLinkWallet"
import { UserAddressSource } from "@/lib/types"

interface GovernanceAddressDialogProps extends DialogProps<object> {
  userId: string
}

function GovernanceAddressDialog({
  userId,
  ...props
}: GovernanceAddressDialogProps) {
  const { user } = useUser({
    id: userId,
    enabled: true,
  })

  const { linkWallet } = usePrivyLinkWallet(userId)

  if (!user) {
    return null
  }

  return (
    <Dialog {...props}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 text-center">
            <div className="font-semibold">Governance Wallet</div>
            <div className="text-sm text-muted-foreground">
              Optimism will issue a citizen badge to the wallet of your choice.
            </div>
          </div>

          <div className="flex flex-col gap-2 text-center">
            {user.addresses.map(({ address, source, primary }) => (
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
            type="button"
            variant="destructive"
          >
            Add another wallet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default GovernanceAddressDialog
