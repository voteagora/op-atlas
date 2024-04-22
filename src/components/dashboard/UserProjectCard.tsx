import Image from "next/image"
import { Project } from "@prisma/client"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Button } from "../ui/button"

const UserProjectCard = ({
  className,
  project,
}: {
  className?: string
  project: Project
}) => {
  return (
    <div className={cn("flex gap-x-6 border rounded-2xl p-6", className)}>
      <div className="flex items-center justify-center border rounded-lg bg-secondary h-40 w-40">
        <Image src="/assets/icons/plus.svg" width={14} height={14} alt="Plus" />
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex items-center">
          <h3>{project.name}</h3>

          <Progress value={50} className="ml-auto h-2 w-16" />
          <p className="ml-3 text-sm text-secondary-foreground">{32}% setup </p>
          <Link href={`/projects/${project.id}/team`} className="ml-6">
            <Button size="sm" variant="secondary">
              Edit
            </Button>
          </Link>
        </div>

        <div className="mt-4 flex flex-col">
          <p className="text-secondary-foreground">{project.description}</p>
        </div>
      </div>
    </div>
  )
}

export default UserProjectCard
