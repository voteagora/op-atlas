import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

export const VerifyRepoBanner = ({ noRepo }: { noRepo?: boolean }) => {
  return (
    <div
      className={cn(
        "flex items-center rounded-xl p-4 w-full",
        noRepo
          ? "bg-red-200 text-destructive-foreground"
          : "bg-accent text-accent-foreground",
      )}
    >
      <Image
        alt="Info"
        src={
          noRepo ? "/assets/icons/info-red.svg" : "/assets/icons/info-blue.svg"
        }
        width={16.5}
        height={16.5}
      />
      <p className="ml-2 mr-5 text-sm font-medium">
        {noRepo
          ? "This project is not eligible for Retro Funding Round 4. However, it may be eligible for future rounds. You can continue to the next step."
          : "Projects must verify a code repo for Retro Funding Round 4"}
      </p>
      <Link href="#" className="ml-auto text-sm font-medium shrink-0">
        Learn more
      </Link>
    </div>
  )
}
