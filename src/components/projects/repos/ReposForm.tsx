"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { partition } from "ramda"
import { useCallback, useMemo, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import ExternalLink from "@/components/ExternalLink"
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { updateProjectDetails } from "@/lib/actions/projects"
import {
  removeGithubRepo,
  setProjectLinks,
  updateGithubRepos,
} from "@/lib/actions/repos"
import { ProjectWithDetails } from "@/lib/types"

import { GithubForm } from "./GithubForm"
import { LinkForm } from "./LinkForm"
import { ReposFormSchema } from "./schema"
import VerifyGithubRepoDialog from "./VerifyGithubRepoDialog"

function toFormValues(project: ProjectWithDetails) {
  const [githubs] = partition((repo) => repo.type === "github", project.repos)

  return {
    noRepos: project.hasCodeRepositories === false,
    links: !!!project?.links?.length
      ? [{ url: "", name: "", description: "" }]
      : //this name and description with be replace with live data
        project.links?.map(({ url, name, description }) => ({
          url,
          name: name ?? "",
          description: description ?? "",
        })),
    githubRepos:
      githubs.length === 0
        ? [{ url: "", name: "", description: "", verified: false }]
        : githubs.map(
            ({
              url,
              verified,
              openSource,
              containsContracts,
              name,
              description,
            }) => ({
              url,
              verified,
              openSource,
              containsContracts,
              name: name ?? "",
              description: description ?? "",
            }),
          ),
  }
}

export const ReposForm = ({ project }: { project: ProjectWithDetails }) => {
  const [verifyingUrl, setVerifyingUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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

  const { fields: linkFields, append: addLinkField } = useFieldArray({
    control: form.control,
    name: "links",
  })

  const hasRepo = !form.watch("noRepos")

  // Should only be called if the url has been validated as a Github repo URL
  const onVerifyRepo = async (index: number) => {
    const url = form.getValues(`githubRepos.${index}.url`)
    setVerifyingUrl(url)
  }

  // Optimistically update the UI state
  const onVerificationComplete = async (
    url: string,
    openSource: boolean,
    containsContracts: boolean,
  ) => {
    const repo = form
      .getValues("githubRepos")
      .findIndex((field) => field.url === url)
    if (repo === -1) {
      return
    }

    toast.success("Github repo verified")
    form.setValue(`githubRepos.${repo}.verified`, true)
    form.setValue(`githubRepos.${repo}.openSource`, openSource)
    form.setValue(`githubRepos.${repo}.containsContracts`, containsContracts)
    setVerifyingUrl("")
  }

  const onAddGithubField = async () => {
    const valid = form.getValues("githubRepos").every((repo) => repo.verified)
    if (valid) {
      addGithubField({
        url: "",
        verified: false,
        openSource: false,
        containsContracts: false,
        name: "",
        description: "",
      })
    }
  }

  const onRemoveGithubField = async (index: number) => {
    try {
      const isOnlyRepo = githubFields.length === 1
      const url = form.getValues(`githubRepos.${index}.url`)

      await removeGithubRepo(project.id, url)
      removeGithubField(index)

      if (isOnlyRepo) {
        addGithubField({
          url: "",
          verified: false,
          openSource: false,
          containsContracts: false,
          name: "",
          description: "",
        })
      }
    } catch (error) {
      console.error("Error removing repo", error)
    }
  }

  const onAddLinkField = async () => {
    const links = form.getValues("links").map((field) => field.url)
    // If the previous URL is blank, do nothing
    if (links[links.length - 1] === "") {
      return
    }

    const valid = links.every((url) => z.string().url().safeParse(url).success)
    if (valid) {
      form.clearErrors(`links.${links.length - 1}.url`)
      addLinkField({ url: "", name: "", description: "" })
    } else {
      form.setError(`links.${links.length - 1}.url`, {
        message: "Invalid URL",
      })
    }
  }

  const onSubmit = useCallback(
    (isSave: boolean) => async (values: z.infer<typeof ReposFormSchema>) => {
      isSave ? setIsSaving(true) : setIsSubmitting(true)

      const links = values.links
        .map((field) => ({
          url: field.url,
          name: field.name,
          description: field.description,
          projectId: project.id,
        }))
        .filter((field) => z.string().url().safeParse(field.url).success)

      const projectRepos = values.githubRepos.map((field) => ({
        url: field.url,
        updates: {
          name: field.name,
          description: field.description,
        },
      }))

      try {
        await Promise.allSettled([
          updateGithubRepos(project.id, projectRepos),
          setProjectLinks(project.id, links),
          updateProjectDetails(
            project.id,
            {
              hasCodeRepositories: !values.noRepos,
            },
            project.organization?.organizationId,
          ),
        ])

        !isSave && router.push(`/projects/${project.id}/contracts`)
        setIsSaving(false)
        toast.success("Project saved")
      } catch (error) {
        toast.error("There was an error updating your Repos and Links")
        isSave ? setIsSaving(false) : setIsSubmitting(false)
        console.error("Error saving packages", error)
      }
    },
    [project.id, project.organization?.organizationId, router],
  )

  const links = form.watch("links")
  const isValidToAddLink = useMemo(() => {
    return (
      links[links.length - 1].url !== "" &&
      z
        .string()
        .url()
        .safeParse(links[links.length - 1].url).success
    )
  }, [links])

  return (
    <>
      <div className="flex flex-col">
        <div className="flex flex-col gap-6">
          <h2>Repos & Links</h2>
          <p className="text-secondary-foreground">
            Verify your project&apos;s Github repos, and add links to anything
            else that&apos;s relevant to this project&apos;s impact.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit(false))}
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
                      />
                    </FormControl>
                    <FormLabel>
                      This project doesn&apos;t have a code repo
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            {hasRepo && (
              <>
                <div className="flex flex-col gap-y-6">
                  <h3 className="text-text-default">
                    About open source licensing in Retro Funding rounds{" "}
                  </h3>
                  <p className="text-text-secondary">
                    Voters can add additional rewards for open source projects.
                    If your project is open source, then make sure you have a
                    license in your Github repo. If you don’t have a license in
                    your repo, your project will not qualify as open source and
                    won’t be rewarded as such.
                  </p>
                  <p className="text-secondary-foreground">
                    To get a license, visit the{" "}
                    <ExternalLink
                      href="https://opensource.org/"
                      className="text-foreground font-medium"
                    >
                      Open Source Initiative
                    </ExternalLink>
                  </p>
                </div>

                <div className="flex flex-col">
                  <h3 className="text-text-default">Repos</h3>
                  <p className="mt-4 text-base font-normal text-text-secondary">
                    Enter your project’s GitHub repo URL and complete the steps
                    to verify ownership. If you have multiple repos, first
                    verify one then you can add more.
                  </p>
                  <div className="mt-6 flex flex-col gap-6">
                    {githubFields.map((field, index) => (
                      <GithubForm
                        key={field.id}
                        form={form}
                        index={index}
                        onVerify={onVerifyRepo}
                        onRemove={onRemoveGithubField}
                      />
                    ))}
                  </div>
                  <Tooltip>
                    <TooltipTrigger type="button" className="w-fit">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={
                          !form
                            .getValues("githubRepos")
                            .every((repo) => repo.verified)
                        }
                        onClick={onAddGithubField}
                        className="mt-4 w-fit"
                      >
                        <Plus size={16} className="mr-2.5" /> Add another repo
                      </Button>
                    </TooltipTrigger>
                    {!form
                      .getValues("githubRepos")
                      .every((repo) => repo.verified) && (
                      <TooltipContent>
                        <p className="text-sm">
                          First add one, then you can add more
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </div>
              </>
            )}

            <div className="flex flex-col">
              <h3>Links</h3>
              <p className="mt-4 text-text-secondary">
                Link to anything relevant to this project’s impact. For example,
                a data analysis project might link to a metrics dashboard.
              </p>
              <div className="mt-6 flex flex-col gap-6">
                {linkFields.map((field, index) => (
                  <LinkForm key={field.id} form={form} index={index} />
                ))}
              </div>

              <Tooltip>
                <TooltipTrigger type="button" className="w-fit">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={!isValidToAddLink}
                    onClick={onAddLinkField}
                    className="mt-4 w-fit"
                  >
                    <Plus size={16} className="mr-2.5" /> Add another link
                  </Button>
                </TooltipTrigger>
                {!isValidToAddLink && (
                  <TooltipContent>
                    <p className="text-sm">
                      First add one, then you can add more
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>

            <div className="flex gap-2">
              <Button
                isLoading={isSaving}
                onClick={form.handleSubmit(onSubmit(true))}
                type="button"
                variant="destructive"
                className="w-fit"
              >
                Save
              </Button>
              <Button
                isLoading={isSubmitting}
                type="submit"
                variant="secondary"
                className="w-fit"
              >
                Next
              </Button>
            </div>
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
