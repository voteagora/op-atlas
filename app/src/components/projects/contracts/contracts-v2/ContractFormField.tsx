import { DeployersSchema } from "./schema3"
import { z } from "zod"
import { UseFormReturn } from "react-hook-form"
import { ChainLogo } from "@/components/common/ChainLogo"
import { Check, Ellipsis, FileQuestion, X } from "lucide-react"
import { truncate } from "@/lib/utils/contracts"
import { toast } from "sonner"
import { CHAIN_INFO } from "@/components/common/chain"
import { addProjectContract } from "@/db/projects"
import { useProjectFromPath } from "@/hooks/useProjectFromPath"
import { removeContract } from "@/lib/actions/contracts"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { Button } from "@/components/ui/button"
import { onCopy } from "@/components/ui/utils/copy"
import Image from "next/image"

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

  async function onToggle(excluded: boolean) {
    if (excluded) {
      try {
        toast.info(`Adding contract...`)
        await addProjectContract({
          projectId,
          contract: {
            contractAddress: address,
            deployerAddress: deployerAddress,
            deploymentHash: "",
            // TODO: make sure to include the signature
            verificationProof: "",
            chainId: parseInt(chainId),
            name: "",
            description: "",
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
  }

  console.log(excluded)

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
              className="relative group/btn hover:bg-gray-200 px-2 rounded-lg"
              type="button"
              onClick={() => {
                onCopy(address)
              }}
            >
              {truncate(address, 5)}
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover/btn:block px-2 py-1 text-sm text-white bg-gray-800 rounded-md shadow-lg">
                {address}
              </span>
            </button>

            <>
              {excluded && (
                <div className="bg-rose-300 rounded-lg px-2">Excluded</div>
              )}
            </>
          </div>

          <div className="flex items-center gap-2">
            <>
              {
                <button
                  type="button"
                  className="bg-secondary px-2 rounded-lg opacity-0 group-hover:opacity-100"
                  onClick={() => onToggle(excluded)}
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
