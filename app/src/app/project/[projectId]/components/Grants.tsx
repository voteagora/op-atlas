import Image from "next/image"

export default function Grants() {
  return (
    <div className="w-full space-y-6">
      <h4>Grants</h4>
      <ul className="pl-6 space-y-2">
        {GRANTS.map(({ title, type, date }) => (
          <li
            key={`${title} ${type} ${date}`}
            className="flex items-center space-x-2"
          >
            {type === "retro-grant" && (
              <Image
                src="/assets/icons/sunny-black.svg"
                width={24}
                height={24}
                alt={`Retro Grant ${title}`}
              />
            )}
            {type === "op-grant" && (
              <Image
                src="/assets/icons/shining-black.svg"
                width={24}
                height={24}
                alt={`Optimism Grant ${title}`}
              />
            )}
            <p>
              <span className="font-medium text-foreground">{title}</span>
              <span className="text-secondary-foreground"> · {date}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

// TODO: Replace this with actual data
const GRANTS = [
  {
    type: "retro-grant",
    title: "Retro Funding Mission: Onchain Builders",
    date: "Feb 12 - July 30, 2025",
  },
  {
    type: "op-grant",
    title: "Optimism Grant: Token House Mission",
    date: "Oct 2024",
  },
  {
    type: "retro-grant",
    title: "Retro Funding 4: Onchain Builders",
    date: "May 2024",
  },
  {
    type: "retro-grant",
    title: "Retro Funding 3",
    date: "Oct 2023",
  },
]
//
