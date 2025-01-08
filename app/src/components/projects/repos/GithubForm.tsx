import { Check, ChevronDown, ChevronUp, Ellipsis } from "lucide-react"
import Image from "next/image"
import { useMemo, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  const [isFormExpanded, setIsRepoFormExpanded] = useState(true)

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

  return (
    <div className="p-6 border border-input rounded-lg">
      <FormLabel className="text-foreground">
        Verify your Github repo
        <span className="ml-0.5 text-destructive">*</span>
      </FormLabel>
      <FormDescription className="mb-2">
        Your project repo must be public. If you have multiple repos, first
        verify one then you can add more.
      </FormDescription>

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
                      <Input
                        {...field}
                        readOnly={isVerified}
                        placeholder="Repository URL"
                        className={isVerified ? "pl-10" : ""}
                      />
                      {isVerified && (
                        <Image
                          alt="Verified"
                          src="/assets/icons/circle-check-green.svg"
                          height={20}
                          width={20}
                          className="absolute left-3 top-2.5"
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

          {isVerified ? (
            <div className="flex items-center gap-2">
              {isNpmPackage && (
                <div className="flex items-center gap-1 h-6 py-1 px-2 bg-secondary rounded-full">
                  <img
                    src="/assets/icons/npm.svg"
                    alt="npm"
                    className="w-3 h-3"
                  />

                  <p className="text-xs font-medium">NPM</p>
                </div>
              )}
              {isCrate && (
                <div className="flex items-center gap-1 h-6 py-1 px-2 bg-secondary rounded-full">
                  <img
                    src="/assets/icons/rust.svg"
                    alt="rust"
                    className="w-3 h-3"
                  />
                  <p className="text-xs font-medium">Crate</p>
                </div>
              )}

              {isOpenSource && (
                <div className="flex items-center gap-1 h-6 py-1 px-2 bg-secondary rounded-full">
                  <img
                    src="/assets/icons/oss.svg"
                    alt="oss"
                    className="w-3 h-3"
                  />
                  <p className="text-xs font-medium">Open source</p>
                </div>
              )}

              {containsContracts && (
                <div className="flex items-center gap-1 h-6 py-1 px-2 bg-secondary rounded-full">
                  <Check size={12} />
                  <p className="text-xs font-medium">Contains contracts</p>
                </div>
              )}
            </div>
          ) : null}
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
        className="!p-0 text-sm font-medium text-secondary-foreground"
      >
        {isFormExpanded ? "Hide additional inputs" : "Show additional inputs"}{" "}
        {isFormExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </Button>
    </div>
  )
}
