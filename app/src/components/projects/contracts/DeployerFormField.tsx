import { ProjectContract } from "@prisma/client"
import { Ellipsis, Loader2 } from "lucide-react"
import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { toast } from "sonner"
import { Address, isAddress } from "viem"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FormField, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { onCopy } from "@/components/ui/utils/copy"
import { useOsoDeployedContracts } from "@/hooks/useOsoDeployedContracts"
import { useProjectFromPath } from "@/hooks/useProjectFromPath"
import { removeContractsByDeployer } from "@/lib/actions/contracts"

import { DeployersSchema } from "./ContractFormSchema"
import { ContractsFormField } from "./ContractsFormField"
import { VerifyAddressDialog } from "./VerifyAddressDialog"

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

  const { data: osoContracts, isLoading: isLoadingContracts } =
    useOsoDeployedContracts(address)

  const [isVerifyingDialog, setIsVerifyingDialog] = useState(false)
  const [isVerified, setIsVerified] = useState(contractsFields.length > 0) // If there're contracts, it's verified

  async function onVerifySuccess(
    includedContracts: ProjectContract[],
    excludedContracts: ProjectContract[],
    signature: string,
    verificationChainId: string,
  ) {
    // Set the contracts to the form
    form.setValue(`deployers.${deployerIndex}.contracts`, [
      ...includedContracts.map((contract) => {
        return {
          address: contract.contractAddress,
          chainId: contract.chainId.toString(),
          excluded: false,
        }
      }),
      ...excludedContracts.map((contract) => {
        return {
          address: contract.contractAddress,
          chainId: contract.chainId.toString(),
          excluded: true,
        }
      }),
    ])

    form.setValue(`deployers.${deployerIndex}.signature`, signature)
    form.setValue(
      `deployers.${deployerIndex}.verificationChainId`,
      verificationChainId,
    )

    setIsVerified(true)
  }

  return (
    <>
      <div className="flex flex-col gap-4 border-2 border-grey-900 rounded-xl flex flex-col gap-y-3 p-6">
        <FormLabel>Deployer</FormLabel>
        {contractsFields.length > 0 && (
          <div className="flex justify-between h-10 w-full rounded-md border border-input bg-background text-foreground px-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-0 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
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

        {isVerifyingDialog && (
          <VerifyAddressDialog
            open
            onOpenChange={(open) => !open && setIsVerifyingDialog(false)}
            projectId={projectId}
            deployerAddress={address as `0x${string}`}
            onSubmit={(
              includedContracts: ProjectContract[],
              excludedContracts: ProjectContract[],
              signature: string,
              verificationChainId: string,
            ) => {
              setIsVerifyingDialog(false)
              onVerifySuccess(
                includedContracts,
                excludedContracts,
                signature,
                verificationChainId,
              )
            }}
          />
        )}

        {/* 3 states:
        1. Not verified -> show the verify button
        2. Verified -> show the contracts form
        3. Loading -> show the loading state
        */}

        {isVerified && !isLoadingContracts && (
          <ContractsFormField
            form={form}
            deployerIndex={deployerIndex}
            osoContracts={osoContracts?.oso_contractsV0 || []}
          />
        )}

        {isLoadingContracts && isVerified && (
          <div className="flex items-center">
            <Loader2 width={16} height={16} className="animate-spin" />
            <p>Searching for contracts</p>
          </div>
        )}

        {!isVerified && (
          <Button
            disabled={
              !form.getValues(`deployers`).every((deployer, index, array) => {
                return (
                  deployer.address &&
                  isAddress(deployer.address) &&
                  array.findIndex((r) => r.address === deployer.address) ===
                    index
                )
              })
            }
            type="button"
            variant={"destructive"}
            className="w-20 disabled:bg-destructive/80 disabled:text-white"
            onClick={() => setIsVerifyingDialog(true)}
          >
            Verify
          </Button>
        )}
      </div>
    </>
  )
}
