"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { User } from "@prisma/client"
import { Plus } from "lucide-react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TeamRole, UserWithAddresses } from "@/lib/types"
import { uploadImage } from "@/lib/utils/images"
import { useAnalytics } from "@/providers/AnalyticsProvider"

import FileUploadInput from "../common/FileUploadInput"
import { PhotoCropModal } from "../projects/details/PhotoCropModal"
import AddTeamMemberDialog from "../projects/teams/AddTeamMemberDialog"
import DeleteTeamMemberDialog from "../projects/teams/DeleteTeamMemberDialog"
import { Button } from "../ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { TeamMemberRow } from "./TeamMemberRow"

const StringValue = z.object({ value: z.string() }) // use a intermediate object to represent String arrays because useFieldArray only works on object arrays

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  website: z.array(StringValue),
  farcaster: z.array(StringValue),
  twitter: z.string().optional(),
  mirror: z.string().optional(),
})

function toStringObjectArr(strings: string[]) {
  if (!strings.length) return [{ value: "" }] // default to at least 1 line item
  return strings.map((str) => ({ value: str }))
}

function fromStringObjectArr(objs: { value: string }[]) {
  return objs.map(({ value }) => value).filter(Boolean) // remove empty strings
}

export default function MakeOrganizationForm({
  user,
}: {
  user: UserWithAddresses
}) {
  const { orgId } = useParams()

  const [team, setTeam] = useState<{ user: User; role: TeamRole }[]>([])

  const [isShowingAdd, setIsShowingAdd] = useState(false)
  const [isShowingRemove, setIsShowingRemove] = useState<User | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: orgId ? "The Puky Cats" : "",
      description: "",

      website: toStringObjectArr([""]),
      farcaster: toStringObjectArr([""]),
      twitter: undefined,
      mirror: undefined,
    },
  })

  const { fields: websiteFields, append: addWebsiteField } = useFieldArray({
    control: form.control,
    name: "website",
  })

  const { fields: farcasterFields, append: addFarcasterField } = useFieldArray({
    control: form.control,
    name: "farcaster",
  })

  const [avatarSrc, setAvatarSrc] = useState<string>()
  const [bannerSrc, setBannerSrc] = useState<string>()

  const [newAvatarImg, setNewAvatarImg] = useState<Blob>()
  const [newBannerImg, setNewBannerImg] = useState<Blob>()

  const avatarUrl = useMemo(() => {
    if (!newAvatarImg) return ""
    return URL.createObjectURL(newAvatarImg)
  }, [newAvatarImg])

  const bannerUrl = useMemo(() => {
    if (!newBannerImg) return ""
    return URL.createObjectURL(newBannerImg)
  }, [newBannerImg])

  const onCloseCropModal = (type: "avatar" | "banner") => {
    if (avatarSrc && type === "avatar") {
      URL.revokeObjectURL(avatarSrc)
      setAvatarSrc(undefined)
    }

    if (bannerSrc && type === "banner") {
      URL.revokeObjectURL(bannerSrc)
      setBannerSrc(undefined)
    }
  }

  const onSubmit =
    (isSave: boolean) => async (values: z.infer<typeof formSchema>) => {
      isSave ? setIsSaving(true) : setIsLoading(true)
      //thumb nail url
      let thumbnailUrl = ""
      let bannerUrl = ""

      try {
        if (newAvatarImg) {
          thumbnailUrl = await uploadImage(newAvatarImg)
        }
      } catch (error: unknown) {
        let message = "Failed to upload avatar image"
        if (
          error instanceof Error &&
          error.message === "Image size too large"
        ) {
          message = "Avatar image too large"
        }

        console.error("Error uploading avatar", error)
        toast.error(message)
        isSave ? setIsSaving(false) : setIsLoading(false)
        return
      }

      try {
        if (newBannerImg) {
          bannerUrl = await uploadImage(newBannerImg)
        }
      } catch (error: unknown) {
        let message = "Failed to upload avatar image"
        if (
          error instanceof Error &&
          error.message === "Image size too large"
        ) {
          message = "Cover image too large"
        }

        console.error("Error uploading banner", error)
        toast.error(message)
        isSave ? setIsSaving(false) : setIsLoading(false)
        return
      }

      const newValues = {
        ...values,
        thumbnailUrl,
        bannerUrl,
        website: fromStringObjectArr(values.website),
        farcaster: fromStringObjectArr(values.farcaster),
      }
    }

  const handleAddMembers = async (userIds: string[]) => {
    setIsShowingAdd(false)
  }

  const handleToggleRole = async (user: User, role: TeamRole) => {
    // TODO: Optimistic UI
    const newRole = role === "member" ? "admin" : "member"
  }

  const handleConfirmDelete = async () => {
    if (!isShowingRemove) return

    setIsShowingRemove(null)
  }

  //setting user as admin in local state for now
  useEffect(() => {
    setTeam([
      {
        user: user,
        role: "admin",
      },
    ])
  }, [user])

  const canSubmit = form.formState.isValid && !form.formState.isSubmitting

  return (
    <Form {...form}>
      {bannerSrc && (
        <PhotoCropModal
          open
          title="Organization cover image"
          subtitle="At least 2048w x 512h px. No larger than 4.5 MB."
          aspectRatio={4}
          image={bannerSrc}
          onComplete={setNewBannerImg}
          onOpenChange={(open) => {
            if (!open) onCloseCropModal("banner")
          }}
        />
      )}
      {avatarSrc && (
        <PhotoCropModal
          open
          title="Organization avatar"
          aspectRatio={1}
          image={avatarSrc}
          onComplete={setNewAvatarImg}
          onOpenChange={(open) => {
            if (!open) onCloseCropModal("avatar")
          }}
        />
      )}
      <form
        onSubmit={form.handleSubmit(onSubmit(false))}
        className="flex flex-col gap-12"
      >
        <div className="flex flex-col gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1.5">
                <FormLabel className="text-foreground">
                  Organization name
                  <span className="ml-0.5 text-destructive">*</span>
                </FormLabel>
                <Input type="" id="name" placeholder="Add a name" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-1.5">
            <FormItem className="flex flex-col gap-1.5">
              <FormLabel>Team members</FormLabel>

              {team?.map(({ user: teamUser, role }, index) => (
                <TeamMemberRow
                  key={index}
                  user={user}
                  role={role as TeamRole}
                  isUserAdmin={false}
                  isCurrentUser={teamUser?.id === user.id}
                  onToggleAdmin={() => handleToggleRole(user, role as TeamRole)}
                  onRemove={() => setIsShowingRemove(user)}
                />
              ))}
            </FormItem>
            <Button
              onClick={() => setIsShowingAdd(true)}
              type="button"
              variant="secondary"
              className="w-fit"
            >
              <Plus size={16} className="mr-2.5" /> Add team members
            </Button>
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1.5">
                <FormLabel className="text-foreground">
                  Description<span className="ml-0.5 text-destructive">*</span>
                </FormLabel>
                <FormDescription className="!mt-0">
                  Introduce your organization to the Optimism Collective. Share
                  who you are and what you do.
                </FormDescription>
                <Textarea
                  id="description"
                  placeholder="Add a description"
                  className="resize-none"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <div>
              <FormLabel>
                Avatar and cover image
                <span className="ml-0.5 text-destructive">*</span>
              </FormLabel>
              <div className="text-sm text-muted-foreground">
                Images must be no larger than 5MB.
              </div>
            </div>
            <div className="flex flex-1 gap-x-2 mt-2 relative pb-10">
              <FileUploadInput
                className="absolute bottom-0 left-6"
                onChange={(e) => {
                  if (!e.target.files || e.target.files.length < 1) return

                  const file = e.target.files[0]
                  setAvatarSrc(URL.createObjectURL(file))
                }}
              >
                <div className="border border-solid rounded-full overflow-hidden h-32 aspect-square flex-1 bg-secondary flex flex-col justify-center items-center gap-2 select-none">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt="project avatar"
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <>
                      <Image
                        src="/assets/icons/upload.svg"
                        width={20}
                        height={20}
                        alt="img"
                      />
                      <p className="text-muted-foreground text-xs">Avatar</p>
                    </>
                  )}
                </div>
              </FileUploadInput>
              <FileUploadInput
                className="w-full"
                onChange={(e) => {
                  if (!e.target.files || e.target.files.length < 1) return

                  const file = e.target.files[0]
                  setBannerSrc(URL.createObjectURL(file))
                }}
              >
                <div className="border border-solid h-40 overflow-hidden bg-secondary rounded-xl flex flex-col justify-center items-center gap-2 select-none">
                  {bannerUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={bannerUrl}
                      alt="project avatar"
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <>
                      <Image
                        src="/assets/icons/upload.svg"
                        width={20}
                        height={20}
                        alt="img"
                      />
                      <p className="text-muted-foreground text-xs">
                        Cover image
                      </p>
                    </>
                  )}
                </div>
              </FileUploadInput>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div>
              <FormLabel className="text-sm font-medium">Website</FormLabel>
              <div className="text-sm text-muted-foreground">
                If your project has more than one website, you can add rows.
              </div>
            </div>
            {websiteFields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`website.${index}.value`}
                render={({ field: innerField }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...innerField} placeholder="Add a link" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={() => addWebsiteField({ value: "" })}
              className="w-fit"
            >
              <Plus size={16} className="mr-2.5" /> Add
            </Button>
          </div>

          <div className="flex flex-col gap-1.5">
            <div>
              <p className="text-sm font-medium">Farcaster</p>
            </div>
            {farcasterFields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`farcaster.${index}.value`}
                render={({ field: innerField }) => (
                  <FormItem>
                    <FormControl>
                      <Input {...innerField} placeholder="Add a link" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="button"
              variant="secondary"
              onClick={() => addFarcasterField({ value: "" })}
              className="w-fit"
            >
              <Plus size={16} className="mr-2.5" /> Add
            </Button>
          </div>

          <FormField
            control={form.control}
            name="twitter"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1.5">
                <FormLabel>Twitter</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Add a link" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mirror"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1.5">
                <FormLabel>Mirror</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Add a link" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2">
          <Button
            isLoading={isSaving}
            disabled={!canSubmit || isSaving}
            onClick={form.handleSubmit(onSubmit(true))}
            type="button"
            variant="destructive"
            className="self-start"
          >
            Save
          </Button>
        </div>
      </form>

      <AddTeamMemberDialog
        open={isShowingAdd}
        onOpenChange={(open) => setIsShowingAdd(open)}
        //@ts-ignore
        team={team.map((member) => member.user)}
        addMembers={handleAddMembers}
      />
      <DeleteTeamMemberDialog
        open={!!isShowingRemove}
        onOpenChange={() => setIsShowingRemove(null)}
        onRemove={handleConfirmDelete}
        member={isShowingRemove}
      />
    </Form>
  )
}
