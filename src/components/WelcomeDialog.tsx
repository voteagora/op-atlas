"use client"
import { memo } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface IProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  handleButtonClick: () => void
}

const WelcomeDialog: React.FC<IProps> = ({
  open,
  onOpenChange,
  handleButtonClick,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center sm:max-w-md">
        <div className="px-2 py-0.5 text-base font-medium rounded-full bg-backgroundSecondary">
          Welcome
        </div>
        <div className="bg-backgroundaccent w-full rounded-xl h-36"></div>
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold text-text-default">
            Welcome to your Optimist Profile!
          </DialogTitle>
          <DialogDescription className="text-center text-base font-normal text-text-secondary mt-1">
            Start building your profile by adding or joining projects you’re
            involved in.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="w-full">
          <Button
            onClick={handleButtonClick}
            className="w-full"
            type="button"
            variant="destructive"
          >
            Let’s go
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default memo(WelcomeDialog)
