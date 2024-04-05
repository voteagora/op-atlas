"use client"
import * as React from "react"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CodeRepoCheckbox } from "./CodeRepoCheckbox"
import VerifyGithubRepo from "./VerifyGithubRepo"
import NpmPackageManager from "./NpmPackageManager"
import VerifyCodeRepoBanner from "./VerifyCodeRepoBanner"
// import GitRepoDialogue from "./GitRepoDialogue"

const AddCodeRepositoriesCard = () => {
  const [isCodeRepoConfirmed, setIsCodeRepoConfirmed] = React.useState(false)
  return (
    <div>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground">
          Code Repositories
        </CardTitle>
        <CardDescription className="text-base font-normal text-text-secondary !mt-6">
          Verify your project’s Github and NPM repos. Your code may be reviewed
          by badgeholders to aid in voting decisions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mt-6 w-full">
          <CodeRepoCheckbox
            isCodeRepoConfirmed={isCodeRepoConfirmed}
            setIsCodeRepoConfirmed={setIsCodeRepoConfirmed}
          />
          <VerifyCodeRepoBanner />
        </div>
        <VerifyGithubRepo />
        <NpmPackageManager />
        {/* <GitRepoDialogue /> */}
      </CardContent>
    </div>
  )
}

export default AddCodeRepositoriesCard
