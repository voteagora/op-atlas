"use client"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { Button } from "../ui/button"

interface IProps {
  projectAvatar?: string
  projectName: string
  projectProgress: number
}

const UserProjectStatusDetailCard: React.FC<IProps> = ({
  projectName,
  projectProgress,
}) => {
  return (
    <div className="flex items-start gap-6">
      <div className="card flex items-center justify-center !bg-secondary h-40 w-40">
        <Image
          src="/assets/icons/uploadIcon.png"
          width={20}
          height={20}
          alt=""
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-text-default">{projectName}</h3>
          <div className="flex justify-center items-center  gap-x-4">
            <Progress value={projectProgress} className="w-[64px] h-2" />
            <p className="text-sm font-normal">{projectProgress}% setup </p>
            <Button variant="secondary">Edit</Button>
          </div>
        </div>
        <p className="text-base font-normal text-secondary-foreground mt-4">
          Project setup is incomplete —
          <span className="font-medium">continue editing</span>
        </p>
      </div>
    </div>
  )
}

export default UserProjectStatusDetailCard
