"use client"

import { Organization } from "@prisma/client"
import { useSession } from "next-auth/react"
import { memo, useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { createNewOrganization } from "@/lib/actions/organizations"
import { uploadImage } from "@/lib/utils/images"

import FileUploadInput from "../common/FileUploadInput"
import { DialogProps } from "../dialogs/types"
import { PhotoCropModal } from "../projects/details/PhotoCropModal"
import AddTeamMemberDialog from "../projects/teams/AddTeamMemberDialog"

function CreateOrganizationDialog({ onOpenChange, open }: DialogProps<object>) {
  const { data: currentUser } = useSession()

  const [organizationName, setOrganizationName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(open)
  const [avatarSrc, setAvatarSrc] = useState<string>()
  const [newAvatarImg, setNewAvatarImg] = useState<Blob>()
  const [isShowingAdd, setIsShowingAdd] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const user = currentUser?.user

  const avatarUrl = useMemo(() => {
    if (!newAvatarImg) return ""
    return URL.createObjectURL(newAvatarImg)
  }, [newAvatarImg])

  const handleAddMembers = async (userIds: string[]) => {
    onSubmit(userIds)
  }

  const onCloseCropModal = () => {
    if (avatarSrc) {
      URL.revokeObjectURL(avatarSrc)
      setAvatarSrc(undefined)
    }
  }

  const onSubmit = async (selectedUserIds?: string[]) => {
    setIsSaving(true)

    let avatarUrl

    try {
      if (newAvatarImg) {
        avatarUrl = await uploadImage(newAvatarImg)
      }
    } catch (error: unknown) {
      let message = "Failed to upload avatar image"
      if (error instanceof Error && error.message === "Image size too large") {
        message = "Avatar image too large"
      }

      console.error("Error uploading avatar", error)
      toast.error(message)
      setIsSaving(false)
      return
    }

    const newValues = {
      name: organizationName,
      avatarUrl,
      description: "",
      coverUrl: "",
      twitter: "",
      mirror: "",
      website: [],
      farcaster: [],
    }

    const promise: Promise<Organization> = new Promise(
      async (resolve, reject) => {
        try {
          const response = await createNewOrganization({
            organization: newValues,
            teamMembers: [
              ...(selectedUserIds?.map((userId) => ({
                userId: userId!,
                role: "member",
              })) ?? []),
              { userId: user?.id!, role: "admin" },
            ],
          })

          if (response?.error !== null || !response) {
            throw new Error(response?.error ?? "Failed to save project")
          }
          // if (isCreating) {
          //   track("Add Project", { projectId: response.id })
          // }
          resolve(response.organizationData)
        } catch (error) {
          console.error("Error creating project", error)
          reject(error)
        }
      },
    )
    toast.promise(promise, {
      loading: "Creating organization onchain...",

      success: () => {
        setIsSaving(false)
        setIsShowingAdd(false)
        onOpenChange(false)
        return "Organization created!"
      },
      error: () => {
        setIsSaving(false)
        return "Failed to save organization onchain"
      },
    })
  }

  return (
    <div>
      <Dialog open={open && isDialogOpen} onOpenChange={onOpenChange}>
        <DialogContent className="flex flex-col items-center gap-y-6 sm:max-w-md">
          <DialogHeader className="flex flex-col items-center gap-4">
            <div className="flex flex-col gap-2">
              <DialogTitle className="text-center text-lg font-semibold text-text-default">
                Make an organization
              </DialogTitle>
              <DialogDescription className="text-center text-base font-normal text-text-secondary flex flex-col gap-6">
                An organization is a group of people aligned around a shared
                purpose (i.e. Optimism is an organization and OP Mainnet is one
                of our projects).
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-1.5 w-full">
            <p className="text-foreground">
              Organization name
              <span className="ml-0.5 text-destructive">*</span>
            </p>
            <Input
              placeholder="Add a name"
              value={organizationName}
              onChange={(event) => setOrganizationName(event.target.value)}
            />
          </div>

          <DialogFooter className="w-full sm:flex-col gap-2">
            <Button
              disabled={!!!organizationName.length}
              className="w-full disabled:opacity-50"
              type="button"
              variant="destructive"
            >
              <FileUploadInput
                onChange={(e) => {
                  if (!e.target.files || e.target.files.length < 1) return
                  const file = e.target.files[0]
                  setAvatarSrc(URL.createObjectURL(file))
                  setIsDialogOpen(false)
                }}
              >
                Choose avatar
              </FileUploadInput>
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full !ml-0"
              type="button"
              variant="outline"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {avatarSrc && (
        <PhotoCropModal
          open
          title="Organization avatar"
          aspectRatio={1}
          image={avatarSrc}
          onComplete={(image) => {
            setNewAvatarImg(image)
            setIsShowingAdd(true)
          }}
          onOpenChange={(open) => {
            if (!open) onCloseCropModal()
          }}
        />
      )}

      <AddTeamMemberDialog
        avatar={avatarUrl}
        open={isShowingAdd}
        isUpdating={isSaving}
        onOpenChange={(open) => setIsShowingAdd(open)}
        team={[]}
        addMembers={handleAddMembers}
        title="Add team members"
        subtitle="You can add team members by their Farcaster username. They must have an Optimist profile."
        onSkip={() => {
          onSubmit()
        }}
      />
    </div>
  )
}

export default memo(CreateOrganizationDialog)
