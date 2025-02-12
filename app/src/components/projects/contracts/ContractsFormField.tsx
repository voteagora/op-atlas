import { ChevronDown, ChevronUp, Plus } from "lucide-react"
import Image from "next/image"
import { ReactNode, useState } from "react"
import { useFieldArray, UseFormReturn } from "react-hook-form"
import { z } from "zod"

import { RedBadge } from "@/components/missions/common/badges/RedBadge"
import { FormLabel } from "@/components/ui/form"
import { useProjectFromPath } from "@/hooks/useProjectFromPath"

import { ContractFormField } from "./ContractFormField"
import { MissingContractsDialog } from "./MissingContractsDialog"
import { DeployersSchema } from "./ContractFormSchema"
import { OsoDeployerContracts } from "@/lib/types"
import { osoNamespaceToChainId } from "@/lib/utils/contractForm"

export function ContractsFormField({
  form,
  osoContracts,
  deployerIndex,
}: {
  form: UseFormReturn<z.infer<typeof DeployersSchema>>
  osoContracts: OsoDeployerContracts[]
  deployerIndex: number
}) {
  const { fields: contractsFields, append: appendContracts } = useFieldArray({
    control: form.control,
    name: `deployers.${deployerIndex}.contracts`,
  })

  const signature = form.watch(`deployers.${deployerIndex}.signature`)

  // Add "excluded" contracts from oso results
  if (osoContracts.length > 0) {
    osoContracts.forEach((contract) => {
      const isContractExists = contractsFields.some(
        (existingContract) =>
          existingContract.address.toLowerCase() ===
            contract.contractAddress.toLowerCase() &&
          existingContract.chainId ===
            osoNamespaceToChainId(contract.contractNamespace).toString(),
      )

      if (!isContractExists) {
        appendContracts({
          address: contract.contractAddress,
          chainId: osoNamespaceToChainId(contract.contractNamespace).toString(),
          excluded: true,
        })
      }
    })
  }

  const address = form.watch(`deployers.${deployerIndex}.address`)

  const projectId = useProjectFromPath()

  const [errorMessage, setErrorMessage] = useState<ReactNode>()

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

      {!osoContracts.length && (
        <p className="text-rose-700 text-sm">
          {
            "We couldn't find any contracts deployed by this address. Learn about "
          }

          <button
            onClick={() => setIsMissingContractsDialogOpen(true)}
            className="underline"
          >
            {"missing contracts"}
          </button>
          {"."}
        </p>
      )}
    </>
  )
}
