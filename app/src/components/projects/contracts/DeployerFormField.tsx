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
import { DeployerDropdownButton } from "./DeployerDropdownButton"
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

export function DeployerFormField({
  form,
  deployerIndex,
  onRemove,
}: {
  form: UseFormReturn<z.infer<typeof DeployersSchema>>
  deployerIndex: number
  onRemove: (index: number) => void
}) {
  const address = form.watch(`deployers.${deployerIndex}.address`)

  const contractsFields = form.watch(`deployers.${deployerIndex}.contracts`)

  // const { fields: contractsFields, append: appendContracts } = useFieldArray({
  //   control: form.control,
  //   name: `deployers.${deployerIndex}.contracts`,
  // })

  const projectId = useProjectFromPath()

  async function onRemoveDeployerField() {
    try {
      toast.info("Removing deployer...")
      await removeProjectContracts(
        projectId,
        contractsFields.map((contract) => {
          return {
            address: contract.address,
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

  // const projectId = useProjectFromPath()

  // const [isVerifying, setIsVerifying] = useState(false)

  // const [errorMessage, setErrorMessage] = useState<ReactNode>()

  // async function onVerify() {
  //   setIsVerifying(true)

  //   if (IS_USING_MOCK_DATA) {
  //     await new Promise((resolve) => setTimeout(resolve, 2000))
  //   } else {
  //     const deployer = await getDeployedContracts(
  //       form.getValues().deployers[deployerIndex].address,
  //     )

  //     const corrected = replaceArtifactSourceWithNumber(
  //       JSON.parse(JSON.stringify([deployer])),
  //     )

  //     if (corrected[0].oso_contractsV0.length <= 0) {
  //       setErrorMessage(
  //         <p className="text-rose-700 text-sm">
  //           {
  //             "We couldn’t find any contracts deployed by this address. Learn about "
  //           }

  //           <span className="underline">{"missing contracts"}</span>
  //           {"."}
  //         </p>,
  //       )

  //       setIsVerifying(false)
  //       return
  //     }

  //     try {
  //       // const contracts = corrected[0].oso_contractsV0.map((contract) => {
  //       //   return {
  //       //     contractAddress: getAddress(contract.contractAddress),
  //       //     deployerAddress: address,
  //       //     deploymentHash: "",
  //       //     verificationProof: "",
  //       //     chainId: parseInt(contract.contractNamespace),
  //       //     name: "",
  //       //     description: "",
  //       //     projectId,
  //       //   }
  //       // })

  //       // await addProjectContracts(projectId, contracts)

  //       console.log(corrected)

  //       appendContracts(
  //         corrected[0].oso_contractsV0.map((contract) => {
  //           return {
  //             address: contract.contractAddress,
  //             chainId: contract.contractNamespace,
  //             excluded: false,
  //           }
  //         }),
  //       )

  //       console.log("appended")

  //       setErrorMessage(undefined)
  //     } catch (e) {
  //       console.error("unexpected error occured adding contract(s): ", e)
  //     }
  //   }

  //   setIsVerifying(false)
  // }

  return (
    <div className="flex flex-col gap-4 border-2 border-grey-900 rounded-xl flex flex-col gap-y-3 p-6">
      <p>Deployer</p>
      {contractsFields.length > 0 && (
        <div className="flex justify-between h-10 w-full rounded-md border border-input bg-background text-foreground px-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-0 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          <div className="flex items-center gap-2">{truncate(address, 5)}</div>
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

      <ContractsFormField
        form={form}
        deployerIndex={deployerIndex}
        onRemove={onRemove}
      />
    </div>
  )
}
