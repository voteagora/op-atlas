"use client"
import Image from "next/image"
import React from "react"

import { Account } from "./Account"

const Navbar = () => {
  return (
    <nav className="sticky inset-x-0 top-0 h-18 bg-white flex items-center justify-between px-6 shadow-sm z-20">
      <Image
        src="/assets/images/logo.svg"
        height={24}
        width={167}
        priority
        alt=""
      />
      <Account />
    </nav>
  )
}

export default Navbar
