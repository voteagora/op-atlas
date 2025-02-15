import { toast } from "sonner"

import { copyToClipboard } from "@/lib/utils"

export const onCopy = async (value: string) => {
  try {
    await copyToClipboard(value)
    toast("Copied to clipboard")
  } catch (error) {
    toast.error("Error copying URL")
  }
}
