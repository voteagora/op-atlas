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
import { Loader2 } from "lucide-react"
import { ReactNode, useState } from "react"
import { getAddress, isAddress } from "ethers"
import { IS_USING_MOCK_DATA } from "./MockProjectContractsData"
import { getDeployedContracts } from "@/lib/oso"
import { replaceArtifactSourceWithNumber } from "@/lib/utils/contractForm"
import { ProjectContract } from "@prisma/client"
import { addProjectContract, addProjectContracts } from "@/db/projects"
import { useProjectFromPath } from "@/hooks/useProjectFromPath"

export function DeployerFormField({
  form,
  deployerIndex,
  projectContracts,
}: {
  form: UseFormReturn<z.infer<typeof DeployersSchema>>
  deployerIndex: number
  projectContracts: ProjectContract[]
}) {
  const projectId = useProjectFromPath()

  const { append } = useFieldArray({
    control: form.control,
    name: `deployers.${deployerIndex}.contracts`, // Name of the array field
  })

  const [isVerifying, setIsVerifying] = useState(false)

  const [errorMessage, setErrorMessage] = useState<ReactNode>()

  const theForm = form.watch("deployers")

  console.log(theForm)

  async function onVerify() {
    setIsVerifying(true)

    if (IS_USING_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
    } else {
      const deployer = await getDeployedContracts(
        form.getValues().deployers[deployerIndex].address,
      )

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

      const contracts = corrected[0].oso_contractsV0.map((contract) => {
        return {
          contractAddress: contract.contractAddress,
          deployerAddress: theForm[deployerIndex].address,
          deploymentHash: "",
          verificationProof: "",
          chainId: parseInt(contract.contractNamespace),
          name: "",
          description: "",
          projectId,
        }
      })

      await addProjectContracts(projectId, contracts)

      append(
        corrected[0].oso_contractsV0.map((contract) => {
          return {
            address: contract.contractAddress,
            chainId: contract.contractNamespace,
            excluded: false,
            //   projectContracts?.find(
            //     (projectContract) =>
            //       getAddress(projectContract.contractAddress) ===
            //       getAddress(contract.contractAddress),
            //   ) === undefined,
          }
        }),
      )
      //   append()
      console.log(corrected)

      setErrorMessage(undefined)
    }

    setIsVerifying(false)
  }

  function isUnique() {
    const deployers = theForm // Get the deployers array from form

    for (let i = 0; i < deployers.length; i++) {
      if (i !== deployerIndex) {
        const address = theForm[i].address
        console.log(
          "Comparing " + address + " against " + theForm[deployerIndex].address,
        )
        if (address === theForm[deployerIndex].address) {
          return false
        }
      }
    }

    return true
  }

  console.log(isUnique())

  return (
    <FormField
      control={form.control}
      name={`deployers.${deployerIndex}`}
      render={({ field: deployer }) => (
        <div className="flex flex-col gap-4 border-2 border-grey-900 rounded-xl flex flex-col gap-y-3 p-6">
          <FormField
            control={form.control}
            name={`deployers.${deployerIndex}.address`}
            render={({ field: address }) => (
              <>
                <FormItem className="flex flex-col gap-1.5">
                  <FormLabel>Deployer Address</FormLabel>
                  <Input {...address} placeholder="Add a deployer address" />
                  <FormMessage />
                </FormItem>

                <FormField
                  control={form.control}
                  name={`deployers.${deployerIndex}.contracts`}
                  render={({ field: contracts }) => (
                    <>
                      {errorMessage}

                      {contracts.value.length > 0 ? (
                        <ContractsFormField
                          form={form}
                          deployerIndex={deployerIndex}
                        />
                      ) : (
                        <>
                          {isVerifying ? (
                            <div className="flex items-center">
                              <Loader2
                                width={16}
                                height={16}
                                className="animate-spin"
                              />
                              <p>Searching for contracts</p>
                            </div>
                          ) : (
                            <Button
                              disabled={
                                !isAddress(address.value) || !isUnique()
                              }
                              variant={"destructive"}
                              className="w-20"
                              onClick={onVerify}
                            >
                              Verify
                            </Button>
                          )}
                        </>
                      )}
                    </>
                  )}
                />
              </>
            )}
          />
        </div>
      )}
    />
  )
}
