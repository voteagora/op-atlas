"use client"
import React from "react"
import Image from "next/image"

interface IProps {
  onClick: () => void
}

const AddFirstProjectSection: React.FC<IProps> = ({ onClick }) => {
  return (
    <button className="flex items-center gap-6" onClick={onClick}>
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
