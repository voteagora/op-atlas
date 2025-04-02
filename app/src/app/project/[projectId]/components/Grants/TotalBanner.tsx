import Image from "next/image"

export default function TotalBanner() {
  return (
    <div className="relative rounded-xl bg-[#DED8DF] w-full p-6 flex items-center justify-center overflow-hidden h-[160px]">
      <Image
        className="absolute right-0 bottom-0 z-40"
        src="/assets/images/sunny-banner-big.svg"
        width={256}
        height={256}
        alt="polygon"
      />
      <Image
        className="absolute right-0 bottom-0"
        src="/assets/images/total-banner-polygon.svg"
        width={900}
        height={900}
        alt="polygon"
      />
      <div className="flex items-center justify-center space-x-4 z-50">
        <Image
          src="/assets/chain-logos/optimism-letters.svg"
          width={48}
          height={48}
          alt="Optimism Logo"
        />
        <span className="font-extrabold text-contrast-foreground text-4xl">
          562,288
        </span>
      </div>
    </div>
  )
}
