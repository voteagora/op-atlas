"use client"
import React, { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import AddProjectDialogue from "./AddProjectDialogue"

const UserProjectsDetailsSection = () => {
  const router = useRouter()
  const [openDialog, setOpenDialog] = useState(false)

  const handleOpenDialog = () => {
    setOpenDialog(true)
  }

  const handleButtonClick = () => {
    router.push("/projects/new")
  }

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
          <Button variant="destructive" onClick={handleOpenDialog}>
            Add
          </Button>
        </div>
      </div>
      <AddProjectDialogue
        open={openDialog}
        onOpenChange={(open) => setOpenDialog(open)}
        handleButtonClick={handleButtonClick}
      />
    </div>
  )
}

export default UserProjectsDetailsSection
