import React from "react"
import Navbar from "@/components/common/Navbar"

interface IProps {
  children: React.ReactNode
}

const LayoutProvider: React.FC<IProps> = ({ children }) => {
  return (
    <div className="bg-background flex flex-col flex-1 min-h-screen w-full">
      <Navbar />
      {children}
    </div>
  )
}

export default LayoutProvider
