import { cn } from "@/lib/utils"

interface DropdownItemProps {
  className?: string
  children: React.ReactNode
}

export default function DropdownItem({
  className,
  children,
}: DropdownItemProps) {
  return (
    <div
      className={cn([
        "w-[394px] h-8 rounded-md hover:bg-secondary font-normal text-sm px-2 py-1.5",
        className,
      ])}
    >
      {children}
    </div>
  )
}
