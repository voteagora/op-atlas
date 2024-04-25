import React from "react"
import Navbar from "@/components/common/Navbar"

const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-background flex flex-col flex-1 min-h-screen w-full">
      <Navbar />
      {children}
    </div>
  )
}

export default LayoutProvider
