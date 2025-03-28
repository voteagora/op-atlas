import { ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function EnrolledInRetrofundingBanner() {
  return (
    <div className="w-full px-3 py-2.5 rounded-lg bg-gradient-to-t from-[#FF0420] to-[#FF4B04] text-white text-sm font-medium flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Image
          src="/assets/icons/sunny-white.svg"
          width={20}
          height={20}
          alt="Project Profile"
        />
        <span>This project is currently enrolled in </span>
        {/* TODO: Replace href to lead where needed */}
        <Link href={"#"} className="underline">
          Retro Funding: Onchain Builders
        </Link>
      </div>
      {/* TODO: Replace href to lead where needed */}
      <span className="flex items-center space-x-1">
        <Link href={"#"}>View performance</Link>
        <ChevronRight size={16} />
      </span>
    </div>
  )
}
