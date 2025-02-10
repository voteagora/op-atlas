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
import {
  ChevronDown,
  ChevronUp,
  FileQuestion,
  Loader2,
  Plus,
} from "lucide-react"
import { toast } from "sonner"
import { addProjectContracts, removeProjectContracts } from "@/db/projects"
import { useProjectFromPath } from "@/hooks/useProjectFromPath"
import { IS_USING_MOCK_DATA } from "./MockProjectContractsData"
import { getDeployedContracts } from "@/lib/oso"
import { replaceArtifactSourceWithNumber } from "@/lib/utils/contractForm"
import { Button } from "@/components/ui/button"
import { getAddress, isAddress } from "viem"
import { VerifyAddressDialog } from "../contracts-v1/VerifyAddressDialog"
import { VerifyAddressDialog2 } from "./VerifyAddressDialog2"
import { MissingContractsDialog } from "./MissingContractsDialog"

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

  const [signature, setSignature] = useState("")

  async function onVerify(signature: string) {
    setIsVerifying(true)

    if (IS_USING_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } else {
      const deployer = await getDeployedContracts(address)

      const corrected = replaceArtifactSourceWithNumber(
        JSON.parse(JSON.stringify([deployer])),
      )

      setSignature(signature)

      console.log(corrected)
      if (corrected[0].oso_contractsV0.length <= 0) {
        setErrorMessage(
          <p className="text-rose-700 text-sm">
            {
              "We couldn’t find any contracts deployed by this address. Learn about "
            }

            <button
              onClick={() => setIsMissingContractsDialogOpen(true)}
              className="underline"
            >
              {"missing contracts"}
            </button>
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
            verificationProof: signature,
            chainId: parseInt(contract.contractNamespace),
            name: "",
            description: "",
            projectId,
          }
        })

        await addProjectContracts(projectId, contracts)

        appendContracts(
          corrected[0].oso_contractsV0.map((contract) => {
            return {
              address: contract.contractAddress,
              chainId: contract.contractNamespace,
              excluded: false,
            }
          }),
        )

        setErrorMessage(undefined)
      } catch (e) {
        console.error("unexpected error occured adding contract(s): ", e)
      }
    }

    setIsVerifying(false)
  }

  async function onContractVerified(contract: {
    address: string
    chainId: string
  }) {
    appendContracts({
      address: contract.address,
      chainId: contract.chainId,
      excluded: false,
    })

    setErrorMessage(undefined)
  }

  const initialMaxContractViewCount = 6
  const [contractViewCount, setContractViewCount] = useState(
    initialMaxContractViewCount,
  )

  const [isVerifiyingDialog, setIsVerifyingDialog] = useState(false)

  const [isMissingContractsDialogOpen, setIsMissingContractsDialogOpen] =
    useState(false)

  return (
    <>
      {isMissingContractsDialogOpen && (
        <MissingContractsDialog
          open
          onOpenChange={(open) =>
            !open && setIsMissingContractsDialogOpen(false)
          }
          projectId={projectId}
          deployerAddress={address as `0x${string}`}
          signature={signature}
          onSubmit={(contract: { address: string; chainId: string }) => {
            setIsMissingContractsDialogOpen(false)
            onContractVerified(contract)
          }}
          // chain={chain}
        />
      )}

      {isVerifiyingDialog && (
        <VerifyAddressDialog2
          open
          onOpenChange={(open) => !open && setIsVerifyingDialog(false)}
          projectId={projectId}
          deployerAddress={address as `0x${string}`}
          // contractAddress={getAddress(contractAddress)}
          // deploymentTxHash={deploymentTxHash}
          onSubmit={(signature: string) => {
            setIsVerifyingDialog(false)
            onVerify(signature)
          }}
          // chain={chain}
        />
      )}

      {contractsFields.length > 0 && (
        <div className="flex justify-between">
          <p>Contracts</p>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsMissingContractsDialogOpen(true)}
              className="flex"
            >
              <Plus width={20} height={20} />
              Add
            </button>{" "}
            <button
              type="button"
              onClick={() => setIsMissingContractsDialogOpen(true)}
            >
              <FileQuestion width={20} height={20} />
            </button>
          </div>
        </div>
      )}

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

      {errorMessage}
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
            onClick={() => setIsVerifyingDialog(true)}
          >
            Verify
          </Button>
        ))}
    </>
  )
}
