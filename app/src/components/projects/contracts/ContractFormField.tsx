import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { Check, Ellipsis, FileQuestion, X } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { CHAIN_INFO } from "@/components/common/chain"
import { ChainLogo } from "@/components/common/ChainLogo"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { onCopy } from "@/components/ui/utils/copy"
import { addProjectContract } from "@/db/projects"
import { useProjectFromPath } from "@/hooks/useProjectFromPath"
import { removeContract } from "@/lib/actions/contracts"
import { truncate } from "@/lib/utils/contracts"

import { DeployersSchema } from "./ContractFormSchema"

export function ContractFormField({
  form,
  deployerIndex,
  contractIndex,
}: {
  form: UseFormReturn<z.infer<typeof DeployersSchema>>
  deployerIndex: number
  contractIndex: number
}) {
  const projectId = useProjectFromPath()

  const address = form.watch(
    `deployers.${deployerIndex}.contracts.${contractIndex}.address`,
  )
  const chainId = form.watch(
    `deployers.${deployerIndex}.contracts.${contractIndex}.chainId`,
  )
  const excluded = form.watch(
    `deployers.${deployerIndex}.contracts.${contractIndex}.excluded`,
  )
  const deployerAddress = form.watch(`deployers.${deployerIndex}.address`)
  const signature = form.watch(`deployers.${deployerIndex}.signature`)
  const verificationChainId = form.watch(
    `deployers.${deployerIndex}.verificationChainId`,
  )

  const [isToggleLoading, setIsToggleLoading] = useState(false)

  async function onToggle(excluded: boolean) {
    setIsToggleLoading(true)
    if (excluded) {
      try {
        toast.info(`Adding contract...`)
        await addProjectContract({
          projectId,
          contract: {
            contractAddress: address,
            deployerAddress: deployerAddress,
            deploymentHash: "",
            verificationProof: signature,
            chainId: parseInt(chainId),
            name: "",
            description: "",
            verificationChainId: parseInt(verificationChainId),
          },
        })

        toast.success("Contract Added!")
      } catch (error: unknown) {
        toast.error("Error adding contract, please try again")
      }
    } else {
      try {
        toast.info(`Removing contract...`)

        await removeContract({
          projectId,
          address,
          chainId: parseInt(chainId),
        })
        toast.success("Contract Removed!")
      } catch (error: unknown) {
        toast.error("Error removing contract, please try again")
      }
    }

    form.setValue(
      `deployers.${deployerIndex}.contracts.${contractIndex}.excluded`,
      !excluded,
    )
    setIsToggleLoading(false)
  }

  return (
    <div>
      <div className="flex group">
        <div className="flex justify-between h-10 w-full rounded-md border border-input px-2">
          <div className="flex items-center gap-2">
            <>
              {!excluded && <Check width={20} height={20} color="green" />}

              {excluded && <X width={20} height={20} color="grey" />}
            </>

            {chainId === "NaN" || chainId === "UNSUPPORTED" ? (
              <div className="relative group/btn">
                <FileQuestion className="w-6 h-6" />
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover/btn:block px-2 py-1 text-sm text-white bg-gray-800 rounded-md shadow-lg w-80 text-center">
                  {"This contract is on an unsupported chain."}
                </span>
              </div>
            ) : (
              <div className="relative group/btn">
                <ChainLogo chainId={chainId} size={24} />
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover/btn:block px-2 py-1 text-sm text-white bg-gray-800 rounded-md shadow-lg text-center">
                  {CHAIN_INFO[chainId]?.name}
                </span>
              </div>
            )}

            <button
              className="relative group/btn hover:bg-gray-200 px-2 rounded-lg text-sm"
              type="button"
              onClick={() => {
                onCopy(address)
              }}
            >
              {address}
            </button>

            <>
              {excluded && (
                <div className="bg-red-200 rounded-xl px-2 text-sm text-red-700">
                  Excluded
                </div>
              )}
            </>
          </div>

          <div className="flex items-center gap-2">
            <>
              {
                <button
                  type="button"
                  className="bg-secondary px-2 rounded-md p-1 opacity-0 group-hover:opacity-100 text-sm "
                  onClick={() => onToggle(excluded)}
                  disabled={isToggleLoading}
                >
                  {!excluded ? "Exclude" : "Include"}
                </button>
              }

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={"ghost"}>
                    <Ellipsis size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="cursor-pointer justify-between gap-8"
                    onClick={() => onToggle(excluded)}
                  >
                    {excluded ? "Include in project" : "Exclude from project"}
                    {excluded ? (
                      <Check width={16} height={16} />
                    ) : (
                      <X width={16} height={16} />
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="cursor-pointer justify-between gap-8"
                    onClick={() => {
                      onCopy(address)
                    }}
                  >
                    Copy address
                    <Image
                      src="/assets/icons/copy-icon.svg"
                      width={16}
                      height={16}
                      alt="Copy"
                    />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          </div>
        </div>
      </div>
    </div>
  )
}
