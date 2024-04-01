import React from "react"
import Image from "next/image"
import { Button } from "../ui/button"

const UserProjectsDetailsSection = () => {
  return (
    <div>
      <h3 className="text-foreground">Your Projects</h3>
      <div className="card flex items-center gap-6 mt-6">
        <div className="card flex items-center justify-center !bg-secondary h-40 w-40">
          <Image
            src="/assets/icons/uploadIcon.png"
            width={20}
            height={20}
            alt=""
          />
        </div>
        <h3 className="text-text-default">Add your first project</h3>
        <div className="flex-1 flex justify-end">
          <Button variant="destructive">Add</Button>
        </div>
      </div>
    </div>
  )
}

export default UserProjectsDetailsSection
