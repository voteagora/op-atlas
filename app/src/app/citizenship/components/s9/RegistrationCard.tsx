"use client"

import { useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { useLogin } from "@privy-io/react-auth"
import { signIn } from "next-auth/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAppDialogs } from "@/providers/DialogProvider"
import { usePrivyEmail } from "@/hooks/privy/usePrivyLinkEmail"
import { SeasonWithConfig } from "@/lib/seasons"
import { USER_ADDRESSES_QUERY_KEY, USER_QUERY_KEY } from "@/hooks/db/useUser"
import { S9_REGISTRATION_DIALOG_STORAGE_KEY } from "@/components/dialogs/constants"

export type RegistrationCardState =
  | {
      type: "register"
      ctaId?: string
    }
  | {
    type: "add-email"
  }
  | {
    type: "priority-required"
    message: string
  }
  | {
    type: "registration-closed"
    message: string
  }
  | {
    type: "registration-blocked"
    message: string
  }
  | {
    type: "sign-in"
  }

type Props = {
  state: RegistrationCardState
  userId: string | null
  season: SeasonWithConfig
}

export function RegistrationCard({ state, userId, season }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { openDialog, setOpenDialog, setData } = useAppDialogs()
  const { linkEmail } = usePrivyEmail(userId ?? "", {
    onLinkSuccess: () => {
      // Refresh server component data to update the registration card state
      router.refresh()
    },
  })

  const { login: privyLogin } = useLogin({
    onComplete: () => {
      router.refresh()
    },
    onError: (error) => {
      toast.error("Unable to sign in. Please try again.")
      console.error("Sign in error:", error)
    },
  })

  const invalidateUserQueries = useCallback(() => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY, userId] })
      queryClient.invalidateQueries({ queryKey: [USER_ADDRESSES_QUERY_KEY, userId] })
    }
  }, [queryClient, userId])

  const hasInvalidatedRef = useRef(false)

  useEffect(() => {
    if (!userId) return

    if (openDialog === "s9_registration") {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(S9_REGISTRATION_DIALOG_STORAGE_KEY, "true")
      }
      if (!hasInvalidatedRef.current) {
        invalidateUserQueries()
        hasInvalidatedRef.current = true
      }
      return
    }

    hasInvalidatedRef.current = false

    if (typeof window === "undefined") return
    if (window.sessionStorage.getItem(S9_REGISTRATION_DIALOG_STORAGE_KEY) === "true") {
      invalidateUserQueries()
      setData((prev) => ({
        ...prev,
        userId,
        seasonId: season.id,
      }))
      setOpenDialog("s9_registration")
    }
  }, [invalidateUserQueries, openDialog, season.id, setData, setOpenDialog, userId])

  return (
    <div className="w-full flex flex-col gap-4 border-2 border-tertiary rounded-[12px] p-6 bg-background">
      {renderContent({
        state,
        seasonName: season.name,
        openDialog: (ctaId) => {
          if (!userId) return
          setData((prev) => ({
            ...prev,
            userId,
            seasonId: season.id,
          }))
          if (typeof window !== "undefined") {
            window.sessionStorage.setItem(S9_REGISTRATION_DIALOG_STORAGE_KEY, "true")
          }
          invalidateUserQueries()
          setOpenDialog("s9_registration")
        },
        linkEmail,
        privyLogin,
      })}
    </div>
  )
}

function renderContent({
  state,
  seasonName,
  openDialog,
  linkEmail,
  privyLogin,
}: {
  state: RegistrationCardState
  seasonName: string
  openDialog: (ctaId?: string) => void
  linkEmail: () => void
  privyLogin: () => void
}) {
  switch (state.type) {
    case "sign-in":
      return (
        <>
          <div className="flex flex-col gap-2 text-center w-full">
            <div className="text-base font-semibold text-foreground">
              Register for citizenship in {seasonName}
            </div>
          </div>
          <Button
            type="button"
            className="w-full button-primary"
            onClick={privyLogin}
          >
            Sign in
          </Button>
        </>
      )
    case "register":
      return (
        <>
          <div className="flex flex-col gap-2 text-center w-full">
            <div className="text-base font-semibold text-foreground">
              Register for citizenship in {seasonName}
            </div>
          </div>
          <Button
            id={state.ctaId}
            type="button"
            className="w-full button-primary"
            onClick={() => openDialog(state.ctaId)}
          >
            Register
          </Button>
        </>
      )
    case "add-email":
      return (
        <>
          <div className="flex flex-col gap-2 text-center w-full">
            <div className="text-base font-semibold text-foreground">
              Register for citizenship in {seasonName}
            </div>
            <div className="text-sm text-secondary-foreground">
              You must add an email to your Atlas account before you can register. It should be a personal email where we can reliably reach you.
            </div>
          </div>
          <Button
            className="w-full button-primary"
            onClick={linkEmail}
          >
            Add email
          </Button>
        </>
      )
    case "priority-required":
      return (
        <div className="flex flex-col gap-2 text-center w-full">
          <div className="text-base font-semibold text-foreground">
            You don&apos;t qualify for early registration
          </div>
          <div className="text-sm text-secondary-foreground">{state.message}</div>
        </div>
      )
    case "registration-closed":
      return (
        <div className="flex flex-col gap-2 text-center w-full">
          <div className="text-base font-semibold text-foreground">
            Registration has closed
          </div>
          <div className="text-sm text-secondary-foreground">{state.message}</div>
        </div>
      )
    case "registration-blocked":
      return (
        <div className="flex flex-col gap-2 text-center w-full">
          <div className="text-base font-semibold text-foreground">
            Sorry, but you&apos;re not eligible
          </div>
          <div className="text-sm text-secondary-foreground">{state.message}</div>
        </div>
      )
    default:
      return null
  }
}
