import { copyToClipboard } from "@/lib/utils"
import { toast } from "sonner"

export const onCopy = async (value: string) => {
  try {
    await copyToClipboard(value)
    toast("Copied to clipboard")
  } catch (error) {
    toast.error("Error copying URL")
  }
}
