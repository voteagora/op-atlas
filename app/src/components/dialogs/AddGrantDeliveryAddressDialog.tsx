"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { isAddress } from "viem"
import { z } from "zod"

import Input from "@/components/common/Input"
import { DialogProps } from "@/components/dialogs/types"
import ExternalLink from "@/components/ExternalLink"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useUser } from "@/hooks/db/useUser"
import { useUsername } from "@/hooks/useUsername"
import { createOrganizationKycTeamAction } from "@/lib/actions/organizations"
import { createProjectKycTeamAction } from "@/lib/actions/projects"
import { useAppDialogs } from "@/providers/DialogProvider"

const formSchema = z.object({
  signature: z.string().min(1, "Signature is required"),
})

export function AddGrantDeliveryAddressDialog({
  open,
  onOpenChange,
}: DialogProps<object>) {
  const { organizationId, projectId } = useParams()
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const { data: grantDeliveryData } = useAppDialogs()

  const { user } = useUser({ id: session?.user?.id, enabled: true })
  const username = useUsername(user)

  const [isPending, startTransition] = useTransition()
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      signature: "",
    },
  })

  const [messageToSign, setMessageToSign] = useState(
    `I verify that I am ${username} on Atlas and I'm an optimist.`,
  )

  useEffect(() => {
    setMessageToSign(
      `I verify that I am ${username} on Atlas and I'm an optimist.`,
    )
  }, [username])

  const handleClose = useCallback(
    (isOpen: boolean) => {
      onOpenChange(isOpen)
      if (!isOpen) {
        reset()
      }
    },
    [onOpenChange, reset],
  )

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(messageToSign)
    toast.success("Copied to clipboard")
  }, [messageToSign])

  const onSubmit = useCallback(
    async (data: { signature: string }) => {
      startTransition(async () => {
        if (!grantDeliveryData.address) return

        if (!isAddress(grantDeliveryData.address))
          throw new Error("Invalid address")
        if (!data.signature.startsWith("0x"))
          throw new Error("Invalid signature")

        try {
          if (organizationId) {
            const createdOrganizationKycTeam =
              await createOrganizationKycTeamAction({
                walletAddress: grantDeliveryData.address,
                organizationId: organizationId as string,
              })

            if (createdOrganizationKycTeam.error) {
              if (createdOrganizationKycTeam.error.includes("already exists")) {
                toast.error(
                  "This address is already in use by another KYC team. Please go back to the previous step and use a different address.",
                )
              } else {
                toast.error(createdOrganizationKycTeam.error)
              }
              return
            }

            queryClient.invalidateQueries({
              queryKey: ["kyc-teams", "organization", organizationId],
            })
          } else {
            if (!projectId) return

            const createdProjectKycTeam = await createProjectKycTeamAction({
              walletAddress: grantDeliveryData.address,
              projectId: projectId as string,
            })

            if (createdProjectKycTeam.error) {
              if (createdProjectKycTeam.error.includes("already exists")) {
                toast.error(
                  "This address is already in use by another KYC team. Please go back to the previous step and use a different address.",
                )
              } else {
                toast.error(createdProjectKycTeam.error)
              }
              return
            }

            queryClient.invalidateQueries({
              queryKey: ["kycTeamProjects", grantDeliveryData.kycTeamId],
            })
            queryClient.invalidateQueries({
              queryKey: ["kyc-teams", "project", projectId],
            })
          }

          toast.success("Grant delivery address verified")
          handleClose(false)
        } catch (error) {
          console.error("Error creating KYC team:", error)
          toast.error("Error verifying the address. Please try again.")
        }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [grantDeliveryData, handleClose, organizationId, projectId, queryClient],
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex flex-col items-center gap-y-6 sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
          <div className="flex flex-col items-center text-center gap-4">
            <h3>Copy and sign the message below</h3>
            <p className="text-secondary-foreground">
              You can{" "}
              <ExternalLink
                href="https://optimistic.etherscan.io/verifiedSignatures"
                className="underline"
              >
                use Etherscan
              </ExternalLink>{" "}
              to generate a signature. Then return here with your signature hash
              and continue to the next step.
            </p>
          </div>
          <div className="flex flex-col self-stretch gap-1">
            <div className="text-sm font-medium">Chain</div>
            <Input
              className="text-secondary-foreground text-sm"
              readOnly
              value="OP Mainnet"
              leftIcon="/assets/chain-logos/optimism.svg"
            />
          </div>
          <div className="flex flex-col self-stretch gap-1">
            <div className="text-sm font-medium">Message to sign</div>
            <Textarea disabled value={messageToSign} className="resize-none" />
            <Button type="button" onClick={handleCopy} variant="secondary">
              Copy
            </Button>
          </div>
          <div className="flex flex-col self-stretch gap-1">
            <div>Signature hash</div>
            <Controller
              control={control}
              name="signature"
              render={({ field }) => (
                <Textarea {...field} className="resize-none" />
              )}
            />
            {errors.signature && (
              <p className="text-destructive text-sm font-medium">
                {errors.signature.message}
              </p>
            )}
          </div>
          <Button
            className="self-stretch"
            variant="destructive"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Verifying..." : "Continue"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
