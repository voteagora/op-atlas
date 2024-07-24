import Image from "next/image"
import Link from "next/link"
import React from "react"

import { Avatar, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"

const Users = [
  "/assets/images/dummy-project-image.png",
  "/assets/images/dummy-project-image.png",
  "/assets/images/dummy-project-image.png",
]

const UserOrganizationTitleRow = () => {
  return (
    <div className="flex justify-between">
      <Link
        href="/profile/organizations/new"
        className="flex gap-3 justify-center items-center "
      >
        <h3 className="text-xl font-semibold">Puky Cats</h3>
        <Badge variant="outline" className="h-[24px] shrink-0">
          Admin
        </Badge>
        <div className="h-full flex flex-row-reverse items-center w-fit ml-1.5">
          {Users.map((user, index) => (
            <Avatar key={index} className="w-6 h-6 -ml-1.5 bg-secondary">
              <AvatarImage src={user} />
            </Avatar>
          ))}
        </div>
        <Image
          src="/assets/icons/arrow-left.svg"
          height={7}
          width={5}
          alt="arrow"
          className="ml-2"
        />
      </Link>
      <Link href="/projects/new">
        <Button className="flex items-center gap-2" variant="secondary">
          <Image src="/assets/icons/plus.svg" width={9} height={9} alt="Plus" />
          Add project
        </Button>
      </Link>
    </div>
  )
}

export default UserOrganizationTitleRow
