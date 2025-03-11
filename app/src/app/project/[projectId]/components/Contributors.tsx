import { User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Contributors() {
  return (
    <div className="w-full space-y-6">
      <h4 className="font-semibold text-xl">Contributors</h4>
      <div className="w-full grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
        {CONTRIBUTORS.map((contributor) => (
          <div key={contributor.name} className="flex items-center space-x-4">
            <Avatar className="w-6 h-6">
              <AvatarImage src={contributor.avatarUrl} alt={contributor.name} />
              <AvatarFallback className="p-1">
                <User size={24} />
              </AvatarFallback>
            </Avatar>
            <span className="font-normal text-foreground">
              {contributor.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// TODO: Replace this with actual data
const CONTRIBUTORS = [
  { name: "Emma Anderson", avatarUrl: "/assets/avatars/harper-martinez.png" },
  { name: "Ava Jackson", avatarUrl: "/assets/avatars/olivia-jones.png" },
  { name: "David Brown", avatarUrl: "/assets/avatars/harper-moore.png" },
  { name: "Emma Jones", avatarUrl: "/assets/avatars/alex-brown.png" },
  { name: "Emma Thomas", avatarUrl: "/assets/avatars/benjamin-perez.png" },
  { name: "Mia Thomas", avatarUrl: "/assets/avatars/daniel-perez.png" },
  { name: "William Smith", avatarUrl: "/assets/avatars/ethan-taylor.png" },
  { name: "Chris Jones", avatarUrl: "/assets/avatars/chris-moore.png" },
  { name: "Matthew Smith", avatarUrl: "/assets/avatars/alex-jones.png" },
  { name: "Ava Anderson", avatarUrl: "/assets/avatars/daniel-hernandez.png" },
  { name: "Daniel Williams", avatarUrl: "/assets/avatars/amelia-martinez.png" },
  {
    name: "Jane Hernandez",
    avatarUrl: "/assets/avatars/benjamin-thompson.png",
  },
  { name: "Ava Thompson", avatarUrl: "/assets/avatars/katie-martinez.png" },
  { name: "Sophia Smith", avatarUrl: "/assets/avatars/mia-jones.png" },
  { name: "Amelia Lopez", avatarUrl: "/assets/avatars/chris-jackson.png" },
  { name: "Alex Sanchez", avatarUrl: "/assets/avatars/ava-miller.png" },
  { name: "Laura Jackson", avatarUrl: "/assets/avatars/william-wilson.png" },
  { name: "John Lee", avatarUrl: "/assets/avatars/matthew-williams.png" },
  { name: "Amelia Brown", avatarUrl: "/assets/avatars/sophia-martinez.png" },
  { name: "Katie Sanchez", avatarUrl: "/assets/avatars/robert-williams.png" },
  { name: "Isabella Taylor", avatarUrl: "/assets/avatars/william-moore.png" },
  { name: "Sarah Martinez", avatarUrl: "/assets/avatars/sarah-williams.png" },
  { name: "Robert Johnson", avatarUrl: "/assets/avatars/amelia-williams.png" },
  { name: "Sophia Williams", avatarUrl: "/assets/avatars/david-garcia.png" },
  { name: "Ava Brown", avatarUrl: "/assets/avatars/harper-sanchez.png" },
  { name: "Charlotte Taylor", avatarUrl: "/assets/avatars/mia-jackson.png" },
  { name: "John Martinez", avatarUrl: "/assets/avatars/alex-williams.png" },
  { name: "Michael White", avatarUrl: "/assets/avatars/sarah-johnson.png" },
]
