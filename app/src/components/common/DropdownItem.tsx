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
        "w-full rounded hover:bg-secondary font-normal text-sm px-2 py-1",
      ])}
    >
      {children}
    </div>
  )
}
