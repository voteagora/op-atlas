import Image from "next/image"

import { Avatar, AvatarImage } from "@/components/ui/avatar"

interface Props {
  imageUrl?: string | null
  children?: React.ReactNode
}

export function UserAvatarLarge({ imageUrl, children }: Props) {
  return imageUrl ? (
    <Avatar className="w-20 h-20">
      <AvatarImage src={imageUrl} alt="avatar" />
      {children}
    </Avatar>
  ) : (
    <Avatar className="w-20 h-20">
      <div className="w-20 h-20 my-0.5 flex items-center justify-center rounded-full border border-dashed border-muted bg-none">
        <Image
          src="/assets/icons/user-icon.svg"
          alt="user"
          width={18}
          height={18}
        />
      </div>
      {children}
    </Avatar>
  )
}
