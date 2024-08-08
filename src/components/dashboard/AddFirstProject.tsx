import { Plus } from "lucide-react"

import { cn } from "@/lib/utils"

const AddFirstProject = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-6 border rounded-2xl p-8 select-none hover:shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-center border border-dashed rounded-xl  h-12 w-12">
        <Plus height={11.6} width={11.6} className="text-text-default" />
      </div>
      <h3 className="text-base font-semibold">Add your first project</h3>
    </div>
  )
}

export default AddFirstProject
