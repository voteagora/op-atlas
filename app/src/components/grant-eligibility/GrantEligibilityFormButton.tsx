"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import type { GrantEligibility } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { createGrantEligibilityForm } from "@/lib/actions/grantEligibility"

interface GrantEligibilityFormButtonProps {
  projectId?: string
  organizationId?: string
  existingForm?: GrantEligibility
}

export default function GrantEligibilityFormButton({
  projectId,
  organizationId,
  existingForm,
}: GrantEligibilityFormButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleButtonClick = () => {
    startTransition(async () => {
      // If we have an existing form, just navigate to it
      if (existingForm) {
        router.push(`/grant-eligibility/${existingForm.id}`)
        return
      }

      // Otherwise, create a new form
      try {
        const result = await createGrantEligibilityForm({
          projectId,
          organizationId,
        })

        if ("error" in result && result.error) {
          toast.error(result.error)
          return
        }

        if ("form" in result && result.form) {
          router.push(`/grant-eligibility/${result.form.id}`)
          return
        }

        toast.error("Unexpected response while creating form")
      } catch (error) {
        console.error("Error opening grant eligibility form:", error)
        toast.error("Failed to open form. Please try again.")
      }
    })
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleButtonClick}
      disabled={isPending}
      className="flex items-center gap-2"
    >
      {isPending && <Loader2 className="animate-spin" size={16} />}
      {existingForm ? "Resume form" : "Open form"}
    </Button>
  )
}
