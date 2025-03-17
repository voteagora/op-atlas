import { ProjectRepository } from "@prisma/client"
import Image from "next/image"
import Link from "next/link"

interface ReposProps {
  repos?: (ProjectRepository & { tags?: { name: string; icon: string }[] })[]
}

export default function Repos({ repos }: ReposProps) {
  if (!repos?.length) {
    return null
  }

  return (
    <div className="w-full space-y-6">
      <h4 className="font-semibold text-xl">Repos</h4>
      <ul className="space-y-2 pl-6">
        {repos.map((repo, index) => {
          return (
            <li key={index} className="flex gap-2 items-center flex-wrap">
              <Image
                src="/assets/icons/github-icon.svg"
                width={24}
                height={24}
                alt="Project Repo"
              />
              <Link href={repo.url} className="text-foreground">
                {repo.url}
              </Link>
              {repo.tags?.map((tag, index) => (
                <li
                  key={index}
                  className="flex items-center space-x-1 px-2 py-1.5 bg-secondary rounded-full"
                >
                  <Image src={tag.icon} width={12} height={12} alt={tag.name} />
                  <span className="text-secondary-foreground text-xs font-medium">
                    {tag.name}
                  </span>
                </li>
              ))}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
