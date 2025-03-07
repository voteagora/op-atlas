import Link from "next/link"

export default function EnrolledInRetrofundingBanner() {
  return (
    <div className="w-full px-3 py-2.5 rounded-lg bg-gradient-to-t from-[#FF0420] to-[#FF4B04] text-white text-sm font-medium">
      This project is currently enrolled in{" "}
      {/* TODO: Replace href to lead where needed */}
      <Link href={"#"} className="underline">
        Retro Funding: Onchain Builders
      </Link>
    </div>
  )
}
