"use client"

import Image from "next/image"
import { useSession } from "next-auth/react"
import { memo, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/common/Button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useUpdateEmail } from "@/lib/hooks"

import { Input } from "../ui/input"
import { DialogProps } from "./types"

const schema = z.object({
  email: z.string().email(),
})

function EmailDialog({ open, onOpenChange }: DialogProps<object>) {
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
          <div className="bg-backgroundSecondary rounded-full h-20 w-20 flex flex-col items-center justify-center">
            <Image
              src="/assets/icons/email.svg"
              width={24}
              height={27}
              alt="img"
            />
          </div>
          <DialogTitle className="text-center text-lg font-semibold text-text-default">
            Please add email for important messages
          </DialogTitle>
          <DialogDescription className="text-center text-base font-normal text-text-secondary mt-1 flex flex-col gap-6">
            This step is required to claim Retro Funding. It should be a
            personal email where we can reliably reach you. Don&apos;t worry,
            we&apos;ll keep it private.
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
            {loading ? "Saving..." : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default memo(EmailDialog)
