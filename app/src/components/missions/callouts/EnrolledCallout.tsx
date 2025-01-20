import { ChevronRight } from "lucide-react"
import { Callout } from "../../common/Callout"
import Image from "next/image"

export function EnrolledCallout({ name }: { name: string }) {
  return (
    <Callout
      type="success"
      showIcon={false}
      leftAlignedContent={
        <div className="flex">
          <Image
            alt="Info"
            src={"/assets/icons/sunny-smiling.png"}
            width={20}
            height={20}
          />
          <p className="text-sm font-medium mr-5 ml-2">
            {`Enrolled in Retro Funding: ` + name}
          </p>
        </div>
      }
      rightAlignedContent={
        <div className="flex items-center gap-1 ml-auto shrink-0 text-sm font-medium">
          <span>Confirmation</span>
          <ChevronRight width={16} height={16} />
          <span>Rewards</span>
          <ChevronRight width={16} height={16} />
        </div>
      }
    />
  )
}
