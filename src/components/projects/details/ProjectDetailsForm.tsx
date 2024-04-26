"use client"

import { useState } from "react"

import Image from "next/image"
import { Plus } from "lucide-react"

import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Project } from "@prisma/client"
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createNewProject, updateProjectDetails } from "@/lib/actions/projects"
import { CategoryDefinitions } from "./CategoryDefinitions"
import { PhotoCropModal } from "./PhotoCropModal"
import FileUploadInput from "../../common/FileUploadInput"
import { Button } from "../../ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form"
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion"

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
  description: z.string().min(1, "Description is required"),
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

export default function ProjectDetailsForm({ project }: { project?: Project }) {
  const router = useRouter()

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const newValues = {
      ...values,
      website: fromStringObjectArr(values.website),
      farcaster: fromStringObjectArr(values.farcaster),
    }
    try {
      const response = project
        ? await updateProjectDetails(project.id, newValues)
        : await createNewProject(newValues)

      if (response.error !== null || !response.project) {
        throw new Error(response.error ?? "Failed to save project")
      }

      router.push(`/projects/${response.project.id}/team`)
    } catch (error) {
      // TODO: Error handling
      console.error("Error creating project", error)
    }
  }

  const [avatarSrc, setAvatarSrc] = useState<string>()
  const [bannerSrc, setBannerSrc] = useState<string>()

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

  return (
    <Form {...form}>
      {bannerSrc && (
        <PhotoCropModal
          title="Project cover image"
          image={bannerSrc}
          open
          onOpenChange={(open) => {
            if (!open) onCloseCropModal("banner")
          }}
        />
      )}
      {avatarSrc && (
        <PhotoCropModal
          title="Project avatar"
          aspectRatio={1}
          image={avatarSrc}
          open
          onOpenChange={(open) => {
            if (!open) onCloseCropModal("avatar")
          }}
        />
      )}
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-text-default">
            Project details
          </CardTitle>
          <CardDescription className="text-base font-normal text-text-secondary mt-1">
            This information will be visible on your project&apos;s public page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-6">
            <CardTitle className="text-sm font-medium text-text-default">
              Avatar and cover image
            </CardTitle>
            <CardDescription className="text-sm font-normal text-text-secondary mt-1">
              Images must be no larger than 5MB.
            </CardDescription>
          </div>
          <div className="flex flex-1 gap-x-4 mt-3 items-stretch">
            <FileUploadInput
              className="flex-1"
              onChange={(e) => {
                if (!e.target.files || e.target.files.length < 1) return

                const file = e.target.files[0]
                setAvatarSrc(URL.createObjectURL(file))
              }}
            >
              <div className="border border-solid rounded-xl p-7 h-40 flex-1 bg-secondary flex flex-col justify-center items-center gap-2">
                <Image
                  src="/assets/icons/upload.svg"
                  width={20}
                  height={20}
                  alt="img"
                />
                <p className="text-muted-foreground text-xs">
                  Add project avatar
                </p>
              </div>
            </FileUploadInput>
            <FileUploadInput
              className="flex-[4]"
              onChange={(e) => {
                if (!e.target.files || e.target.files.length < 1) return

                const file = e.target.files[0]
                setBannerSrc(URL.createObjectURL(file))
              }}
            >
              <div className="border border-solid h-40 p-7 bg-secondary rounded-xl flex flex-col justify-center items-center gap-2">
                <Image
                  src="/assets/icons/upload.svg"
                  width={20}
                  height={20}
                  alt="img"
                />
                <p className="leading-7 text-muted-foreground text-xs">
                  Add a cover image
                </p>
              </div>
            </FileUploadInput>
          </div>

          <div className="grid w-full gap-6 mt-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grid w-full gap-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    type=""
                    id="name"
                    placeholder="Add a project name"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col w-full gap-1.5">
              <p className="text-sm font-medium">Description</p>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full gap-1.5">
                    <Label
                      htmlFor="description"
                      className="text-sm font-normal text-secondary-foreground"
                    >
                      Introduce your project to the Optimism Collective. Share
                      who you are and what you do.
                    </Label>
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
            </div>
            <div className="flex flex-col w-full gap-1.5">
              <p className="text-sm font-medium">Category</p>
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
              <Accordion type="single" collapsible className="self-">
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

            <div className="flex flex-col gap-2">
              <div>
                <p className="text-sm font-medium">Website</p>
                <div className="text-sm font-normal text-secondary-foreground">
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

            <div className="flex flex-col gap-2">
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
                <FormItem>
                  <FormLabel>
                    <p className="text-sm font-medium">Twitter</p>
                  </FormLabel>
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
                <FormItem>
                  <FormLabel>
                    <p className="text-sm font-medium">Mirror</p>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Add a link" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            disabled={!form.formState.isValid}
            type="submit"
            variant="destructive"
          >
            Next
          </Button>
        </CardFooter>
      </form>
    </Form>
  )
}
