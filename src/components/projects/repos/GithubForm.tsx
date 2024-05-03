import { Ellipsis } from "lucide-react"
import Image from "next/image"
import { useMemo } from "react"
import { UseFormReturn } from "react-hook-form"
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
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { copyTextToClipBoard } from "@/lib/utils"

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
  const { toast } = useToast()

  const isVerified = form.watch(`githubRepos.${index}.verified`)
  const url = form.watch(`githubRepos.${index}.url`)

  const onCopy = async () => {
    try {
      await copyTextToClipBoard(url)
      toast({ title: "Copied to clipboard " })
    } catch (error) {
      toast({ title: "Error copying URL", variant: "destructive" })
    }
  }

  const isValid = useMemo(() => {
    try {
      const parsed = new URL(url)
      return parsed.hostname === "github.com"
    } catch (error) {
      return false
    }
  }, [url])

  return (
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
  )
}
