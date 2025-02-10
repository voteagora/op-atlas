import { Button } from "@/components/common/Button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

import { DialogProps } from "./types"

export default function NotRecognizedAddressDialog(props: DialogProps<object>) {
  return (
    <Dialog {...props}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col text-center">
            <h3>I don&apos;t recognize this address</h3>
            <p className="text-secondary-foreground mt-2">
              This is likely your Farcaster custody address, which for most
              people is managed via the Warpcast app.
            </p>
          </div>
        </div>
        <Button className="w-full" onClick={() => props.onOpenChange(false)}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  )
}
