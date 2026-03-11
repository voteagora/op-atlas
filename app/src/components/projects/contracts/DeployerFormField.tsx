import { Ellipsis } from "lucide-react"
import { UseFormReturn } from "react-hook-form"
import { toast } from "sonner"
import { Address } from "viem"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FormLabel } from "@/components/ui/form"
import { onCopy } from "@/components/ui/utils/copy"
import { useProjectFromPath } from "@/hooks/useProjectFromPath"
import { removeContractsByDeployer } from "@/lib/actions/contracts"

import { DeployersSchema } from "./ContractFormSchema"
import { ContractsFormField } from "./ContractsFormField"

export function DeployerFormField({
  form,
  deployerIndex,
  onRemove,
}: {
  form: UseFormReturn<z.infer<typeof DeployersSchema>>
  deployerIndex: number
  onRemove: (index: number) => void
}) {
  const projectId = useProjectFromPath()

  const address = form.watch(`deployers.${deployerIndex}.address`)
  const contractsFields = form.watch(`deployers.${deployerIndex}.contracts`)

  async function onRemoveDeployerField() {
    try {
      toast.info("Removing deployer...")
      await removeContractsByDeployer(projectId, address as Address)
      toast.success("Succesfully removed deployer!")
      onRemove(deployerIndex)
    } catch (e) {
      toast("There was an error trying to remove the deployer")
    }
  }

  if (contractsFields.length <= 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-4 border-2 border-grey-900 rounded-xl gap-y-3 p-6">
      <FormLabel>Deployer</FormLabel>
      <div className="flex justify-between h-10 w-full rounded-md border border-input bg-background text-foreground px-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-normal placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-0 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
        <div className="flex items-center gap-2">{address}</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"}>
              <Ellipsis size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onCopy(address)}
            >
              Copy address
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={onRemoveDeployerField}
            >
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ContractsFormField
        form={form}
        deployer={address}
        deployerIndex={deployerIndex}
      />
    </div>
  )
}
