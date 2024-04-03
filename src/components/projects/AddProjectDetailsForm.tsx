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
import FileUploadInput from "../common/FileUploadInput"
import { Button } from "../ui/button"
import { Form, FormField, FormItem, FormMessage } from "../ui/form"

const formSchema = z.object({
  name: z.string().nonempty("Name is required"),
  description: z.string().nonempty("Description is required"),
})

export default function AddProjectDetailsForm() {
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    router.push("/projects/new/team")
    console.log(values, "values")
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
          <div className="flex gap-x-4 mt-3">
            <FileUploadInput
              className="!w-[unset]"
              onChange={() => console.log("file uploaded")}
            >
              <div className="w-40 h-40 card !bg-secondary !rounded-xl flex flex-col justify-center items-center">
                <Image
                  src="/assets/icons/uploadIcon.png"
                  width={20}
                  height={20}
                  alt="img"
                />
                <p className="text-muted-foreground mt-2">Add an avatar</p>
              </div>
            </FileUploadInput>
            <FileUploadInput onChange={() => console.log("file uploaded")}>
              <div className="h-40 w-[90%] card !bg-secondary !rounded-xl flex flex-col justify-center items-center">
                <Image
                  src="/assets/icons/uploadIcon.png"
                  width={20}
                  height={20}
                  alt="img"
                />
                <p className="leading-7 text-muted-foreground mt-2">
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
                <FormItem className="grid w-full  gap-2">
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
            <div className="grid w-full gap-2">
              <p className="mt-1 text-sm font-medium ">Description</p>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="grid w-full gap-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-normal text-secondary-foreground"
                    >
                      Introduce your project to the Optimism Collective. What
                      problem(s) are you solving?
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
