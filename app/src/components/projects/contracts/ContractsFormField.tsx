import { ChevronDown, ChevronUp, Plus } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useFieldArray, UseFormReturn } from "react-hook-form"
import { z } from "zod"

import { FormLabel } from "@/components/ui/form"
import { useProjectFromPath } from "@/hooks/useProjectFromPath"

import { ContractFormField } from "./ContractFormField"
import { DeployersSchema } from "./ContractFormSchema"
import { MissingContractsDialog } from "./MissingContractsDialog"

export function ContractsFormField({
  form,
  deployer,
  deployerIndex,
}: {
  form: UseFormReturn<z.infer<typeof DeployersSchema>>
  deployer: string
  deployerIndex: number
}) {
  const { append: appendContracts } = useFieldArray({
    control: form.control,
    name: `deployers.${deployerIndex}.contracts`,
  })

  const address = form.watch(`deployers.${deployerIndex}.address`)
  const signature = form.watch(`deployers.${deployerIndex}.signature`)

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

  const contracts = form.watch(`deployers.${deployerIndex}.contracts`)

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

        return (
          <ContractFormField
            key={index + "contract"}
            form={form}
            deployerIndex={deployerIndex}
            contractIndex={index}
          />
        )
      })}

      {contractViewCount < contracts.length &&
        contracts.length > initialMaxContractViewCount && (
          <button
            className="flex items-center gap-2"
            onClick={() => {
              setContractViewCount(contracts.length)
            }}
          >
            <p>
              Show {contracts.length - contractViewCount} more contract(s)
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
            Hide {contracts.length - initialMaxContractViewCount} contract(s)
          </p>
          <ChevronUp width={16} height={16} />
        </button>
      )}
    </>
  )
}
