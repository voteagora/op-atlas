import { ProjectRepository } from "@prisma/client"
import { Copy } from "lucide-react"
import Image from "next/image"
import { memo, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { DialogProps } from "@/components/dialogs/types"
import CheckIcon from "@/components/icons/checkIcon"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  findRepo,
  updateGithubRepo,
  createGithubRepo,
} from "@/lib/actions/repos"
import { copyToClipboard } from "@/lib/utils"

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
  onVerificationComplete: (
    url: string,
    openSource: boolean,
    containsContracts: boolean,
    npmPackage: boolean,
    crate: boolean,
  ) => void
}

type Step = "searching" | "json" | "contracts"

const VerifyGithubRepoDialog = ({
  open,
  onOpenChange,
  url,
  projectId,
  onVerificationComplete,
}: Props) => {
  const [step, setStep] = useState<Step>("searching")
  const [hasFundingFile, setHasFundingFile] = useState(false)
  const [openSource, setOpenSource] = useState(false)
  const [containsContracts, setContainsContracts] = useState(false)
  const [npmPackage, setNpmPackage] = useState(false)
  const [crate, setCrate] = useState(false)

  const urlParts = url?.replace(/.*github.com\//, "").split("/") ?? []
  const owner = urlParts[0]
  const slug = urlParts[1]

  const onAdded = () => {
    if (url) {
      onVerificationComplete(
        url,
        openSource,
        containsContracts,
        npmPackage,
        crate,
      )
      onOpenChange(false)
    }
  }

  const onVerified = (repo: ProjectRepository) => {
    setOpenSource(repo.openSource)
    setNpmPackage(repo.npmPackage)
    setCrate(repo.crate)
    setStep("contracts")
  }

  const onRepoNotFound = () => {
    onOpenChange(false)
    toast.error("Repository not found", {
      description: "Please double check that it's public and try again",
    })
  }

  const onFoundRepo = async () => {
    try {
      const result = await createGithubRepo(projectId, owner, slug)
      if (result.error === null && result.repo) {
        onVerified(result.repo)
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
            owner={owner}
            slug={slug}
            projectId={projectId}
            hasFundingFile={hasFundingFile}
            onVerified={onVerified}
          />
        ) : null}
        {url && step === "contracts" ? (
          <ContractCodeStep
            repoUrl={url}
            projectId={projectId}
            onConfirmed={onAdded}
            containsContracts={containsContracts}
            setContainsContracts={setContainsContracts}
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
  onVerified: (repo: ProjectRepository) => void
}) => {
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
      const jsonToCopy = hasFundingFile
        ? requiredJson.replace("[projectId]", projectId)
        : sampleFullJson.replace("[projectId]", projectId)
      await copyToClipboard(jsonToCopy)

      toast("Copied to clipboard")
    } catch (error) {
      toast.error("Error copying JSON")
    }
  }

  const onVerify = async () => {
    try {
      setIsLoading(true)

      const result = await createGithubRepo(projectId, owner, slug)
      if (result.error === null && result.repo) {
        setError(null)
        onVerified(result.repo)
        return
      }

      throw new Error(result.error ?? "Unknown error")
    } catch (error: unknown) {
      console.error("Error verifying funding file", error)

      if (error instanceof Error) {
        if (error.message === "No funding file found") {
          setError(
            "We couldn't find a funding.json or FUNDING.json file in this repo.",
          )
        } else if (error.message === "Invalid funding file") {
          setError(
            "The funding.json file is not valid JSON or is missing the project ID.",
          )
        } else if (error.message === "Repo already exists") {
          setError(
            "The repository you are trying to verify has already been verified by this project or another one.",
          )
        } else {
          setError(
            "Unable to validate funding.json file. Please make sure the changes have been merged into the default branch and try again",
          )
        }
      } else {
        setError(
          "Unable to validate funding.json file. Please make sure the changes have been merged into the default branch and try again",
        )
      }
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
            style={{ height: hasFundingFile ? "178px" : "158px" }}
          />
        </div>
      </div>

      <div className="flex flex-col w-full">
        {error && (
          <p className="text-destructive text-xs text-center px-3 mb-3">
            {error}
          </p>
        )}
        <Button disabled={isLoading} variant="destructive" onClick={onVerify}>
          Verify
        </Button>
      </div>
    </>
  )
}

const ContractCodeStep = ({
  repoUrl,
  projectId,
  onConfirmed,
  containsContracts,
  setContainsContracts,
}: {
  repoUrl: string
  projectId: string
  containsContracts: boolean
  setContainsContracts: (value: boolean) => void
  onConfirmed: () => void
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const toggleContainsContracts = () => {
    setContainsContracts(!containsContracts)
  }

  const onConfirm = async () => {
    if (!containsContracts) {
      onConfirmed()
      return
    }

    setIsLoading(true)
    try {
      await updateGithubRepo(projectId, repoUrl, { containsContracts })
      onConfirmed()
    } catch (error) {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center text-lg font-semibold text-text-default">
          Confirmation
        </DialogTitle>
        <DialogDescription className="text-center text-base font-normal text-secondary-foreground mt-1">
          Your repo has been verified! One final question: does it contain smart
          contract code?
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col w-full gap-2">
        <div className="flex items-center gap-2 px-4 py-3 border rounded-md">
          <Checkbox
            checked={containsContracts}
            onCheckedChange={toggleContainsContracts}
          />
          <p className="text-sm font-medium">
            This repo contains contract code
          </p>
        </div>

        <Button disabled={isLoading} variant="destructive" onClick={onConfirm}>
          Verify
        </Button>
      </div>
    </>
  )
}

export default memo(VerifyGithubRepoDialog)
