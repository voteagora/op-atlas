import * as React from "react"
import Image from "next/image"

interface AddTeamMemberCardProps {
  onAddTeamBoxClicked: () => void
}

export const AddTeamMemberCard: React.FC<AddTeamMemberCardProps> = ({
  onAddTeamBoxClicked,
}) => (
  <div
    onClick={onAddTeamBoxClicked}
    onKeyDown={onAddTeamBoxClicked}
    role="button"
    tabIndex={0}
    className="w-[172px] h-36 border bg-secondary rounded-xl flex flex-col justify-center items-center"
  >
    <Image src="/assets/icons/plusIcon.svg" width={14} height={14} alt="img" />
    <p className="text-muted-foreground text-xs text-center mt-2">
      Add a team
      <br /> member
    </p>
  </div>
)
