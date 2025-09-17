"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"
import type { GrantEligibility } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { createGrantEligibilityForm } from "@/lib/actions/grantEligibility"

interface GrantEligibilityFormButtonProps {
  projectId?: string
  organizationId?: string
  existingForm?: GrantEligibility
  variant?: "default" | "add"
  isAdmin?: boolean
}

export default function GrantEligibilityFormButton({
  projectId,
  organizationId,
  existingForm,
  variant = "default",
  isAdmin = true,
}: GrantEligibilityFormButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // If user is not admin, show message instead of button
  if (!isAdmin) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-sm text-gray-600">
          Only admins can fill the grant eligibility form.
        </p>
      </div>
    )
  }

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

  // Determine button styling based on variant and whether we're resuming a form
  const isAddVariant = variant === "add" && !existingForm
  const buttonVariant = isAddVariant ? "secondary" : "destructive"
  const buttonClassName = isAddVariant 
    ? "flex items-center gap-2 bg-gray-100 text-black hover:bg-gray-200"
    : "flex items-center gap-2"

  // Determine button text and icon
  let buttonText: string
  let icon: React.ReactNode = null

  if (isPending) {
    buttonText = isAddVariant ? "Adding..." : "Loading..."
    icon = <Loader2 className="animate-spin" size={16} />
  } else if (existingForm) {
    buttonText = "Resume form"
  } else if (isAddVariant) {
    buttonText = "Add"
    icon = <Plus size={16} />
  } else {
    buttonText = "Open form"
  }

  return (
    <Button
      variant={buttonVariant}
      onClick={handleButtonClick}
      disabled={isPending}
      className={buttonClassName}
    >
      {icon}
      {buttonText}
    </Button>
  )
}
