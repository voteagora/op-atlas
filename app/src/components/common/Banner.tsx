import Link from "next/link"
import { usePathname } from "next/navigation"

import { ArrowRight } from "@/components/icons/reminx"

export const Banner = () => {
  const pathname = usePathname()

  const shouldShowBanner =
    pathname === "/" ||
    pathname === "/dashboard" ||
    pathname === "/missions" ||
    pathname.startsWith("/round/")

  if (!shouldShowBanner) return null

  return (
    <div className="flex w-full bg-[#3374DB] text-white p-4 items-center justify-center">
      <Link
        href="/citizenship"
        className="hover:underline flex flex-row gap-2 items-center"
      >
        <div>Citizen Registration for Season 8 is now open</div>
        <ArrowRight className="w-[18px] h-[18px]" fill="#fff" />
      </Link>
    </div>
  )
}
