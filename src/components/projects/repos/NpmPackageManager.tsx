import React from "react"
import { Input } from "@/components/ui/input"

const NpmPackageManager = () => {
  return (
    <div>
      <h3 className=" text-lg font-semibold mt-12">NPM</h3>
      <p className=" text-sm font-medium mt-6">
        Enter your node package manager URL
      </p>
      <p className=" text-sm font-normal text-secondary-foreground">
        If you have multiple repos, first verify one then you can add more.
      </p>
      <Input type="text" placeholder="Add a URL" className="w-full mt-2" />
    </div>
  )
}

export default NpmPackageManager
