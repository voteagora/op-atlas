import Image from "next/image"

interface CitizenshipBadgeProps {
  variant?: "full" | "icon"
}

export const CitizenshipBadge = ({ variant = "full" }: CitizenshipBadgeProps) => {
  if (variant === "icon") {
    return (
      <div title="Citizen" className="cursor-default">
        <Image
          src="/assets/icons/badgeholder-sunny.png"
          width={20}
          height={20}
          alt="Citizen"
          className="rounded"
        />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-red-200 text-red-600">
      <Image
        src="/assets/icons/badgeholder-sunny-darkred.png"
        width={12}
        height={12}
        alt="Citizen"
      />
      <div>Citizen</div>
    </div>
  )
}
