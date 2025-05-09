import { Avatar, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"

interface UserAvatarSmallProps {
    imageUrl?: string | null
}

export function UserAvatarSmall({ imageUrl }: UserAvatarSmallProps) {
    return imageUrl ? (
        <Avatar className="w-6 h-6">
            <AvatarImage src={imageUrl} alt="avatar" />
        </Avatar>
    ) : (
        <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center border border-muted">
            <Image
                src="/assets/icons/user-icon.svg"
                alt="user"
                width={8}
                height={8}
            />
        </div>
    )
} 