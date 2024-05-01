import React from "react"

import { Input } from "@/components/ui/input"

const NpmPackageManager = () => {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-lg font-semibold">NPM</h3>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Node package manager</p>
        <Input type="text" placeholder="Add a URL" className="w-full" />
      </div>
    </div>
  )
}

export default NpmPackageManager
