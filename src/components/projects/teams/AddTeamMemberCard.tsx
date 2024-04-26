import Image from "next/image"

export const AddTeamMemberCard = ({ onClick }: { onClick: () => void }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={onClick}
    className="aspect-square border bg-secondary rounded-xl flex flex-1 flex-col justify-center items-center select-none"
  >
    <Image src="/assets/icons/plusIcon.svg" width={14} height={14} alt="add" />
    <p className="text-muted-foreground text-xs text-center mt-2">
      Add a team
      <br /> member
    </p>
  </div>
)
