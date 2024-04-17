"use client"
import React from "react"
import Image from "next/image"

interface IProps {
  onButtonClick: () => void
}

const AddFirstProjectSection: React.FC<IProps> = ({ onButtonClick }) => {
  return (
    <button className="flex items-center gap-6" onClick={onButtonClick}>
      <div className="card flex items-center justify-center !bg-secondary h-40 w-40">
        <Image src="/assets/icons/plus.svg" width={14} height={14} alt="Plus" />
      </div>
      <h3 className="text-text-default font-semibold">
        Add your first project
      </h3>
    </button>
  )
}

export default AddFirstProjectSection
