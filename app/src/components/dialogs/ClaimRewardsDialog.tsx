import Image from "next/image"

import { Button } from "@/components/common/Button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

import { DialogProps } from "./types"

export default function ClaimRewardsDialog(props: DialogProps<object>) {
  return (
    <Dialog {...props}>
      <DialogContent className="w-[458px] h-[280px] flex flex-col items-center justify-center text-center">
        <Image
          src={"/assets/icons/sunny-stars-custom-gimp-edit.svg"}
          alt="Sunny Logo"
          width={64}
          height={64}
        />
        <div className="space-y-2">
          <h4 className="font-semibold text-xl text-text-default">
            We’re still working on that
          </h4>
          <p className="text-secondary-foreground text-base font-normal">
            You’ll be able to claim your rewards after April 8th. Thank you for
            your patience!
          </p>
        </div>
        <Button
          className="w-full mt-2"
          onClick={() => props.onOpenChange(false)}
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  )
}
