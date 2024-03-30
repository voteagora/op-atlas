"use client"

import Navbar from "@/components/Navbar"

export default function Page() {
  return (
    <div className="h-screen flex flex-col ">
      <Navbar />
      <div className="flex-1 bg-gradient flex items-end ">
        <div className="card w-3/4 mx-auto h-5/6 "></div>
      </div>
    </div>
  )
}
