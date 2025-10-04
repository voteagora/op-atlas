"use client"

import { DialogProps } from "@/components/dialogs/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useAppDialogs } from "@/providers/DialogProvider"

interface KYCEmailVerificationData {
  email: string
  isNewUser: boolean
}

function KYCEmailVerificationDialog({ open, onOpenChange }: DialogProps<object>) {
  const { data } = useAppDialogs()
  const kycData = data as KYCEmailVerificationData

  const handleDismiss = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="flex flex-col text-center">
          <div className="font-semibold text-xl mb-2">Check your email</div>

          <div className="text-base text-muted-foreground mb-6">
            {kycData?.isNewUser ? (
              <>
                A message from compliance@optimism.io has been sent to {kycData.email}. Please complete KYC via the link provided and allow 48 hours for your status to update.
              </>
            ) : (
              <>
                KYC verification successfully found for this email! Your existing verification has been linked to your account.
              </>
            )}
          </div>

          <Button
            onClick={handleDismiss}
            variant="destructive"
            size={"lg"}
            className="w-full text-base"
          >
            Dismiss
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default KYCEmailVerificationDialog