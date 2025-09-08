"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Organization, User } from "@prisma/client"
import { Plus } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { sortBy } from "ramda"
import { useEffect, useMemo, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/common/Button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  addMemberToOrganization,
  createNewOrganization,
  removeMemberFromOrganization,
  setOrganizationMemberRole,
  updateOrganizationDetails,
} from "@/lib/actions/organizations"
import { useIsOrganizationAdmin } from "@/lib/hooks"
import { OrganizationWithDetails, TeamRole } from "@/lib/types"
import { uploadImage } from "@/lib/utils/images"

import FileUploadInput from "../common/FileUploadInput"
import { PhotoCropModal } from "../projects/details/PhotoCropModal"
import AddTeamMemberDialog from "../projects/teams/AddTeamMemberDialog"
import DeleteTeamMemberDialog from "../projects/teams/DeleteTeamMemberDialog"
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
  description: z.string().optional(),
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
  organization,
}: {
  user: User
  organization?: OrganizationWithDetails
}) {
  const router = useRouter()
  const isAdmin = useIsOrganizationAdmin(organization)

  const [team, setTeam] = useState<{ user: User; role: TeamRole }[]>(
    organization?.team.map(({ user, role }) => ({
      user,
      role: role as TeamRole,
    })) ?? [{ user, role: "admin" }],
  )

  const [isShowingAdd, setIsShowingAdd] = useState(false)
  const [isShowingRemove, setIsShowingRemove] = useState<User | null>(null)

  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: organization?.name ?? "",
      description: organization?.description ?? "",
      website: toStringObjectArr(organization?.website ?? [""]),
      farcaster: toStringObjectArr(organization?.farcaster ?? [""]),
      twitter: organization?.twitter ?? undefined,
      mirror: organization?.mirror ?? undefined,
    },
  })

  const formValues = form.watch()

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
    if (!newAvatarImg) return organization?.avatarUrl
    return URL.createObjectURL(newAvatarImg)
  }, [newAvatarImg, organization?.avatarUrl])

  const bannerUrl = useMemo(() => {
    if (!newBannerImg) return organization?.coverUrl
    return URL.createObjectURL(newBannerImg)
  }, [newBannerImg, organization?.coverUrl])

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

  const handleAddMembers = async (
    userIds: string[],
    allSelectedUsers: User[],
  ) => {
    if (organization) {
      await addMemberToOrganization(organization.id, userIds)
    } else {
      allSelectedUsers.forEach((user) => {
        setTeam((prev) => [...prev, { user, role: "member" }])
      })
    }

    setIsShowingAdd(false)
  }

  const handleToggleRole = async (selectedUser: User, role: TeamRole) => {
    if (organization) {
      const changeResult = await setOrganizationMemberRole(
        organization.id,
        selectedUser.id,
        role,
      )

      if (changeResult?.error) {
        toast.error(changeResult.error)
      }
    } else {
      setTeam((prev) => {
        const updatedTeam = prev.map((item) => {
          if (item.user.id === selectedUser.id) {
            const newRole = role
            return { ...item, role: newRole }
          }
          return item
        })
        return updatedTeam
      })
    }
  }

  // Wrap in a function that throws on error, helps our toast promise.
  const removeMemberOrThrow = async (
    organizationId: string,
    userId: string,
  ) => {
    const result = await removeMemberFromOrganization(organizationId, userId)
    if (result?.error) {
      throw new Error(result.error)
    }
    return result
  }

  const handleConfirmDelete = async () => {
    if (!isShowingRemove) return
    if (organization) {
      toast.promise(removeMemberOrThrow(organization.id, isShowingRemove.id), {
        loading: "Removing member...",
        success: () => {
          return "Member removed from team"
        },
        error: (error) => {
          return error.message
        },
      })
    } else {
      setTeam((prev) =>
        prev.filter((item) => item.user.id !== isShowingRemove.id),
      )
    }
    setIsShowingRemove(null)
  }

  // CHANGE: Add helper functions to check if the last field has a value
  const shouldShowWebsiteAdd = () => {
    const websites = formValues.website
    return websites[websites.length - 1]?.value.trim() !== ""
  }

  const shouldShowFarcasterAdd = () => {
    const farcasters = formValues.farcaster
    return farcasters[farcasters.length - 1]?.value.trim() !== ""
  }
  const onSubmit = () => async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true)

    let avatarUrl = organization?.avatarUrl
    let coverUrl = organization?.coverUrl

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

    try {
      if (newBannerImg) {
        coverUrl = await uploadImage(newBannerImg)
      }
    } catch (error: unknown) {
      let message = "Failed to upload avatar image"
      if (error instanceof Error && error.message === "Image size too large") {
        message = "Cover image too large"
      }

      console.error("Error uploading banner", error)
      toast.error(message)
      setIsSaving(false)
      return
    }

    const newValues = {
      ...values,
      avatarUrl,
      coverUrl,
      website: fromStringObjectArr(values.website),
      farcaster: fromStringObjectArr(values.farcaster),
    }

    const isCreating = !organization

    const promise: Promise<Organization> = new Promise(
      async (resolve, reject) => {
        try {
          const response = organization
            ? await updateOrganizationDetails({
                id: organization.id,
                organization: newValues,
              })
            : await createNewOrganization({
                organization: newValues,
                teamMembers: team.map(({ user, role }) => ({
                  userId: user.id,
                  role,
                })),
              })

          if (response?.error !== null || !response) {
            throw new Error(response?.error ?? "Failed to save project")
          }

          resolve(response.organizationData)
        } catch (error) {
          console.error("Error creating project", error)
          reject(error)
        }
      },
    )

    const newDefaultValues = {
      ...values,
      avatarUrl,
      coverUrl,
      website: toStringObjectArr(fromStringObjectArr(values.website)),
      farcaster: toStringObjectArr(fromStringObjectArr(values.farcaster)),
    }
    form.reset(newDefaultValues)

    toast.promise(promise, {
      loading: isCreating
        ? "Creating organization onchain..."
        : "Saving organization onchain...",
      success: (organization) => {
        if (isCreating) {
          router.replace(`/profile/organizations/${organization.id}`)
        }
        setIsSaving(false)
        return isCreating ? "Organization created!" : "organization saved"
      },
      error: () => {
        setIsSaving(false)
        return "Failed to save organization"
      },
    })
  }

  useEffect(() => {
    if (organization?.team) {
      setTeam(
        sortBy(
          (member) => member.user.name?.toLowerCase() ?? "",
          organization?.team.map(({ user, role }) => ({
            user,
            role: role as TeamRole,
          })),
        ),
      )
    }
  }, [organization?.team])

  const hasAdmin = team.some((member) => member.role === "admin")
  const canSubmit =
    form.formState.isValid && !form.formState.isSubmitting && hasAdmin

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
        onSubmit={form.handleSubmit(onSubmit())}
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
                  user={teamUser}
                  role={role as TeamRole}
                  isUserAdmin={!organization ? true : !!isAdmin}
                  isCurrentUser={teamUser?.id === user.id}
                  onToggleAdmin={(selectedRole) =>
                    handleToggleRole(teamUser, selectedRole as TeamRole)
                  }
                  onRemove={() => setIsShowingRemove(teamUser)}
                />
              ))}
            </FormItem>
            <Button
              onClick={() => setIsShowingAdd(true)}
              type="button"
              variant="secondary"
              disabled={!organization ? false : !!!isAdmin}
              leftIcon={<Plus size={16} />}
            >
              Add contributors
            </Button>
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1.5">
                <FormLabel className="text-foreground">Description</FormLabel>
                <FormDescription className="!mt-0">
                  Introduce your organization to the Optimism Collective. Share
                  who you are and what you do.
                </FormDescription>
                <Textarea
                  id="description"
                  placeholder="Add a description"
                  className="resize-y min-h-[100px]"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <div>
              <FormLabel>Avatar and cover image</FormLabel>
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
              <FormLabel className="text-sm font-normal">Website</FormLabel>
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
            {/* Only show Add button when the last website field has a value */}
            {shouldShowWebsiteAdd() && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => addWebsiteField({ value: "" })}
                leftIcon={<Plus size={16} />}
              >
                Add
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div>
              <p className="text-sm font-normal">Farcaster</p>
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
            {/* Only show Add button when the last Farcaster field has a value */}
            {shouldShowFarcasterAdd() && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => addFarcasterField({ value: "" })}
                leftIcon={<Plus size={16} />}
              >
                Add
              </Button>
            )}
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

        <div className="flex flex-col gap-2">
          <Button
            disabled={!canSubmit || isSaving || !form.formState.isDirty}
            onClick={form.handleSubmit(onSubmit())}
            type="button"
            className="self-start"
          >
            Save
          </Button>
          {!hasAdmin && (
            <p className="text-sm text-destructive">
              At least one team member must have an admin role.
            </p>
          )}
        </div>
      </form>

      <AddTeamMemberDialog
        open={isShowingAdd}
        onOpenChange={(open) => setIsShowingAdd(open)}
        team={team.map((member) => member.user)}
        addMembers={handleAddMembers}
        title="Add team members"
        subtitle="You can add team members by their email, wallet address, or Farcaster username. They must have an Optimist profile."
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
