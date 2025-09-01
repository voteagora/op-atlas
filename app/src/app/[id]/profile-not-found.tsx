import Image from "next/image"

import { shortenAddress } from "@/lib/utils"

const ProfileNotFound = ({ params }: { params: { id: string } }) => {
  const addressParam = params.id

  return (
    <div className="flex flex-col items-center gap-6 h-app w-full max-w-[450px] m-auto justify-center lg:px-0 px-2">
      <Image
        src={"/assets/images/sunny-empty.svg"}
        alt="Sunny Logo"
        width={80}
        height={80}
      />

      <div className="text-center justify-center text-foreground text-2xl font-semibold leading-loose">
        {shortenAddress(addressParam)}
      </div>

      <div className="text-secondary-foreground text-sm leading-tight">
        This optimist isn’t contributing to any projects yet.
      </div>
    </div>
  )
}

export default ProfileNotFound
