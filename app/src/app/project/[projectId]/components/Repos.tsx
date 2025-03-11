import Image from "next/image"
import Link from "next/link"

export default function Repos() {
  return (
    <div className="w-full space-y-6">
      <h4 className="font-semibold text-xl">Repos</h4>
      <ul className="space-y-2 pl-6">
        {REPOS.map((repo, index) => (
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
            {repo.tags.map((tag, index) => (
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
        ))}
      </ul>
    </div>
  )
}
const TAGS = [
  {
    name: "Open Source",
    icon: "/assets/icons/open-source-fill.svg",
  },
  {
    name: "NPM",
    icon: "/assets/icons/npm-fill.svg",
  },
  {
    name: "10 months old",
    icon: "/assets/icons/time-fill.svg",
  },
  {
    name: "100 stars",
    icon: "/assets/icons/star-fill.svg",
  },
  {
    name: "100 trusted forks",
    icon: "/assets/icons/git-fork-fill.svg",
  },
]

const REPOS = [
  {
    url: "link_placeholder/ipsum.com",
    tags: TAGS,
  },
  {
    url: "link_placeholder/loremipsum.com",
    tags: TAGS,
  },
]
