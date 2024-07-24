"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { memo, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

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

import FileUploadInput from "../common/FileUploadInput"
import { DialogProps } from "../dialogs/types"
import { PhotoCropModal } from "../projects/details/PhotoCropModal"
import AddTeamMemberDialog from "../projects/teams/AddTeamMemberDialog"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
})

function CreateOrganizationDialog({ onOpenChange, open }: DialogProps<object>) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),

    defaultValues: {
      name: "",
    },
  })

  const [team, setTeam] = useState([])
  const [avatarSrc, setAvatarSrc] = useState<string>()
  const [newAvatarImg, setNewAvatarImg] = useState<Blob>()

  const [isShowingAdd, setIsShowingAdd] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const avatarUrl = useMemo(() => {
    if (!newAvatarImg) return ""
    return URL.createObjectURL(newAvatarImg)
  }, [newAvatarImg])

  const handleAddMembers = async (userIds: string[]) => {
    setIsShowingAdd(false)
    onOpenChange(false)
  }

  const onCloseCropModal = () => {
    if (avatarSrc) {
      URL.revokeObjectURL(avatarSrc)
      setAvatarSrc(undefined)
    }
  }
  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Form {...form}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1.5 w-full">
                  <FormLabel className="text-foreground">
                    Organization name
                    <span className="ml-0.5 text-destructive">*</span>
                  </FormLabel>
                  <Input
                    type=""
                    id="name"
                    placeholder="Add a name"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>

          <DialogFooter className="w-full sm:flex-col gap-2">
            <Button
              disabled={!form.formState.isValid}
              className="w-full disabled:opacity-50 disabled:bg-destructive disabled:text-text-default"
              type="button"
              variant="destructive"
            >
              <FileUploadInput
                onChange={(e) => {
                  if (!e.target.files || e.target.files.length < 1) return

                  const file = e.target.files[0]
                  setAvatarSrc(URL.createObjectURL(file))
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
        </DialogContent>
      </Dialog>

      <AddTeamMemberDialog
        avatar={avatarUrl}
        open={isShowingAdd}
        onOpenChange={(open) => setIsShowingAdd(open)}
        //@ts-ignore
        team={team.map((member) => member.user)}
        addMembers={handleAddMembers}
        onSkip={() => {
          setIsShowingAdd(false)
          onOpenChange(false)
        }}
      />
    </div>
  )
}

export default memo(CreateOrganizationDialog)
