import Image from "next/image"

function OutboundArrowLink({
  text,
  target,
  subtext,
  icon,
}: {
  text: string
  target: string
  subtext?: string
  icon?: React.ReactNode
}) {
  return (
    <a
      href={target}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-x-3"
    >
      {icon}
      <span>{text}</span>
      <Image
        src="/assets/icons/arrow-up-right.svg"
        width={10}
        height={10}
        alt="External link"
        className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
      />
      {subtext && <span className="text-md text-gray-500">{subtext}</span>}
    </a>
  )
}

export default OutboundArrowLink
