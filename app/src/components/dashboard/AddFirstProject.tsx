import Image from "next/image"

import { cn } from "@/lib/utils"

const AddFirstProject = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "flex gap-4 items-center border rounded-xl p-8 select-none hover:shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-center border border-dashed border-muted rounded-xl h-12 w-12">
        <Image src="/assets/icons/plus.svg" width={20} height={20} alt="Plus" />
      </div>
      <h3 className="text-base font-semibold">Add your first project</h3>
    </div>
  )
}

export default AddFirstProject
