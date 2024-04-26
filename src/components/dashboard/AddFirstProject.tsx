import Image from "next/image"
import { cn } from "@/lib/utils"

const AddFirstProject = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-6 border rounded-2xl p-6 select-none",
        className,
      )}
    >
      <div className="flex items-center justify-center border rounded-xl bg-secondary h-40 w-40">
        <Image src="/assets/icons/plus.svg" width={14} height={14} alt="Plus" />
      </div>
      <h3>Add your first project</h3>
    </div>
  )
}

export default AddFirstProject
