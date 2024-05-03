import { Copy } from "lucide-react"
import Image from "next/image"
import { memo, useEffect, useMemo, useState } from "react"

import { DialogProps } from "@/components/dialogs/types"
import CheckIcon from "@/components/icons/checkIcon"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { findRepo, verifyGithubRepo } from "@/lib/actions/repos"
import { copyTextToClipBoard } from "@/lib/utils"

const sampleFullJson = `\
{
  "opRetro": {
    "projectId": "[projectId]"
  }
}`

const samplePartialJson = `\
{
  ...
  "opRetro": {
    "projectId": "[projectId]"
  }
}`

const requiredJson = `\
"opRetro": {
  "projectId": "[projectId]"
}`

type Props = DialogProps<{ projectId: string; url?: string }> & {
  onVerificationComplete: (url: string) => void
}

type Step = "searching" | "json"

const VerifyGithubRepoDialog = ({
  open,
  onOpenChange,
  url,
  projectId,
  onVerificationComplete,
}: Props) => {
  const { toast } = useToast()

  const [step, setStep] = useState<Step>("searching")
  const [hasFundingFile, setHasFundingFile] = useState(false)

  const urlParts = url?.split("/") ?? []
  const owner = urlParts[urlParts.length - 2]
  const slug = urlParts[urlParts.length - 1]

  const onVerified = () => {
    if (url) {
      onVerificationComplete(url)
      onOpenChange(false)
    }
  }

  const onRepoNotFound = () => {
    onOpenChange(false)
    toast({
      title: "Repository not found",
      description: "Please double check that it's public and try again",
      variant: "destructive",
    })
  }

  const onFoundRepo = async () => {
    try {
      const result = await verifyGithubRepo(projectId, owner, slug)
      if (!result.error) {
        onVerified()
        return
      }

      if (result.error === "Invalid funding file") {
        setHasFundingFile(true)
        setStep("json")
        return
      }

      // Assume there isn't a file and we should show the instructions
      setHasFundingFile(false)
      setStep("json")
    } catch (error) {
      console.error("Error fetching funding file", error)
      setHasFundingFile(false)
      setStep("json")
    }
  }

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("searching")
        setHasFundingFile(false)
      }, 500)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center gap-6 sm:max-w-md">
        {owner && slug && step === "searching" ? (
          <SearchRepoStep
            owner={owner}
            slug={slug}
            onContinue={onFoundRepo}
            onNotFound={onRepoNotFound}
          />
        ) : null}
        {owner && slug && step === "json" ? (
          <VerifyFundingStep
            slug={slug}
            owner={owner}
            projectId={projectId}
            hasFundingFile={hasFundingFile}
            onVerified={onVerified}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

const SearchRepoStep = ({
  owner,
  slug,
  onContinue,
  onNotFound,
}: {
  owner: string
  slug: string
  onContinue: () => void
  onNotFound: () => void
}) => {
  const [isSearching, setIsSearching] = useState(true)
  const [isRepoFound, setIsRepoFound] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function searchRepo() {
      const result = await findRepo(owner, slug)
      if (result?.error) {
        // Sometimes the API is so fast it's jarring
        setTimeout(() => {
          onNotFound()
        }, 1000)
      } else {
        setIsRepoFound(true)
        setIsSearching(false)
      }
    }

    searchRepo()
  }, [owner, slug, onNotFound])

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center text-lg font-semibold text-foreground">
          First, let&apos;s find your repo
        </DialogTitle>
        <DialogDescription className="text-center text-base font-normal text-secondary-foreground mt-1">
          Your project repo must be public.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col w-full gap-2">
        <Input
          disabled
          value={`https://github.com/${owner}/${slug}`}
          className="disabled:opacity-100 disabled:cursor-auto text-sm"
        />
        <div className="w-full flex items-center justify-between gap-x-2 py-2 px-3 bg-secondary rounded-lg h-10">
          <div className="flex items-center gap-x-2">
            <Image
              src="/assets/icons/githubIcon.svg"
              alt="Github"
              width={20}
              height={20}
            />
            <p className="ml-1 text-sm text-secondary-foreground">
              {!isRepoFound ? "searching..." : `${owner}/${slug}`}
            </p>
          </div>
          {isRepoFound && <CheckIcon fill="#3374DB" />}
        </div>
      </div>

      <Button
        disabled={isSearching || isLoading || !isRepoFound}
        className="w-full"
        variant="destructive"
        onClick={() => {
          setIsLoading(true)
          onContinue()
        }}
      >
        {isSearching ? (
          <Image
            priority
            className="animate-spin"
            src="/assets/icons/loaderIcon.svg"
            height={16}
            width={16}
            alt=""
          />
        ) : (
          "Continue"
        )}
      </Button>
    </>
  )
}

const VerifyFundingStep = ({
  owner,
  slug,
  projectId,
  hasFundingFile,
  onVerified,
}: {
  owner: string
  slug: string
  projectId: string
  hasFundingFile: boolean
  onVerified: () => void
}) => {
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const json = useMemo(() => {
    if (hasFundingFile) {
      return samplePartialJson.replace("[projectId]", projectId)
    } else {
      return sampleFullJson.replace("[projectId]", projectId)
    }
  }, [hasFundingFile, projectId])

  const onCopy = async () => {
    try {
      await copyTextToClipBoard(requiredJson.replace("[projectId]", projectId))
      toast({ title: "Copied to clipboard " })
    } catch (error) {
      toast({ title: "Error copying JSON", variant: "destructive" })
    }
  }

  const onVerify = async () => {
    try {
      setIsLoading(true)

      const result = await verifyGithubRepo(projectId, owner, slug)
      if (result.error) {
        throw new Error(result.error)
      }

      setError(null)
      onVerified()
    } catch (error) {
      setError(
        "Unable to validate funding.json file. Please make sure the changes have been merged into the default branch and try again",
      )
      setIsLoading(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center text-lg font-semibold text-text-default">
          {hasFundingFile
            ? "Please add the following to your project's funding.json file"
            : "Please add this JSON file to the root of your project"}
        </DialogTitle>
        <DialogDescription className="text-center text-base font-normal text-secondary-foreground mt-1">
          Once you&apos;ve made the changes, click below to verify the repo.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col w-full gap-1">
        <p className="text-sm font-medium">funding.json</p>
        <div className="relative w-full">
          <Button
            size="sm"
            variant="ghost"
            onClick={onCopy}
            className="absolute right-2 top-2 p-1.5 h-fit"
          >
            <Copy size={16} />
          </Button>
          <Textarea
            readOnly
            className="border rounded-md min-h-fit resize-none font-mono"
            value={json}
            style={{ height: hasFundingFile ? "140px" : "120px" }}
          />
        </div>
      </div>

      <div className="flex flex-col w-full">
        {error && (
          <p className="text-destructive text-xs text-center px-3 mb-3">
            {error}
          </p>
        )}
        <Button
          className=""
          disabled={isLoading}
          variant="destructive"
          onClick={onVerify}
        >
          Verify
        </Button>
      </div>
    </>
  )
}

export default memo(VerifyGithubRepoDialog)
