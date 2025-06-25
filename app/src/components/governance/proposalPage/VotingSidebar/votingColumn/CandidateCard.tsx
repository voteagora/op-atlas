"use client"

interface CandidateCardProps {
  img: {
    src: string
    alt?: string
  }
  username: string
  organizations: string[]
  carrotLink: string
  selected?: boolean
  onClick?: () => void
}

const CandidateCard = ({
  img,
  username,
  organizations,
  carrotLink,
  selected = false,
  onClick,
}: CandidateCardProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <div className="w-[272px] h-[40px] pt-[8px] pr-[var(--dimensions-5)] pb-[8px] pl-[var(--dimensions-5)] gap-[8px] rounded-[6px] flex items-center">
      <CardImg src={img.src} alt={img.alt || username} />
      <CardUsername username={username} />
      <CardOrganizations organizations={organizations} />
      <CardApprovalButton selected={selected} onClick={handleClick} />
      <CardCarrot link={carrotLink} />
    </div>
  )
}

const CardImg = ({
  src,
  alt = "Profile Picture",
}: {
  src: string
  alt?: string
}) => {
  return (
    <div className="w-[20px] h-[20px] rounded-[19px] overflow-hidden">
      <img className="w-full h-full object-cover" src={src} alt={alt} />
    </div>
  )
}

const CardUsername = ({ username }: { username: string }) => {
  return (
    <div className="w-[68px] h-[20px] font-inter font-normal text-[14px] leading-[20px] tracking-[0%] overflow-hidden whitespace-nowrap text-ellipsis">
      {username}
    </div>
  )
}

const CardOrganizations = ({ organizations }: { organizations: string[] }) => {
  return (
    <div className="w-[132px] h-[20px] font-inter font-normal text-[14px] leading-[20px] tracking-[0%] text-[var(--muted-foreground,#636779)] overflow-hidden whitespace-nowrap text-ellipsis">
      {organizations.join(", ")}
    </div>
  )
}

const CardApprovalButton = ({
  selected = false,
  onClick,
}: {
  selected?: boolean
  onClick?: () => void
}) => {
  const bgColor = selected ? "bg-success" : "bg-[#F2F3F8]"

  return (
    <div
      className={`w-[65px] h-[24px] px-2 py-1 gap-2 flex items-center justify-center rounded-md ${bgColor} cursor-pointer`}
    >
      <button
        className="font-medium text-xs leading-4 font-inter"
        onClick={onClick}
      >
        Approve
      </button>
    </div>
  )
}

const CardCarrot = ({ link }: { link: string }) => {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="cursor-pointer"
    >
      <div className="w-[12px] h-[12px] flex items-center justify-center">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.5 9L7.5 6L4.5 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </a>
  )
}

export default CandidateCard
