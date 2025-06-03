interface CandidateCardProps {
  img: {
    src: string
    alt?: string
  }
  username: string
  organizations: string[]
  buttonLink: string
}

const CandidateCard = ({
  img,
  username,
  organizations,
  buttonLink,
}: CandidateCardProps) => {
  return (
    <div className="w-[272px] h-[40px] pt-[8px] pr-[var(--dimensions-5)] pb-[8px] pl-[var(--dimensions-5)] gap-[8px] rounded-[6px] flex items-center">
      <CardImg src={img.src} alt={img.alt || username} />
      <CardUsername />
      <CardOrganizations />
      <CardButton />
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

const CardUsername = () => {
  return (
    <div className="w-[68px] h-[20px] font-inter font-normal text-[14px] leading-[20px] tracking-[0%] overflow-hidden whitespace-nowrap text-ellipsis">
      Username
    </div>
  )
}

const CardOrganizations = () => {
  return (
    <div className="w-[132px] h-[20px] font-inter font-normal text-[14px] leading-[20px] tracking-[0%] text-[var(--muted-foreground,#636779)] overflow-hidden whitespace-nowrap text-ellipsis">
      Organization, Organization
    </div>
  )
}

const CardButton = () => {
  return (
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
  )
}

export default CandidateCard
