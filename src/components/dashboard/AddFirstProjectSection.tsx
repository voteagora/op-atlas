"use client"
import React from "react"
import Image from "next/image"
import { Button } from "../ui/button"

interface IProps {
  onButtonClick: () => void
}

const AddFirstProjectSection: React.FC<IProps> = ({ onButtonClick }) => {
  return (
    <div className="flex items-center gap-6">
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
        <Button variant="destructive" onClick={onButtonClick}>
          Add
        </Button>
      </div>
    </div>
  )
}

export default AddFirstProjectSection
