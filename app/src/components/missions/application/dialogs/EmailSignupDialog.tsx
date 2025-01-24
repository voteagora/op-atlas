"use client"

import Image from "next/image"
import { useSession } from "next-auth/react"
import { memo, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/common/Button"
import { DialogProps } from "@/components/dialogs/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useUpdateEmail } from "@/lib/hooks"

import { ApplicationFormSchema } from "../MissionApplication"

const schema = z.object({
  email: z.string().email(),
})

function EmailSignUpDialog({
  open,
  form,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: UseFormReturn<z.infer<typeof ApplicationFormSchema>>
  onSubmit: (
    email: string | null | undefined,
    projects: z.infer<typeof ApplicationFormSchema>["projects"],
  ) => void
}) {
  const { data: session } = useSession()
  const updateEmail = useUpdateEmail()

  const [email, setEmail] = useState(session?.user.email ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()

  const saveEmail = async () => {
    if (!email) return

    setLoading(true)
    try {
      if (!schema.safeParse({ email }).success) {
        setError("Invalid email address")
        return
      }

      await updateEmail(email)
      toast.success("Email added")
      onOpenChange(false)

      onSubmit(
        email,
        form.getValues().projects.filter((project) => project.selected),
      )
      setError(undefined)
    } catch (error) {
      console.error("Error updating email", error)
      setError("Something went wrong, please try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center gap-y-6 sm:max-w-md">
        <DialogHeader className="flex flex-col items-center gap-4">
          <Image
            src="/assets/icons/email.svg"
            width={64}
            height={64}
            alt="img"
          />
          <DialogTitle className="text-center text-lg font-semibold text-text-default">
            Please add email for important messages
          </DialogTitle>
          <DialogDescription className="text-center text-base font-normal text-text-secondary mt-1 flex flex-col gap-6">
            {
              "It should be a personal email where we can reliably reach you. Don’t worry, we’ll keep it private."
            }
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium self-start">Email</div>
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={({ target }) => setEmail(target.value)}
              />
              {error && (
                <p className="text-destructive text-sm font-medium self-start">
                  {error}
                </p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="w-full">
          <Button
            disabled={loading || !email}
            onClick={saveEmail}
            className="w-full"
            type="button"
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default memo(EmailSignUpDialog)
