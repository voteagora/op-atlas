import Image from "next/image"
import React, { useState } from "react"

import CheckIcon from "@/components/icons/checkIcon"
import MenuIcon from "@/components/icons/menuIcon"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { isValidGitHubRepoUrl } from "@/lib/utils"

import AddGitRepoDialogue from "./AddGitRepoDialogue"

const VerifyGithubRepo: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState("")
  const [isValidUrl, setIsValidUrl] = useState(false)
  const [openDialogue, setOpenDialogue] = useState(false)
  const [addedRepos, setAddedRepos] = useState<string[]>([])
  const [error, setError] = useState("")

  const handleUrlChange = (event: any) => {
    const inputUrl = event.target.value
    setRepoUrl(inputUrl)

    const isMatched = isValidGitHubRepoUrl(inputUrl)

    if (inputUrl && !isMatched) {
      setError("Enter a valid URL")
    } else {
      setError("")
    }
    setIsValidUrl(isMatched)
  }

  const handleOpenDialogue = () => {
    setOpenDialogue(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-lg font-semibold">Github</h3>
      <div>
        <p className="text-sm font-medium">
          Verify your Github repo<span className="text-destructive">*</span>
        </p>
        <p className="text-sm font-normal text-secondary-foreground">
          Your project repo must be public. If you have multiple repos, first
          verify one then you can add more.
        </p>

        {addedRepos.length === 0 ? (
          <div className="flex flex-row mt-2 gap-x-2 w-full">
            <Input
              type="text"
              placeholder="Add a URL"
              className="w-full"
              value={repoUrl}
              onChange={handleUrlChange}
            />
            <Button
              variant="destructive"
              onClick={handleOpenDialogue}
              disabled={!isValidUrl}
            >
              Search
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mt-2">
            {addedRepos.map((repo, index) => (
              <div className="flex gap-x-2 w-full" key={index}>
                <div className="flex items-center space-x-2 border border-input p-3 rounded-lg w-full">
                  <CheckIcon className="!fill-accent-foreground" />

                  <p className="text-sm font-medium text-foreground">
                    {repo ? repo : "Add a URL"}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="secondary">
                      <MenuIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Delete Repo</DropdownMenuLabel>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm font-medium text-destructive mt-2">{error}</p>
        )}

        {addedRepos.length > 0 && (
          <Button
            onClick={handleOpenDialogue}
            className="mt-2"
            variant="secondary"
          >
            <Image
              className="mr-2"
              src="/assets/icons/plusIcon.svg"
              width={9}
              height={9}
              alt=""
            />
            Add repo
          </Button>
        )}

        <AddGitRepoDialogue
          setAddedRepos={setAddedRepos}
          addedRepos={addedRepos}
          open={openDialogue}
          repoUrl={repoUrl}
          onOpenChange={(open) => setOpenDialogue(open)}
        />
      </div>
    </div>
  )
}

export default VerifyGithubRepo
