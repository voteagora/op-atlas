import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { useAppDialogs } from "@/providers/DialogProvider"

interface IProps {
  profileImageUrl?: string
  userFullName: string
  userBio: string
  userName: string
  fca: string
  email?: string
}

const ProfileDetailCard: React.FC<IProps> = ({
  profileImageUrl,
  userFullName,
  userBio,
  userName,
  fca,
  email,
}) => {
  const { setOpenDialog } = useAppDialogs()
  return (
    <div className="flex gap-x-4">
      <Avatar className="w-20 h-20">
        <AvatarImage src={profileImageUrl ?? ""} />
        <AvatarFallback>SL</AvatarFallback>
      </Avatar>
      <div>
        <h2>{userFullName}</h2>
        <p>{userBio}</p>
        <div className="flex items-center gap-x-4 text-sm mt-2">
          <div className="flex items-center gap-x-2">
            <span className="text-text-muted">Username</span>
            <span className="font-medium text-text-secondary">{userName}</span>
          </div>
          <div className="flex items-center gap-x-2">
            <span className="text-text-muted">FCA</span>
            <span className="font-medium text-text-secondary">{fca}</span>
          </div>
          <div className="flex items-center gap-x-2">
            <span className="text-text-muted">Email</span>
            <Button
              variant="link"
              onClick={() => setOpenDialog("email")}
              className="font-medium text-text-secondary p-0"
            >
              {email ? email : "Add your email"}
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 flex justify-end">
        <Button variant="secondary">Edit Profile</Button>
      </div>
    </div>
  )
}

export default ProfileDetailCard
