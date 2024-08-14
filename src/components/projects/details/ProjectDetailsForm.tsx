"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Organization, Project } from "@prisma/client"
import { Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createNewProject, updateProjectDetails } from "@/lib/actions/projects"
import { ProjectWithDetails } from "@/lib/types"
import { uploadImage } from "@/lib/utils/images"
import { useAnalytics } from "@/providers/AnalyticsProvider"

import FileUploadInput from "../../common/FileUploadInput"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion"
import { Button } from "../../ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form"
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group"
import { CategoryDefinitions } from "./CategoryDefinitions"
import { PhotoCropModal } from "./PhotoCropModal"

const CategoryEnum = z.enum([
  "CeFi",
  "Cross Chain",
  "DeFi",
  "Governance",
  "NFT",
  "Social",
  "Utility",
])

const StringValue = z.object({ value: z.string() }) // use a intermediate object to represent String arrays because useFieldArray only works on object arrays

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  category: CategoryEnum,
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

export default function ProjectDetailsForm({
  project,
  organizations,
}: {
  project?: ProjectWithDetails
  organizations: Organization[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { track } = useAnalytics()

  const orgId = searchParams.get("orgId")

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
      category: project?.category
        ? (project.category as z.infer<typeof CategoryEnum>)
        : "CeFi",
      website: toStringObjectArr(project?.website ?? [""]),
      farcaster: toStringObjectArr(project?.farcaster ?? [""]),
      twitter: project?.twitter ?? undefined,
      mirror: project?.mirror ?? undefined,
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

  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(
      organizations.find(
        (org) => org.id === project?.organization?.organizationId,
      ) || null,
    )

  const avatarUrl = useMemo(() => {
    if (!newAvatarImg) return project?.thumbnailUrl
    return URL.createObjectURL(newAvatarImg)
  }, [newAvatarImg, project?.thumbnailUrl])

  const bannerUrl = useMemo(() => {
    if (!newBannerImg) return project?.bannerUrl
    return URL.createObjectURL(newBannerImg)
  }, [newBannerImg, project?.bannerUrl])

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

  const handleSelect = (organization: (typeof organizations)[0] | null) => {
    setSelectedOrganization(organization)
  }

  const onSubmit =
    (isSave: boolean) => async (values: z.infer<typeof formSchema>) => {
      isSave ? setIsSaving(true) : setIsLoading(true)

      let thumbnailUrl = project?.thumbnailUrl
      let bannerUrl = project?.bannerUrl

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

      track("Project Categorisation", {
        category: values.category,
        projectId: project?.id,
      })

      const newValues = {
        ...values,
        thumbnailUrl,
        bannerUrl,
        website: fromStringObjectArr(values.website),
        farcaster: fromStringObjectArr(values.farcaster),
      }

      const isCreating = !project

      const promise: Promise<Project> = new Promise(async (resolve, reject) => {
        try {
          const response = project
            ? await updateProjectDetails(
                project.id,
                newValues,
                selectedOrganization?.id,
              )
            : await createNewProject(newValues, selectedOrganization?.id)

          if (response.error !== null || !response.project) {
            throw new Error(response.error ?? "Failed to save project")
          }

          if (isCreating) {
            track("Add Project", { projectId: response.project.id })
          }

          resolve(response.project)
        } catch (error) {
          console.error("Error creating project", error)
          reject(error)
        }
      })

      toast.promise(promise, {
        loading: isCreating ? "Creating project..." : "Saving project...",
        success: (project) => {
          isSave
            ? router.replace(`/projects/${project.id}/details`)
            : router.push(`/projects/${project.id}/contributors`)
          setIsSaving(false)
          return isCreating ? "Project created!" : "Project saved"
        },
        error: () => {
          isSave ? setIsSaving(false) : setIsLoading(false)
          return "Failed to save project"
        },
      })
    }

  useEffect(() => {
    if (orgId) {
      setSelectedOrganization(
        organizations.find((org) => org.id === orgId) || null,
      )
    }
  }, [orgId, organizations])

  const canSubmit = form.formState.isValid && !form.formState.isSubmitting

  return (
    <Form {...form}>
      {bannerSrc && (
        <PhotoCropModal
          open
          title="Project cover image"
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
          title="Project avatar"
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
          <h2>Project details</h2>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1.5">
                <FormLabel className="text-foreground">
                  Name<span className="ml-0.5 text-destructive">*</span>
                </FormLabel>
                <Input
                  type=""
                  id="name"
                  placeholder="Add a project name"
                  className="line-clamp-2"
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <DropdownMenu>
            <div className="w-full">
              <FormLabel className="text-foreground">
                Organization<span className="ml-0.5 text-destructive">*</span>
              </FormLabel>
              <DropdownMenuTrigger asChild>
                <div className="h-10 py-2.5 px-3 flex  text-foreground items-center rounded-lg border border-input mt-2">
                  {selectedOrganization?.avatarUrl && (
                    <Avatar className="w-5 h-5 mr-2">
                      <AvatarImage
                        src={selectedOrganization?.avatarUrl ?? ""}
                        alt="avatar"
                      />
                      <AvatarFallback>
                        {selectedOrganization?.name}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <p className="text-sm text-foreground">
                    {selectedOrganization?.name ?? "No Organization"}
                  </p>
                  <Image
                    className="ml-auto"
                    src="/assets/icons/arrowDownIcon.svg"
                    height={8}
                    width={10}
                    alt="Arrow up"
                  />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="!w-[750px]">
                {organizations?.map((organization) => (
                  <DropdownMenuCheckboxItem
                    className="text-sm font-normal text-secondary-foreground w-full"
                    checked={selectedOrganization?.id === organization.id}
                    key={organization.id}
                    onCheckedChange={() => handleSelect(organization)}
                  >
                    <Avatar className="w-5 h-5 mr-2">
                      <AvatarImage
                        src={organization.avatarUrl || ""}
                        alt="avatar"
                      />
                      <AvatarFallback>{organization.name}</AvatarFallback>
                    </Avatar>
                    {organization.name}
                  </DropdownMenuCheckboxItem>
                ))}

                <DropdownMenuCheckboxItem
                  className="text-sm font-normal text-secondary-foreground w-full"
                  checked={selectedOrganization === null}
                  onCheckedChange={() => handleSelect(null)}
                >
                  No organization
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem className="text-sm font-normal text-secondary-foreground w-full">
                  <Link href="/profile/organizations/new">
                    Make an organization
                  </Link>
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </div>
          </DropdownMenu>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1.5">
                <FormLabel className="text-foreground">
                  Description<span className="ml-0.5 text-destructive">*</span>
                </FormLabel>
                <FormDescription className="!mt-0 text-secondary-foreground">
                  Introduce your project to the Optimism Collective. Share who
                  you are and what you do.
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
                Project avatar and cover image
                <span className="ml-0.5 text-destructive">*</span>
              </FormLabel>
              <div className="text-sm text-muted-foreground">
                Images must be no larger than 4.5 MB.
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
                <div className="border border-solid rounded-md overflow-hidden h-32 aspect-square flex-1 bg-secondary flex flex-col justify-center items-center gap-2 select-none">
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
                <div className="border border-solid h-40 overflow-hidden bg-secondary rounded-md flex flex-col justify-center items-center gap-2 select-none">
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
              <FormLabel className="text-sm font-medium">
                Category<span className="ml-0.5 text-destructive">*</span>
              </FormLabel>
              <div className="text-secondary-foreground text-sm">
                Choose a single category that best applies to this project. Your
                selection won&apos;t be visible to voters and has no impact on
                Retro Funding.
              </div>
            </div>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="gap-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid md:grid-cols-3 grid-cols-1 gap-2"
                    >
                      {CategoryEnum.options.map((category) => (
                        <FormItem key={category}>
                          <FormLabel className="flex-1 min-w-6 basis-0 p-3 flex items-center gap-3 border rounded-sm">
                            <FormControl>
                              <RadioGroupItem value={category} />
                            </FormControl>
                            {category}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Accordion type="single" collapsible className="w-fit">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <p className="text-sm font-medium">
                    View category definitions
                  </p>
                </AccordionTrigger>
                <AccordionContent>
                  <CategoryDefinitions />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="flex flex-col gap-1.5">
            <div>
              <FormLabel className="text-sm font-medium">Website</FormLabel>
              <div className="text-sm text-muted-foreground">
                If your organization has more than one website, you can add
                rows.
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
          <Button
            isLoading={isLoading}
            disabled={!canSubmit || isLoading}
            type="submit"
            variant="secondary"
            className="self-start"
          >
            Next
          </Button>
        </div>
      </form>
    </Form>
  )
}
