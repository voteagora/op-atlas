import { AlertTriangleIcon, EyeOff, Info } from "lucide-react"

export default function AlertContainer({
  children,
  type,
  isMember,
}: {
  children: React.ReactNode
  type: "info" | "danger"
  isMember?: boolean
}) {
  return (
    <li className="group flex items-start space-x-1 text-secondary-foreground text-sm font-normal">
      {type === "danger" && (
        <AlertTriangleIcon
          size={16}
          fill="#FF0420"
          className="text-background mt-0.5 shrink-0"
        />
      )}
      {type === "info" && (
        <Info size={16} fill="#404454" className="text-background mt-0.5" />
      )}
      <p className="!text-secondary-foreground !text-sm !font-normal">
        {children}
      </p>
      {isMember && (
        <EyeOff
          size={16}
          className="group-hover:opacity-100 transition-all duration-300 opacity-0"
        />
      )}
    </li>
  )
}
