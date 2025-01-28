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
// import { ExcludedTag } from "./ExcludedTag"

const EMPTY_DEPLOYER = {
  deployerAddress: "",
  contracts: [],
}

export const mockDbContracts = [
  {
    address: "0xCA40c9aBDe6EC4b9a4d6C2cADe48513802740B6d",
    chain: "8453",
  },
  {
    address: "0xC11f4675342041F5F0e5d294A120519fcfd9EF5c",
    chain: "34443",
  },
]
export const mockDbDataOriginal = {
  deployerAddress: "0xEa6F889692CF943f30969EEbe6DDb323CD7b9Ac1",
  contracts: [...mockDbContracts],
}

export const mockDbData = [
  {
    deployerAddress: "0xEa6F889692CF943f30969EEbe6DDb323CD7b9Ac1",
    address: "0xCA40c9aBDe6EC4b9a4d6C2cADe48513802740B6d",
    chain: "8453",
  },
  {
    deployerAddress: "0xEa6F889692CF943f30969EEbe6DDb323CD7b9Ac1",
    address: "0xC11f4675342041F5F0e5d294A120519fcfd9EF5c",
    chain: "34443",
  },
  // {
  //   deployerAddress: "0xCA40c9aBDe6EC4b9a4d6C2cADe48513802740B6d",
  //   address: "0xC11f4675342041F5F0e5d294A120519fcfd9EF5c",
  //   chain: "34443",
  // },
]

export const mockOsoContracts2 = [
  {
    address: "0xCA40c9aBDe6EC4b9a4d6C2cADe48513802740B6d",
    chain: "8453",
  },
  {
    address: "0xC11f4675342041F5F0e5d294A120519fcfd9EF5c",
    chain: "34443",
  },
]

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
]

export function getDeployerOSOData(address: string) {
  return mockBackendOSOData.find((deployer) => {
    return address === deployer.address
  })
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

  const [allDbData, setAllDbData] = useState<any>()

  useEffect(() => {
    const populateForm = async () => {
      //1. Get DB Data
      // TODO: Implement
      const fetchedDbData = mockDbData

      const fetchedDatabaseData = [
        {
          deployerAddress: "0x123",
          address: "0xCA40c9aBDe6EC4b9a4d6C2cADe48513802740B6d",
          chain: "8453",
        },
        {
          deployerAddress: "0x123",
          address: "0xCA40c9aBDe6EC4b9a4d6C2cADe48513802740B6d",
          chain: "8453",
        },
        {
          deployerAddress: "0x456",
          address: "0xCA40c9aBDe6EC4b9a4d6C2cADe48513802740B6d",
          chain: "8453",
        },
      ]

      //2. Consolodiate DB Data
      const consolidatedDbData = fetchedDbData.reduce(
        (acc: any, { deployerAddress, ...contract }) => {
          if (!acc[deployerAddress]) {
            acc[deployerAddress] = { deployerAddress, contracts: [] }
          }
          acc[deployerAddress].contracts.push(contract)
          return acc
        },
        {},
      )

      const consolidatedDbDataArray: any = Object.values(consolidatedDbData)

      const mockFetchedOSOData = consolidatedDbDataArray.map(
        (deployer: any) => {
          const result = getDeployerOSOData(deployer.deployerAddress)
          if (result) {
            return {
              address: result.address,
              contracts: result.contracts,
            }
          }
        },
      )

      // const mockOSOData = consolidatedDbDataArray.map((deployer: any) => {
      //   return {
      //     address: deployer.deployerAddress,
      //     contracts: mockOsoContracts,
      //   }
      // })

      // console.log(mockOSOData)
      setAllDbData(consolidatedDbDataArray)

      //3. Get OSO Data
      // const fetchedOsoData = mockOSOData

      // for (let i = 0; i < consolidatedDbDataArray.length; i++) {
      //   const osoResult = await oso.getContracts(consolidatedDbDataArray[i].deployerAddress);
      //   fetchedOsoData.push(osoResult);
      // }

      //4. Cross Reference
      const formDeployers = mockFetchedOSOData.map((deployer: any) => {
        return {
          address: deployer.address,
          contracts: deployer.contracts.map((contract: any) => {
            return {
              ...contract,
              excluded:
                mockDbData.find((entry) => {
                  return (
                    entry.deployerAddress === deployer.address &&
                    entry.chain === contract.chain &&
                    entry.address === contract.address
                  )
                }) !== undefined,
            }
          }),
        }
      })

      form.setValue("deployers", formDeployers)
    }

    populateForm()
  }, [form])

  // Form submission handler
  const onSubmit = (data: z.infer<typeof ContractsSchema2>) => {
    console.log(data)
  }

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

                <Button
                  variant={"ghost"}
                  className="bg-gray-300 w-[200px]"
                  type="button"
                  onClick={() => {
                    append({ address: "", contracts: [] })
                  }}
                >
                  Add deployer address
                </Button>
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
