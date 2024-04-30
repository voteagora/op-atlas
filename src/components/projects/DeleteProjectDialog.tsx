import { useState } from "react"
import { DialogProps } from "../dialogs/types"
import { Button } from "../ui/button"
import { Dialog, DialogContent } from "../ui/dialog"

export function DeleteProjectDialog({
  open,
  onOpenChange,
  onConfirm,
}: DialogProps<{ onConfirm: () => void }>) {
  const [loading, setLoading] = useState(false)

  const onClick = () => {
    setLoading(true)
    onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-0.5 text-center items-center">
            <h3>Are you sure you want to delete this project?</h3>
            <div className="text-text-secondary">
              This action cannot be undone.
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              disabled={loading}
              type="button"
              variant="destructive"
              className="py-3"
              onClick={onClick}
            >
              Yes, delete this project
            </Button>
            <Button
              type="button"
              variant="outline"
              className="py-3"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
