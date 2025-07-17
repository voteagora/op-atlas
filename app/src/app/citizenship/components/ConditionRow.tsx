import { Check, Close } from "@/components/icons/remix"

export const ConditionRow = ({
  children,
  isMet,
}: {
  children: React.ReactNode
  isMet: boolean
}) => {
  return (
    <div className="flex flex-row items-center gap-3">
      <div>
        {isMet ? (
          <Check className="w-[20px] h-[20px]" fill="#0DA529" />
        ) : (
          <Close className="w-[20px] h-[20px]" fill="#BCBFCD" />
        )}
      </div>
      <div>{children}</div>
    </div>
  )
}
