import { Avatar, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"

interface UserAvatarLargeProps {
    imageUrl?: string | null
}

export function UserAvatarLarge({ imageUrl }: UserAvatarLargeProps) {
    return imageUrl ? (
        <Avatar className="w-20 h-20">
            <AvatarImage src={imageUrl} alt="avatar" />
        </Avatar>
    ) : (
        <div className="w-20 h-20 my-0.5 flex items-center justify-center rounded-full border border-dashed border-muted bg-none"
        >
            <Image
                src="/assets/icons/user-icon.svg"
                alt="user"
                width={18}
                height={18}
            />
        </div>
    )
} 