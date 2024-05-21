import { Check, Ellipsis } from "lucide-react"
import Image from "next/image"
import { useMemo } from "react"
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
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
  const url = form.watch(`githubRepos.${index}.url`)
  const isVerified = form.watch(`githubRepos.${index}.verified`)
  const isOpenSource = form.watch(`githubRepos.${index}.openSource`)
  const containsContracts = form.watch(`githubRepos.${index}.containsContracts`)

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

      {isVerified && (isOpenSource || containsContracts) ? (
        <div className="flex items-center gap-2">
          {isOpenSource && (
            <div className="flex items-center gap-1 h-6 py-1 px-2 bg-secondary rounded-full">
              <Check size={12} />
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
  )
}
