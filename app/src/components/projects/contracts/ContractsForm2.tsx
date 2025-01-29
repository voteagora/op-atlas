"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ProjectContract } from "@prisma/client"
import { Check, ChevronDown, Ellipsis, Plus, X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Callout } from "@/components/common/Callout"
import ExternalLink from "@/components/ExternalLink"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  removeContract,
  updateContractDetails,
  updateProjectOSOStatus,
} from "@/lib/actions/contracts"
import { updateProjectDetails } from "@/lib/actions/projects"
import { ProjectWithDetails } from "@/lib/types"

import { ContractForm } from "./ContractForm"
import { ContractSchema2, ContractsSchema2 } from "./schema2"

import { Chain } from "./schema"
import { DeployerForm } from "./DeployerForm"
import { AddressSchema } from "./commonSchema"
import { ContractDropdownButton } from "./ContractDropdownButton"
import { ChainLogo } from "@/components/common/ChainLogo"
import { copyToClipboard } from "@/lib/utils"
import { VerifyButton } from "./VerifyButton"
import { isAddress } from "ethers"
import { useProjectContracts } from "@/hooks/useProjectContracts"
// import { ExcludedTag } from "./ExcludedTag"

export type DBContract = { address: string; chainId: number }

export type DBData = {
  deployerAddress: string
  contracts: DBContract[]
}

const EMPTY_DEPLOYER = {
  address: "",
  contracts: [],
}

const USE_MOCK_DATA = true

export const mockDbData = [
  {
    deployerAddress: "0xEa6F889692CF943f30969EEbe6DDb323CD7b9Ac1",
    contractAddress: "0xCA40c9aBDe6EC4b9a4d6C2cADe48513802740B6d",
    chainId: 8453,
  },
  {
    deployerAddress: "0xEa6F889692CF943f30969EEbe6DDb323CD7b9Ac1",
    contractAddress: "0xC11f4675342041F5F0e5d294A120519fcfd9EF5c",
    chainId: 34443,
  },
  {
    deployerAddress: "0xCA40c9aBDe6EC4b9a4d6C2cADe48513802740B6d",
    contractAddress: "0x4740A33a3F53212d5269e9f5D0e79fc861AADA05",
    chainId: 34443,
  },
] as ProjectContract[]

type OSOContract = {
  address: string
  chain: string
}
type OSOData = {
  address: string
  contracts: OSOContract[]
}

const mockBackendOSOData = [
  {
    address: "0xEa6F889692CF943f30969EEbe6DDb323CD7b9Ac1",
    contracts: [
      {
        address: "0xCA40c9aBDe6EC4b9a4d6C2cADe48513802740B6d",
        chain: "8453",
      },
      {
        address: "0xC11f4675342041F5F0e5d294A120519fcfd9EF5c",
        chain: "34443",
      },
      {
        address: "0x4740A33a3F53212d5269e9f5D0e79fc861AADA05",
        chain: "34443",
      },
      {
        address: "0xEA5aE0568DF87515885F3BA6B760E76a29ea2D24",
        chain: "34443",
      },
    ],
  },
  {
    address: "0xCA40c9aBDe6EC4b9a4d6C2cADe48513802740B6d",
    contracts: [
      {
        address: "0x4740A33a3F53212d5269e9f5D0e79fc861AADA05",
        chain: "34443",
      },
      {
        address: "0xEA5aE0568DF87515885F3BA6B760E76a29ea2D24",
        chain: "34443",
      },
    ],
  },
  {
    address: "0x05E4eBb06B3a4dB3138e68FeDEa0Daa106b111E8",
    contracts: [
      {
        address: "0x4740A33a3F53212d5269e9f5D0e79fc861AADA05",
        chain: "34443",
      },
      {
        address: "0xEA5aE0568DF87515885F3BA6B760E76a29ea2D24",
        chain: "34443",
      },
      {
        address: "0xC11f4675342041F5F0e5d294A120519fcfd9EF5c",
        chain: "34443",
      },
    ],
  },
] as OSOData[]

export function getDeployerOSOData(address: string) {
  return mockBackendOSOData.find((deployer) => {
    return address === deployer.address
  })
}

function getDefaultValues(): z.infer<typeof ContractsSchema2> {
  return {
    deployers: [{ ...EMPTY_DEPLOYER }],
  }
}
export function ContractsForm2({ project }: { project: ProjectWithDetails }) {
  const form = useForm<z.infer<typeof ContractsSchema2>>({
    resolver: zodResolver(ContractsSchema2),
    mode: "onSubmit",
    reValidateMode: "onChange",
  })

  const { append } = useFieldArray({
    control: form.control,
    name: "deployers", // Name of the array field
  })

  const [allDbData, setAllDbData] = useState<DBData[]>([])

  const { data } = useProjectContracts(project.id, { enabled: !USE_MOCK_DATA })

  useEffect(() => {
    const populateForm = async () => {
      //1. Get DB Data
      // TODO: Implement

      let fetchedDbData: ProjectContract[] | undefined = []

      if (USE_MOCK_DATA) {
        fetchedDbData = mockDbData
      } else {
        fetchedDbData = data
      }

      if (fetchedDbData && fetchedDbData.length <= 0) {
        form.setValue("deployers", [{ address: "", contracts: [] }])
        // setAllDbData()
        return
      }

      //2. Consolodiate DB Data
      const consolidatedDbData =
        fetchedDbData &&
        fetchedDbData.reduce(
          (acc: Record<string, DBData>, { deployerAddress, ...contract }) => {
            if (!acc[deployerAddress]) {
              acc[deployerAddress] = { deployerAddress, contracts: [] }
            }
            acc[deployerAddress].contracts.push({
              address: contract.contractAddress,
              chainId: contract.chainId,
            })
            return acc
          },
          {},
        )

      const consolidatedDbDataArray: DBData[] = Object.values(
        consolidatedDbData || [],
      )

      setAllDbData(consolidatedDbDataArray)

      //3. Get OSO Data
      const osoData: OSOData[] = consolidatedDbDataArray
        .map((deployer: DBData) => {
          const result = getDeployerOSOData(deployer.deployerAddress)
          if (result) {
            return {
              address: result.address,
              contracts: result.contracts,
            }
          }
        })
        .filter((data): data is OSOData => data !== undefined)

      //4. Cross Reference
      const formDeployers: z.infer<typeof ContractsSchema2> = {
        deployers: osoData.map((deployer: OSOData) => {
          return {
            address: deployer.address,
            contracts: deployer.contracts.map((contract: OSOContract) => {
              return {
                ...contract,
                excluded:
                  fetchedDbData!.find((entry) => {
                    return (
                      entry.deployerAddress === deployer.address &&
                      entry.chainId.toString() === contract.chain &&
                      entry.contractAddress === contract.address
                    )
                  }) === undefined,
              }
            }),
          }
        }),
      }

      form.setValue("deployers", formDeployers.deployers)
    }

    populateForm()
  }, [form, data])

  // Form submission handler
  const onSubmit = (data: z.infer<typeof ContractsSchema2>) => {
    console.log(data)
  }

  const watchedField = useWatch({
    control: form.control,
    name: "deployers", // Specify the name of the field you want to watch
  })

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name={`deployers`}
            render={({ field: deployersField }) => (
              <>
                {deployersField.value &&
                  deployersField.value.map((deployer, deployerIndex) => {
                    return (
                      <DeployerForm
                        form={form}
                        deployerIndex={deployerIndex}
                        dbData={allDbData[deployerIndex]}
                      />
                    )
                  })}

                {watchedField
                  ?.map((deployer) => {
                    return deployer.contracts.length > 0
                  })
                  .every((isContractsResult) => {
                    return isContractsResult
                  }) &&
                  watchedField
                    ?.map((deployer) => {
                      return isAddress(deployer.address)
                    })
                    .every((isAddressResult) => {
                      return isAddressResult
                    }) && (
                    <Button
                      variant={"ghost"}
                      className="bg-gray-300 w-[200px]"
                      type="button"
                      onClick={() => {
                        append({ address: "", contracts: [] })
                      }}
                    >
                      <Plus width={16} height={16} />
                      Add deployer address
                    </Button>
                  )}
              </>
            )}
          />

          <Button variant={"destructive"} type="submit" className="w-20">
            Save
          </Button>
        </form>
      </Form>
      {/* <Form {...form}> */}
      {/* <></> */}
      {/* </Form> */}
    </div>
  )
}
