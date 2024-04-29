import React from "react"
import { Input } from "@/components/ui/input"

const NpmPackageManager = () => {
  return (
    <div className="flex flex-col gap-6">
      <h3 className=" text-lg font-semibold">NPM</h3>
      <div>
        <p className=" text-sm font-medium">
          Enter your node package manager URL
        </p>
        <p className=" text-sm font-normal text-secondary-foreground">
          If you have multiple repos, first verify one then you can add more.
        </p>
        <Input type="text" placeholder="Add a URL" className="w-full mt-2" />
      </div>
    </div>
  )
}

export default NpmPackageManager
