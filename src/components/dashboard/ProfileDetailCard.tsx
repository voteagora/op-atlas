import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"

const ProfileDetailCard = () => {
  return (
    <div className="flex gap-x-4">
      <Avatar className="w-20 h-20">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div>
        <h2>Shaun Lind 🐰🥕</h2>
        <p>Addicted to coffee and good design.</p>
        <div className="flex items-center gap-x-4 text-sm mt-2">
          <div className="flex items-center gap-x-2">
            <span className="text-text-muted">Username</span>
            <span className="font-medium text-text-secondary">shadcn</span>
          </div>
          <div className="flex items-center gap-x-2">
            <span className="text-text-muted">FCA</span>
            <span className="font-medium text-text-secondary">
              0xD7ce...3765
            </span>
          </div>
          <div className="flex items-center gap-x-2">
            <span className="text-text-muted">Email</span>
            <span className="font-medium text-text-secondary">
              Add your email
            </span>
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
