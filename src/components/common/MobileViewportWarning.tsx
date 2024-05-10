import Image from "next/image"

export function MobileViewportWarning() {
  return (
    <div className="w-screen flex-1 flex flex-col justify-center items-center p-10 bg-white">
      <div className="flex flex-col items-center gap-6">
        <Image
          src="/assets/icons/sunny-red.svg"
          height={80}
          width={80}
          alt="Sun face"
        />
        <div className="text-text-secondary text-center">
          The mobile version of this site isn&apos;t ready yet. Please use your
          desktop computer.
        </div>
      </div>
    </div>
  )
}
