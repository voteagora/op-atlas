import Image from "next/image"

import { cn } from "@/lib/utils"

const AddFirstOrganizationProject = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-6 border rounded-xl p-8 select-none hover:shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-center border rounded-xl bg-secondary h-32 w-32">
        <Image src="/assets/icons/plus.svg" width={14} height={14} alt="Plus" />
      </div>
      <h3 className="text-base font-normal">Add your first project</h3>
    </div>
  )
}

export default AddFirstOrganizationProject
