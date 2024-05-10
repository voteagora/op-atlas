"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { partition } from "ramda"
import { useCallback, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { removeGithubRepo, updatePackageRepos } from "@/lib/actions/repos"
import { ProjectWithDetails } from "@/lib/types"

import { GithubForm } from "./GithubForm"
import { PackageForm } from "./PackageForm"
import { ReposFormSchema } from "./schema"
import { VerifyRepoBanner } from "./VerifyCodeRepoBanner"
import VerifyGithubRepoDialog from "./VerifyGithubRepoDialog"

function toFormValues(project: ProjectWithDetails) {
  const [githubs, packages] = partition(
    (repo) => repo.type === "github",
    project.repos,
  )

  return {
    noRepos: false,
    packages:
      packages.length === 0
        ? [{ url: "" }]
        : packages.map(({ url }) => ({ url })),
    githubRepos:
      githubs.length === 0
        ? [{ url: "", verified: false }]
        : githubs.map(({ url, verified }) => ({
            url,
            verified,
          })),
  }
}

export const ReposForm = ({ project }: { project: ProjectWithDetails }) => {
  const [verifyingUrl, setVerifyingUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()

  const form = useForm<z.infer<typeof ReposFormSchema>>({
    resolver: zodResolver(ReposFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: toFormValues(project),
  })

  const {
    fields: githubFields,
    append: addGithubField,
    remove: removeGithubField,
  } = useFieldArray({
    control: form.control,
    name: "githubRepos",
  })

  const { fields: packageFields, append: addPackageField } = useFieldArray({
    control: form.control,
    name: "packages",
  })

  const hasRepo = !form.watch("noRepos")

  // Should only be called if the url has been validated as a Github repo URL
  const onVerifyRepo = async (index: number) => {
    const url = form.getValues(`githubRepos.${index}.url`)
    setVerifyingUrl(url)
  }

  // Optimistically update the UI state
  const onVerificationComplete = async (url: string) => {
    const repo = form
      .getValues("githubRepos")
      .findIndex((field) => field.url === url)
    if (repo === -1) {
      return
    }

    form.setValue(`githubRepos.${repo}.verified`, true)
    setVerifyingUrl("")
  }

  const onAddGithubField = async () => {
    const valid = form.getValues("githubRepos").every((repo) => repo.verified)
    if (valid) {
      addGithubField({ url: "", verified: false })
    }
  }

  const onRemoveGithubField = async (index: number) => {
    try {
      const isOnlyRepo = githubFields.length === 1
      const url = form.getValues(`githubRepos.${index}.url`)

      await removeGithubRepo(project.id, url)
      removeGithubField(index)

      if (isOnlyRepo) {
        addGithubField({ url: "", verified: false })
      }
    } catch (error) {
      console.error("Error removing repo", error)
    }
  }

  const onAddPackageField = async () => {
    const packages = form.getValues("packages").map((field) => field.url)

    // If the previous URL is blank, do nothing
    if (packages[packages.length - 1] === "") {
      return
    }

    const valid = packages.every(
      (url) => z.string().url().safeParse(url).success,
    )

    if (valid) {
      form.clearErrors(`packages.${packages.length - 1}.url`)
      addPackageField({ url: "" })
    } else {
      form.setError(`packages.${packages.length - 1}.url`, {
        message: "Invalid URL",
      })
    }
  }

  const onSubmit = useCallback(
    async (values: z.infer<typeof ReposFormSchema>) => {
      setIsSubmitting(true)

      // We only need to handle updates to the packages
      const packageUrls = values.packages
        .map((field) => field.url)
        .filter((url) => z.string().url().safeParse(url).success)

      try {
        await updatePackageRepos(project.id, packageUrls)
        router.push(`/projects/${project.id}/contracts`)
      } catch (error) {
        // TODO: Error handling
        setIsSubmitting(false)
        console.error("Error saving packages", error)
      }
    },
    [project.id, router],
  )

  return (
    <>
      <div className="flex flex-col">
        <div className="flex flex-col gap-6">
          <h2>Code Repositories</h2>
          <p className="text-secondary-foreground">
            Verify your project&apos;s Github repos and published packages. Your
            code may be reviewed by badgeholders to aid in voting decisions.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-6 flex flex-col gap-12"
          >
            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="noRepos"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 border border-input p-4 rounded-lg w-full">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-black border-2 rounded-[2px]"
                      />
                    </FormControl>
                    <FormLabel>
                      This project doesn&apos;t have a code repo
                    </FormLabel>
                  </FormItem>
                )}
              />
              <VerifyRepoBanner noRepo={!hasRepo} />
            </div>

            {hasRepo && (
              <>
                <div className="flex flex-col">
                  <h3>Github</h3>
                  <div className="mt-6 flex flex-col gap-2">
                    <div>
                      <FormLabel className="text-foreground">
                        Verify your Github repo
                        <span className="ml-0.5 text-destructive">*</span>
                      </FormLabel>
                      <FormDescription>
                        Your project repo must be public. If you have multiple
                        repos, first verify one then you can add more.
                      </FormDescription>
                    </div>

                    {githubFields.map((field, index) => (
                      <GithubForm
                        key={field.id}
                        form={form}
                        index={index}
                        onVerify={onVerifyRepo}
                        onRemove={onRemoveGithubField}
                      />
                    ))}

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={onAddGithubField}
                      className="w-fit"
                    >
                      <Plus size={16} className="mr-2.5" /> Add repo
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col">
                  <h3>Packages</h3>
                  <div className="mt-6 flex flex-col gap-2">
                    <div>
                      <FormLabel className="text-foreground">Links</FormLabel>
                      <FormDescription>
                        Add any published packages or artifacts.
                      </FormDescription>
                    </div>

                    {packageFields.map((field, index) => (
                      <PackageForm key={field.id} form={form} index={index} />
                    ))}

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={onAddPackageField}
                      className="w-fit"
                    >
                      <Plus size={16} className="mr-2.5" /> Add link
                    </Button>
                  </div>
                </div>
              </>
            )}

            <Button
              isLoading={isSubmitting}
              type="submit"
              variant="destructive"
              className="w-fit"
            >
              Next
            </Button>
          </form>
        </Form>
      </div>

      <VerifyGithubRepoDialog
        url={verifyingUrl}
        open={!!verifyingUrl}
        projectId={project.id}
        onOpenChange={() => setVerifyingUrl("")}
        onVerificationComplete={onVerificationComplete}
      />
    </>
  )
}
