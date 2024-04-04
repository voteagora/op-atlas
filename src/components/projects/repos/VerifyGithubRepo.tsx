import React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const VerifyGithubRepo = () => {
  return (
    <div>
      <h3 className=" text-lg font-semibold mt-12">Github</h3>
      <p className=" text-sm font-medium mt-6">Verify your Github repo*</p>
      <p className=" text-sm font-normal text-secondary-foreground">
        Your project repo must be public. If you have multiple repos, first
        verify one then you can add more.
      </p>
      <div className="flex flex-row mt-2 gap-x-2 w-full">
        <Input type="text" placeholder="Add a URL" className="w-full" />
        <Button variant="destructive">Search</Button>
      </div>
    </div>
  )
}

export default VerifyGithubRepo
