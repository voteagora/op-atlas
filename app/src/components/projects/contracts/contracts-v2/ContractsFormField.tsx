import { ChevronDown, ChevronUp, Loader2, Plus } from "lucide-react"
import Image from "next/image"
import { ReactNode, useState } from "react"
import { useFieldArray, UseFormReturn } from "react-hook-form"
import { getAddress, isAddress } from "viem"
import { z } from "zod"

import { RedBadge } from "@/components/missions/common/badges/RedBadge"
import { Button } from "@/components/ui/button"
import { FormLabel } from "@/components/ui/form"
import { addProjectContracts } from "@/db/projects"
import { useProjectFromPath } from "@/hooks/useProjectFromPath"
import { getDeployedContracts } from "@/lib/oso"
import { replaceArtifactSourceWithNumber } from "@/lib/utils/contractForm"

import { ContractFormField } from "./ContractFormField"
import { MissingContractsDialog } from "./MissingContractsDialog"
import { IS_USING_MOCK_DATA } from "./MockProjectContractsData"
import { DeployersSchema } from "./schema3"
import { VerifyAddressDialog2 } from "./VerifyAddressDialog2"

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

  const [dialogPage, setDialogPage] = useState(0)

  const [excludedToggle, setExcludedToggle] = useState(false)

  const contracts = form.watch(`deployers.${deployerIndex}.contracts`)

  function getTrueFilterCount() {
    return (
      contracts.length -
      contracts.filter((contract) => excludedToggle && contract.excluded).length
    )
  }

  return (
    <>
      {isMissingContractsDialogOpen && (
        <MissingContractsDialog
          defaultPage={dialogPage}
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
        />
      )}

      {isVerifiyingDialog && (
        <VerifyAddressDialog2
          open
          onOpenChange={(open) => !open && setIsVerifyingDialog(false)}
          projectId={projectId}
          deployerAddress={address as `0x${string}`}
          onSubmit={(signature: string) => {
            setIsVerifyingDialog(false)
            onVerify(signature)
          }}
        />
      )}

      {contracts.length > 0 && (
        <div className="flex justify-between items-center">
          <FormLabel>Contracts</FormLabel>

          <div className="flex gap-4 items-center">
            <button
              className="flex items-center gap-1 text-sm"
              type="button"
              onClick={() => setExcludedToggle(!excludedToggle)}
            >
              <Image
                src={`/assets/icons/${
                  excludedToggle ? "eye-close-line-1.svg" : "eye-line.svg"
                }`}
                width={16}
                height={16}
                alt="eye"
              />
              Excluded
              <RedBadge
                className="py-0 px-1"
                text={contractsFields
                  .filter((contract) => contract.excluded)
                  .length.toString()}
              ></RedBadge>
            </button>
            <button
              type="button"
              onClick={() => {
                setDialogPage(1)
                setIsMissingContractsDialogOpen(true)
              }}
              className="flex items-center gap-1 text-sm"
            >
              <Plus width={16} height={16} />
              Add
            </button>{" "}
            <button
              type="button"
              onClick={() => {
                setDialogPage(0)
                setIsMissingContractsDialogOpen(true)
              }}
            >
              <Image
                src="/assets/icons/question-fill.svg"
                alt="?"
                width={20}
                height={20}
              />
            </button>
          </div>
        </div>
      )}

      {contracts.map((field, index) => {
        if (index >= contractViewCount) return

        if (excludedToggle) if (field.excluded) return

        return (
          <ContractFormField
            key={index + "contract"}
            form={form}
            deployerIndex={deployerIndex}
            contractIndex={index}
          />
        )
      })}

      {contractViewCount < getTrueFilterCount() && (
        <button
          className="flex items-center gap-2"
          onClick={() => {
            setContractViewCount(contracts.length)
          }}
        >
          <p>
            Show {getTrueFilterCount() - initialMaxContractViewCount} more
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
            Hide {getTrueFilterCount() - initialMaxContractViewCount}{" "}
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
            type="button"
            variant={"destructive"}
            className="w-20 disabled:bg-destructive/80 disabled:text-white"
            onClick={() => setIsVerifyingDialog(true)}
          >
            Verify
          </Button>
        ))}
    </>
  )
}
