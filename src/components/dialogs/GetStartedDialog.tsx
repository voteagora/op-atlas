import { Dialog, DialogContent } from "@/components/ui/dialog"

import { DialogProps } from "./types"

export function GetStartedDialog(props: DialogProps<object>) {
  return (
    <Dialog {...props}>
      <DialogContent>
        <div className="flex flex-col text-center">
          <h3>Apply for Retro Funding Round 4: Onchain Builders</h3>
          <div className="text-secondary-foreground">
            Create a profile and add projects, then you&apos;ll be able to apply
            for Retro Funding. Builders who are eligible for Round 4 have met
            the following criteria:
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
