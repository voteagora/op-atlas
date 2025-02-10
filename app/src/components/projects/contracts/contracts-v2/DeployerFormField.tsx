import { useFieldArray, UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { DeployersSchema } from "./schema3"
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ContractsFormField } from "./ContractsFormField"
import { Button } from "@/components/ui/button"
import { Ellipsis, Loader2 } from "lucide-react"
import { ReactNode, useState } from "react"
import { getAddress, isAddress } from "ethers"
import { IS_USING_MOCK_DATA } from "./MockProjectContractsData"
import { getDeployedContracts } from "@/lib/oso"
import { replaceArtifactSourceWithNumber } from "@/lib/utils/contractForm"
import { ProjectContract } from "@prisma/client"
import {
  addProjectContract,
  addProjectContracts,
  removeProjectContracts,
} from "@/db/projects"
import { useProjectFromPath } from "@/hooks/useProjectFromPath"
import { truncate } from "@/lib/utils/contracts"
import { ContractFormField } from "./ContractFormField"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { copyToClipboard } from "@/lib/utils"
import { toast } from "sonner"
import { onCopy } from "@/components/ui/utils/copy"
import { removeContracts } from "@/lib/actions/contracts"
import { Address } from "viem"
import { MissingContractsDialog } from "./MissingContractsDialog"

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
      await removeContracts(
        projectId,
        contractsFields.map((contract) => {
          return {
            address: contract.address as Address,
            chainId: contract.chainId,
          }
        }),
      )
      toast.success("Succesfully removed deployer!")
      onRemove(deployerIndex)
    } catch (e) {
      toast("There was an error trying to remove the deployer")
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 border-2 border-grey-900 rounded-xl flex flex-col gap-y-3 p-6">
        <p>Deployer</p>
        {contractsFields.length > 0 && (
          <div className="flex justify-between h-10 w-full rounded-md border border-input bg-background text-foreground px-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-0 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            <div className="flex items-center gap-2">
              {truncate(address, 5)}
            </div>
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
        )}

        {contractsFields.length <= 0 && (
          <FormField
            control={form.control}
            name={`deployers.${deployerIndex}.address`}
            render={({ field: address }) => (
              <Input {...address} placeholder="Add a deployer address" />
            )}
          />
        )}

        <ContractsFormField form={form} deployerIndex={deployerIndex} />
      </div>
    </>
  )
}
