import Image from "next/image"
import Link from "next/link"
import React from "react"

const VerifyCodeRepoBanner = () => {
  return (
    <div className="flex justify-between bg-accent rounded-xl p-4 w-full">
      <div className="flex justify-start items-center gap-x-2">
        <Image
          src="/assets/icons/verifyIcon.svg"
          alt="img"
          width={16}
          height={16}
        />
        <p className="text-sm font-medium text-accent-foreground">
          Projects must verify a code repo for Retro Funding Round 4
        </p>
      </div>
      <Link href="#" className=" text-sm font-medium text-accent-foreground">
        Learn more
      </Link>
    </div>
  )
}

export default VerifyCodeRepoBanner
