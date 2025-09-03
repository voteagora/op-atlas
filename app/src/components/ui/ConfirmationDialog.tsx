import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "./button"
import { Dialog, DialogContent } from "./dialog"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "destructive" | "default"
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
}: ConfirmationDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      console.error("Error in confirmation action:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-0.5 text-center items-center">
            <h3>{title}</h3>
            {description && (
              <div className="text-text-secondary">{description}</div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              disabled={loading}
              type="button"
              variant={variant}
              className="py-3"
              onClick={handleConfirm}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmText}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="py-3"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {cancelText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}