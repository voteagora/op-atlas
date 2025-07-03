import Image from "next/image"

import { Avatar, AvatarImage } from "@/components/ui/avatar"

interface Props {
  imageUrl?: string | null
  children?: React.ReactNode
  size?: "sm" | "lg"
}

export const userAvatarSmall = ({ imageUrl, children }: Props) => {
  return imageUrl ? (
    <Avatar className="w-5 h-5">
      <AvatarImage src={imageUrl} alt="avatar" />
      {children}
    </Avatar>
  ) : (
    <Avatar className="w-5 h-5">
      <div
        className={`w-5 h-5 my-0.5 flex items-center justify-center rounded-full border border-dashed border-muted bg-none`}
      >
        <Image
          src="/assets/icons/user-icon.svg"
          alt="user"
          width={11}
          height={11}
        />
      </div>
      {children}
    </Avatar>
  )
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

export function UserAvatarVariable({ imageUrl, children, size }: Props) {
  switch (size) {
    case "sm":
      return userAvatarSmall({ imageUrl, children, size })
    case "lg":
      return UserAvatarLarge({ imageUrl, children, size })
    default:
      return UserAvatarLarge({ imageUrl, children, size })
  }
}
