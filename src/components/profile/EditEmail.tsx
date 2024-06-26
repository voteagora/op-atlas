"use client"

import { User } from "@prisma/client"
import { useState } from "react"
import { toast } from "sonner"

import { useUpdateEmail } from "@/lib/hooks"

import { Badge } from "../common/Badge"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

export function EditEmail({ user }: { user: User }) {
  const [email, setEmail] = useState(user.email)
  const updateEmail = useUpdateEmail()

  const onEditEmail = async () => {
    if (!email) return

    await updateEmail(email)
    toast.success("Email updated")
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-foreground text-xl font-semibold">Email</div>
      <div>
        Please add an email for important messages. This is required to apply
        for and receive Retro Funding. It should be a personal email where we
        can reliably reach you. Don&apos;t worry, we&apos;ll keep it private.
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-[6px] items-center">
          <div className="text-foreground font-medium text-sm">Email</div>
          <Badge text="Private" />
        </div>
        <Input
          value={email ?? ""}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your-email@gmail.com"
        />
      </div>
      <Button
        onClick={onEditEmail}
        disabled={!email || email === user.email}
        className="self-start"
        variant="secondary"
      >
        Edit
      </Button>
    </div>
  )
}
