import { Check, ChevronDown, ChevronUp, Ellipsis } from "lucide-react"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import ExternalLink from "@/components/ExternalLink"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { validateGithubRepo } from "@/lib/actions/repos"
import { copyToClipboard } from "@/lib/utils"

import { ReposFormSchema } from "./schema"

export const GithubForm = ({
  form,
  index,
  onVerify,
  onRemove,
}: {
  form: UseFormReturn<z.infer<typeof ReposFormSchema>>
  index: number
  onVerify: (index: number) => void
  onRemove: (index: number) => void
}) => {
  const [isFormExpanded, setIsRepoFormExpanded] = useState(false)

  const url = form.watch(`githubRepos.${index}.url`)
  const isVerified = form.watch(`githubRepos.${index}.verified`)
  const isOpenSource = form.watch(`githubRepos.${index}.openSource`)
  const containsContracts = form.watch(`githubRepos.${index}.containsContracts`)
  const isNpmPackage = form.watch(`githubRepos.${index}.npmPackage`)
  const isCrate = form.watch(`githubRepos.${index}.crate`)

  const onCopy = async () => {
    try {
      await copyToClipboard(url)
      toast("Copied to clipboard")
    } catch (error) {
      toast.error("Error copying URL")
    }
  }

  const isValid = useMemo(() => {
    try {
      const parsed = new URL(url)
      return (
        parsed.hostname === "github.com" &&
        parsed.pathname.split("/").filter((s) => s.length).length === 2
      )
    } catch (error) {
      return false
    }
  }, [url])

  useEffect(() => {
    const validate = async () => {
      const owner = url.split("/")[3]
      const slug = url.split("/")[4]
      const { isNpmPackage, isCrate, isOpenSource } = await validateGithubRepo(
        owner,
        slug,
      )

      form.setValue(`githubRepos.${index}.npmPackage`, !!isNpmPackage)
      form.setValue(`githubRepos.${index}.crate`, !!isCrate)
      form.setValue(`githubRepos.${index}.openSource`, !!isOpenSource)
    }

    validate()
  }, [url])

  function split() {
    let splits = url.split("/").filter(Boolean)
    return "/" + splits[3] + "/main"
  }

  return (
    <div className="p-6 border border-input rounded-lg">
      <FormLabel className="text-foreground">Github repo</FormLabel>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-1.5">
            <FormField
              control={form.control}
              name={`githubRepos.${index}.url`}
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1.5 w-full">
                  <FormControl>
                    <div className="relative">
                      {isVerified ? (
                        <>
                          <div className="flex gap-2 h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-0 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 items-center">
                            <div className="flex items-center justify-center w-6 h-6">
                              <Check width={20} height={20} />
                            </div>
                            <ExternalLink href={url}>
                              <Image
                                src="/assets/icons/github-icon.svg"
                                width={20}
                                height={20}
                                alt="Tes"
                              />
                            </ExternalLink>

                            <div>{split()}</div>

                            <button onClick={onCopy}>
                              <Image
                                src="/assets/icons/file-copy-line.svg"
                                width={20}
                                height={20}
                                alt="Tes"
                              />
                            </button>

                            {isNpmPackage && (
                              <div className="flex items-center gap-1 h-6 py-1 px-2 bg-secondary rounded-full">
                                <Image
                                  src="/assets/icons/npm.svg"
                                  alt="npm"
                                  width={12}
                                  height={12}
                                />

                                <p className="text-xs font-medium">NPM</p>
                              </div>
                            )}
                            {isCrate && (
                              <div className="flex items-center gap-1 h-6 py-1 px-2 bg-secondary rounded-full">
                                <Image
                                  src="/assets/icons/rust.svg"
                                  alt="rust"
                                  width={12}
                                  height={12}
                                />
                                <p className="text-xs font-medium">Crate</p>
                              </div>
                            )}

                            {isOpenSource && (
                              <div className="flex items-center gap-1 h-6 py-1 px-2 bg-secondary rounded-full">
                                <Image
                                  src="/assets/icons/oss.svg"
                                  alt="oss"
                                  width={12}
                                  height={12}
                                />
                                <p className="text-xs font-medium">
                                  Open source
                                </p>
                              </div>
                            )}

                            {containsContracts && (
                              <div className="flex items-center gap-1 h-6 py-1 px-2 bg-secondary rounded-full">
                                <Check size={12} />
                                <p className="text-xs font-medium">
                                  Contains contracts
                                </p>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <Input
                          {...field}
                          readOnly={isVerified}
                          placeholder="Repository URL"
                          className={isVerified ? "pl-10" : ""}
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isVerified ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary">
                    <Ellipsis size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="cursor-pointer" onClick={onCopy}>
                    Copy URL
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => onRemove(index)}
                  >
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                type="button"
                variant="destructive"
                disabled={!isValid}
                onClick={() => onVerify(index)}
              >
                Verify
              </Button>
            )}
          </div>

          <div className="flex flex-col w-full gap-2">
            <div className="flex items-center gap-2 px-4 py-3">
              <FormField
                control={form.control}
                name={`githubRepos.${index}.containsContracts`}
                render={({ field }) => (
                  <Checkbox
                    name={field.name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />

              <p className="text-sm font-medium">
                This repo contains contract code
              </p>
            </div>
          </div>
        </div>

        {isFormExpanded && (
          <div className="flex flex-col gap-6">
            <FormField
              control={form.control}
              name={`githubRepos.${index}.name`}
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1.5">
                  <FormLabel className="text-foreground">Name</FormLabel>
                  <Input
                    type=""
                    id="name"
                    placeholder="Add a name"
                    {...field}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`githubRepos.${index}.description`}
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1.5">
                  <FormLabel className="text-foreground">Description</FormLabel>

                  <Textarea
                    placeholder="Describe this repo"
                    className="resize-none"
                    {...field}
                  />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
      <Button
        onClick={() => setIsRepoFormExpanded(!isFormExpanded)}
        variant="ghost"
        type="button"
        className="!p-0 text-sm font-medium text-secondary-foreground"
      >
        {isFormExpanded ? "Hide additional inputs" : "Show additional inputs"}{" "}
        {isFormExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </Button>
    </div>
  )
}
