"use client"

import React, { ChangeEvent, useRef } from "react"

interface FileUploadInputProps {
  children: React.ReactNode
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  accept?: string
  [key: string]: any
  className?: string
}

const FileUploadInput: React.FC<FileUploadInputProps> = ({
  children,
  onChange,
  accept = "image/*",
  className,
  ...props
}) => {
  const ref = useRef<HTMLInputElement>(null)

  const selectImage = () => {
    if (ref.current) {
      ref.current.click()
    }
  }

  return (
    <div
      className={`${className} w-full`}
      onClick={selectImage}
      onKeyDown={selectImage}
      role="button"
      tabIndex={0}
    >
      {children}
      <input
        {...props}
        ref={ref}
        onChange={onChange}
        style={{ display: "none" }}
        type="file"
        size={10000}
        accept={accept}
      />
    </div>
  )
}

export default FileUploadInput
