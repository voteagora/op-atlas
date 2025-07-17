import { CheckboxCircleFIll } from "@/components/icons/remix"

export const CitizenshipBadge = () => {
  return (
    <div className="flex items-center gap-1 border border-border rounded-full px-2 py-1 text-xs text-foreground">
      <CheckboxCircleFIll className="w-[14px] h-[14px]" fill="#FF0000" />
      <div>Citizen</div>
    </div>
  )
}
