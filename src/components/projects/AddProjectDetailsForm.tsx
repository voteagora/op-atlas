"use client"

import * as React from "react"

import Image from "next/image"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
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
import { createNewProject } from "@/lib/actions"
import FileUploadInput from "../common/FileUploadInput"
import { Button } from "../ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"

const CategoryEnum = z.enum([
  "CeFi",
  "Cross Chain",
  "DeFi",
  "Governance",
  "NFT",
  "Social",
  "Utility",
])

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: CategoryEnum,
})

export default function AddProjectDetailsForm() {
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "CeFi",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await createNewProject(values)
      if (!response.project || response.error) {
        throw new Error(response.error)
      }

      router.push(`/projects/${response.project.id}/team`)
    } catch (error) {
      // TODO: Error handling
      console.error("Error creating project", error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-text-default">
            Project details
          </CardTitle>
          <CardDescription className="text-base font-normal text-text-secondary mt-1">
            This information will be visible on your project’s public page.{" "}
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
              onChange={() => console.log("file uploaded")}
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
              onChange={() => console.log("file uploaded")}
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
              <p className="mt-1 text-sm font-medium">Description</p>
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
                      placeholder="Add a description"
                      id="description"
                      {...field}
                    />

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col w-full gap-1.5">
              <p className="mt-1 text-sm font-medium">Category</p>
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
              {/* TODO: Finish category definitions */}
              <button
                className="self-start"
                onClick={(e) => e.preventDefault()}
              >
                <p className="mt-1 text-sm font-medium">
                  View category definitions
                </p>
              </button>
            </div>
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
