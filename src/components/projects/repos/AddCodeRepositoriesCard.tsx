"use client"
import * as React from "react"
import { CodeRepoCheckbox } from "./CodeRepoCheckbox"
import VerifyGithubRepo from "./VerifyGithubRepo"
import NpmPackageManager from "./NpmPackageManager"
import VerifyCodeRepoBanner from "./VerifyCodeRepoBanner"

const AddCodeRepositoriesCard = () => {
  const [isCodeRepoConfirmed, setIsCodeRepoConfirmed] = React.useState(false)
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6">
        <h2>Code Repositories</h2>
        <div className="text-text-secondary">
          Verify your project’s Github and NPM repos. Your code may be reviewed
          by badgeholders to aid in voting decisions.
        </div>
        <div className="flex flex-wrap gap-2 first-letter:w-full">
          <CodeRepoCheckbox
            isCodeRepoConfirmed={isCodeRepoConfirmed}
            setIsCodeRepoConfirmed={setIsCodeRepoConfirmed}
          />
          <VerifyCodeRepoBanner />
        </div>
      </div>
      <VerifyGithubRepo />
      <NpmPackageManager />
    </div>
  )
}

export default AddCodeRepositoriesCard
