import Image from "next/image"

import { Avatar, AvatarImage } from "@/components/ui/avatar"

interface UserAvatarProps {
  imageUrl?: string | null
  children?: React.ReactNode
  size?: "xs" | "sm" | "lg"
}

export function UserAvatar({
  imageUrl,
  children,
  size = "lg",
}: UserAvatarProps) {
  // Define size-based constants
  const sizeClasses = (() => {
    switch (size) {
      case "xs":
        return {
          container: "w-5 h-5",
          placeholder: "w-5 h-5",
          iconSize: 11,
        }
      case "sm":
        return {
          container: "w-6 h-6",
          placeholder:
            "w-6 h-6 bg-secondary rounded-full flex items-center justify-center border border-muted",
          iconSize: 8,
        }
      case "lg":
      default:
        return {
          container: "w-20 h-20",
          placeholder: "w-20 h-20",
          iconSize: 18,
        }
    }
  })()

  return imageUrl ? (
    <Avatar className={sizeClasses.container}>
      <AvatarImage src={imageUrl} alt="avatar" />
      {children}
    </Avatar>
  ) : (
    <Avatar className={sizeClasses.container}>
      <div
        className={`${sizeClasses.placeholder} my-0.5 flex items-center justify-center rounded-full border border-dashed border-muted bg-none`}
      >
        <Image
          src="/assets/icons/user-icon.svg"
          alt="user"
          width={sizeClasses.iconSize}
          height={sizeClasses.iconSize}
        />
      </div>
      {children}
    </Avatar>
  )
}
