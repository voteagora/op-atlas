"use client"

import { useState } from "react"

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
  const [isHoveringButton, setIsHoveringButton] = useState(false)

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  const handleListItemClick = () => {
    const profileUrl = carrotLink.includes("http") ? carrotLink : `/${username}`
    window.open(profileUrl, "_blank")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleListItemClick()
    }
  }

  return (
    <div
      className="group w-[272px] h-[40px] pt-[8px] pr-[var(--dimensions-5)] pb-[8px] pl-[var(--dimensions-5)] gap-[8px] rounded-[6px] flex items-center cursor-pointer hover:bg-secondary transition-colors duration-200"
      onClick={handleListItemClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View profile of ${username}`}
    >
      <CardImg src={img.src} alt={img.alt || username} />
      <CardUsername username={username} isHoveringButton={isHoveringButton} />
      <CardOrganizations organizations={organizations} />
      <CardApprovalButton
        selected={selected}
        onClick={handleClick}
        onMouseEnter={() => setIsHoveringButton(true)}
        onMouseLeave={() => setIsHoveringButton(false)}
      />
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

const CardUsername = ({
  username,
  isHoveringButton,
}: {
  username: string
  isHoveringButton: boolean
}) => {
  return (
    <div
      className={`w-[68px] h-[20px] font-inter font-normal text-[14px] leading-[20px] tracking-[0%] overflow-hidden whitespace-nowrap text-ellipsis transition-all duration-200 ${
        !isHoveringButton ? "group-hover:underline" : ""
      }`}
    >
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
  onMouseEnter,
  onMouseLeave,
}: {
  selected?: boolean
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) => {
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onClick) {
      onClick()
    }
  }

  return (
    <button
      className={`w-[65px] h-[24px] px-2 py-1 gap-2 flex items-center justify-center rounded-md border transition-all duration-200 ${
        selected
          ? "bg-success text-success-foreground border-success"
          : "bg-background text-foreground border-border hover:bg-[#D6FFDA] hover:border-[#7AF088] hover:text-[#006117]"
      }`}
      onClick={handleButtonClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className="font-medium text-xs leading-4 font-inter">
        {selected ? "Approved" : "Approve"}
      </span>
    </button>
  )
}

const CardCarrot = ({ link }: { link: string }) => {
  return (
    <div className="w-[12px] h-[12px] flex items-center justify-center pointer-events-none">
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
  )
}

export default CandidateCard
