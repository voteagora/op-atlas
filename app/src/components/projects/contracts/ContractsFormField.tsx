import { ChevronDown, ChevronUp, Plus } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useFieldArray, UseFormReturn } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { RedBadge } from "@/components/missions/common/badges/RedBadge"
import { FormLabel } from "@/components/ui/form"
import { useProjectFromPath } from "@/hooks/useProjectFromPath"
import { addAllExcludedProjectContractsAction } from "@/lib/actions/contracts"
import { ParsedOsoDeployerContract } from "@/lib/types"

import { ContractFormField } from "./ContractFormField"
import { DeployersSchema } from "./ContractFormSchema"
import { MissingContractsDialog } from "./MissingContractsDialog"

export function ContractsFormField({
  form,
  osoContracts,
  deployer,
  deployerIndex,
}: {
  form: UseFormReturn<z.infer<typeof DeployersSchema>>
  osoContracts: ParsedOsoDeployerContract[]
  deployer: string
  deployerIndex: number
}) {
  const { append: appendContracts } = useFieldArray({
    control: form.control,
    name: `deployers.${deployerIndex}.contracts`,
  })

  const contractsFields = form.watch(`deployers.${deployerIndex}.contracts`)

  const signature = form.watch(`deployers.${deployerIndex}.signature`)
  const verificationChainId = form.watch(
    `deployers.${deployerIndex}.verificationChainId`,
  )

  useEffect(() => {
    // Add "excluded" contracts from oso results
    if (osoContracts.length > 0) {
      const existingContracts =
        form.getValues(`deployers.${deployerIndex}.contracts`) || []
      const updatedContracts = [...existingContracts]

      osoContracts.forEach((contract) => {
        const isContractExists = updatedContracts.some(
          (existingContract) =>
            existingContract.address.toLowerCase() ===
              contract.contractAddress.toLowerCase() &&
            existingContract.chainId === contract.chainId.toString(),
        )

        if (!isContractExists) {
          updatedContracts.push({
            address: contract.contractAddress,
            chainId: contract.chainId.toString(),
            excluded: true,
          })
        }
      })

      form.setValue(`deployers.${deployerIndex}.contracts`, updatedContracts)
    }
  }, [osoContracts, deployerIndex, form])

  const address = form.watch(`deployers.${deployerIndex}.address`)

  const projectId = useProjectFromPath()

  async function onContractVerified(contract: {
    address: string
    chainId: string
  }) {
    appendContracts({
      address: contract.address,
      chainId: contract.chainId,
      excluded: false,
    })
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

          <div className="flex space-x-2 items-center">
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
              className="text-xs group relative flex items-center rounded-full transition-colors px-2 py-0.5 bg-backgroundSecondary hover:bg-backgroundSecondaryHover"
              onClick={async () => {
                const { error } = await addAllExcludedProjectContractsAction(
                  deployer,
                  projectId,
                  signature,
                  parseInt(verificationChainId),
                )

                if (error) {
                  toast.error(error)
                  return
                }

                for (let i = 0; i < contracts.length; i++) {
                  form.setValue(
                    `deployers.${deployerIndex}.contracts.${i}.excluded`,
                    false,
                  )
                }

                toast.success("All contracts included")
              }}
            >
              Include All
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

      {contractViewCount < getTrueFilterCount() &&
        getTrueFilterCount() > initialMaxContractViewCount && (
          <button
            className="flex items-center gap-2"
            onClick={() => {
              setContractViewCount(contracts.length)
            }}
          >
            <p>
              Show {getTrueFilterCount() - contractViewCount} more contract(s)
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
