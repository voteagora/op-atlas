import Image from "next/image"

export const CitizenshipBadge = () => {
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
