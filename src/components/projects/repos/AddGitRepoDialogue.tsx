"use client"

import { Copy } from "lucide-react"
import Image from "next/image"
import {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"

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
import { copyTextToClipBoard } from "@/lib/utils"

interface IProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  repoUrl: string
  setAddedRepos: Dispatch<SetStateAction<string[]>>
  addedRepos: string[]
}

const dummyJson = `{
  name: "Dummy Project",
  description: "This is a dummy project for testing purposes.",
  repositories: [
    {
      name: "Dummy Repository 1",
      url: "https://github.com/dummyuser/dummy-repo1",
    },
    {
      name: "Dummy Repository 2",
      url: "https://github.com/dummyuser/dummy-repo2",
    },
  ],
}`

const GitRepoDialogue: React.FC<IProps> = ({
  open,
  onOpenChange,
  repoUrl,
  setAddedRepos,
  addedRepos,
}) => {
  const [isSearching, setIsSearching] = useState(false)
  const [isRepoFound, setIsRepoFound] = useState(false)
  const [dialogueStep, setDialogueStep] = useState(0)

  const urlParts = repoUrl?.split("/")
  const repository = urlParts?.slice(-2)?.join("/")

  useEffect(() => {
    if (open) {
      setDialogueStep(0)
      setIsSearching(true)
      setIsRepoFound(false)
      setTimeout(() => {
        setIsSearching(false)
        setIsRepoFound(true)
      }, 2000)
    }
  }, [open])

  const handleIncrementStep = () => {
    setDialogueStep((prev) => prev + 1)
  }

  const handleDecrementStep = () => {
    setDialogueStep((prev) => prev - 1)
  }

  const handleConfirmed = useCallback(() => {
    setAddedRepos([...addedRepos, repoUrl])
    onOpenChange(false)
  }, [addedRepos, onOpenChange, repoUrl, setAddedRepos])

  const dialogueContent = useMemo(() => {
    switch (dialogueStep) {
      case 0:
        return (
          <SearchRepoForm
            onContinue={handleIncrementStep}
            repoUrl={repoUrl}
            isRepoFound={isRepoFound}
            isSearching={isSearching}
            repository={repository}
          />
        )

      case 1:
        return (
          <JsonFileCard
            repository={repository}
            onContinue={handleIncrementStep}
          />
        )
      case 2:
        return <ConfirmationCard onConfirmed={handleConfirmed} />

      default:
        return (
          <SearchRepoForm
            repoUrl={repoUrl}
            isRepoFound={isRepoFound}
            isSearching={isSearching}
            repository={repository}
          />
        )
    }
  }, [
    dialogueStep,
    handleConfirmed,
    isRepoFound,
    isSearching,
    repoUrl,
    repository,
  ])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col items-center sm:max-w-md">
        {dialogueStep > 0 && (
          <Image
            className="absolute left-3 top-3 cursor-pointer"
            src="/assets/icons/arrowLeftIcon.svg"
            width={13}
            height={12}
            alt=""
            onClick={handleDecrementStep}
          />
        )}

        {dialogueContent}
      </DialogContent>
    </Dialog>
  )
}

const SearchRepoForm: React.FC<{
  repoUrl: string
  isRepoFound: boolean
  isSearching: boolean
  repository: string
  onContinue?: () => void
}> = ({ repoUrl, isRepoFound, isSearching, repository, onContinue }) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center text-lg font-semibold text-text-default">
          First, let’s find your repo
        </DialogTitle>
        <DialogDescription className="text-center text-base font-normal text-text-secondary mt-1">
          Your project repo must be public.
        </DialogDescription>
      </DialogHeader>
      <Input
        defaultValue={repoUrl}
        readOnly
        type="text"
        placeholder="https://github.com/puky-cats-dapp/main"
      />
      <Button
        className="w-full flex items-center justify-between gap-x-1"
        variant="secondary"
      >
        <div className="flex items-center gap-x-1">
          <Image
            src="/assets/icons/githubIcon.svg"
            alt="img"
            width={20}
            height={19}
          />
          {!isRepoFound ? " searching..." : repository}
        </div>
        {isRepoFound && <CheckIcon className="!fill-accent-foreground" />}
      </Button>
      <Button
        disabled={isSearching || !isRepoFound}
        className="w-full disabled:opacity-1"
        variant="destructive"
        onClick={onContinue}
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

const JsonFileCard: React.FC<{
  repository: string
  onContinue?: () => void
}> = ({ repository, onContinue }) => {
  const { toast } = useToast()

  const handleCopyText = () => {
    copyTextToClipBoard(dummyJson)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          variant: "default",
        })
      })
      .catch(() => {
        toast({
          title: "Failed to copy to clipboard",
          variant: "destructive",
        })
      })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center text-lg font-semibold text-text-default">
          Next, please add this json file to the default branch of your repo
        </DialogTitle>
        <DialogDescription className="text-center text-base font-normal text-text-secondary mt-1">
          ...{repository}/main
        </DialogDescription>
      </DialogHeader>
      <p className="text-sm font-medium text-text-default text-left w-full">
        retrofunding.json
      </p>
      <div className="relative w-full">
        <Copy
          size={20}
          className="absolute right-4 top-3 cursor-pointer"
          onClick={handleCopyText}
        />
        <Textarea readOnly defaultValue={dummyJson} className="min-h-40" />
      </div>

      <Button
        className="w-full disabled:opacity-1"
        variant="destructive"
        onClick={onContinue}
      >
        Add to Github
      </Button>
    </>
  )
}

const ConfirmationCard: React.FC<{
  onConfirmed?: () => void
}> = ({ onConfirmed }) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-center text-lg font-semibold text-text-default">
          Confirmation
        </DialogTitle>
        <DialogDescription className="text-center text-base font-normal text-text-secondary mt-1">
          Confirm that you’ve added retrofunding.json to the default branch of
          your repo.
        </DialogDescription>
      </DialogHeader>

      <Button
        className="w-full disabled:opacity-1"
        variant="destructive"
        onClick={onConfirmed}
      >
        Confirm
      </Button>
    </>
  )
}

export default memo(GitRepoDialogue)
