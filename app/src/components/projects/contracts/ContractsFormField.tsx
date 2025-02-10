import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { DeployersSchema } from "./schema3"
import { z } from "zod"
import { useFieldArray, UseFormReturn } from "react-hook-form"
import { ContractFormField } from "./ContractFormField"
import { ReactNode, useState } from "react"
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { addProjectContracts, removeProjectContracts } from "@/db/projects"
import { useProjectFromPath } from "@/hooks/useProjectFromPath"
import { IS_USING_MOCK_DATA } from "./MockProjectContractsData"
import { getDeployedContracts } from "@/lib/oso"
import { replaceArtifactSourceWithNumber } from "@/lib/utils/contractForm"
import { Button } from "@/components/ui/button"
import { getAddress, isAddress } from "viem"

export function ContractsFormField({
  form,
  deployerIndex,
}: {
  form: UseFormReturn<z.infer<typeof DeployersSchema>>
  deployerIndex: number
}) {
  const { fields: contractsFields, append: appendContracts } = useFieldArray({
    control: form.control,
    name: `deployers.${deployerIndex}.contracts`,
  })

  const address = form.watch(`deployers.${deployerIndex}.address`)
  const [isVerifying, setIsVerifying] = useState(false)

  const projectId = useProjectFromPath()

  const [errorMessage, setErrorMessage] = useState<ReactNode>()

  async function onVerify() {
    setIsVerifying(true)

    if (IS_USING_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } else {
      const deployer = await getDeployedContracts(address)

      const corrected = replaceArtifactSourceWithNumber(
        JSON.parse(JSON.stringify([deployer])),
      )

      if (corrected[0].oso_contractsV0.length <= 0) {
        setErrorMessage(
          <p className="text-rose-700 text-sm">
            {
              "We couldn’t find any contracts deployed by this address. Learn about "
            }

            <span className="underline">{"missing contracts"}</span>
            {"."}
          </p>,
        )

        setIsVerifying(false)
        return
      }

      try {
        const contracts = corrected[0].oso_contractsV0.map((contract) => {
          return {
            contractAddress: getAddress(contract.contractAddress),
            deployerAddress: address,
            deploymentHash: "",
            verificationProof: "",
            chainId: parseInt(contract.contractNamespace),
            name: "",
            description: "",
            projectId,
          }
        })

        await addProjectContracts(projectId, contracts)

        console.log(corrected)

        appendContracts(
          corrected[0].oso_contractsV0.map((contract) => {
            return {
              address: contract.contractAddress,
              chainId: contract.contractNamespace,
              excluded: false,
            }
          }),
        )

        console.log("appended")

        setErrorMessage(undefined)
      } catch (e) {
        console.error("unexpected error occured adding contract(s): ", e)
      }
    }

    setIsVerifying(false)
  }

  console.log(deployerIndex)
  console.log(contractsFields)

  const initialMaxContractViewCount = 6
  const [contractViewCount, setContractViewCount] = useState(
    initialMaxContractViewCount,
  )

  return (
    <>
      {contractsFields.length > 0 && <p>Contracts</p>}

      {contractsFields.map((field, index) => {
        if (index >= contractViewCount) return

        return (
          <ContractFormField
            key={field.id}
            form={form}
            deployerIndex={deployerIndex}
            contractIndex={index}
          />
        )
      })}

      {contractViewCount < contractsFields.length && (
        <button
          className="flex items-center gap-2"
          onClick={() => {
            setContractViewCount(contractsFields.length)
          }}
        >
          <p>
            Show {contractsFields.length - initialMaxContractViewCount} more
            contract(s)
          </p>
          <ChevronDown width={16} height={16} />
        </button>
      )}

      {contractViewCount > initialMaxContractViewCount && (
        <button
          className="flex items-center gap-2"
          onClick={() => {
            setContractViewCount(initialMaxContractViewCount)
          }}
        >
          <p>
            Hide {contractsFields.length - initialMaxContractViewCount}{" "}
            contract(s)
          </p>
          <ChevronUp width={16} height={16} />
        </button>
      )}

      {contractsFields.length <= 0 &&
        (isVerifying ? (
          <div className="flex items-center">
            <Loader2 width={16} height={16} className="animate-spin" />
            <p>Searching for contracts</p>
          </div>
        ) : (
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
            variant={"destructive"}
            className="w-20"
            onClick={onVerify}
          >
            Verify
          </Button>
        ))}
    </>
  )
}
