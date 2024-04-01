import React from "react"
import Navbar from "@/components/common/Navbar"

interface IProps {
  children: React.ReactNode
}

const LayoutProvider: React.FC<IProps> = ({ children }) => {
  return (
    <div className="h-screen w-screen flex flex-col ">
      <Navbar />
      <div className="flex-1">{children}</div>
    </div>
  )
}

export default LayoutProvider
