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
import { getDeployedContracts } from "@/lib/oso"
import { DBData, mockBackendOSOData, OSOContract, OSOData } from "./mockDBData"
import {
  useOsoDeployedContracts,
  useOsoDeployersDeployedContracts,
} from "@/hooks/useOsoDeployedContracts"
import {
  mockOsoDeployerContractsData,
  mockOsoDeployersContractsData,
} from "./MockOsoDeployerContractsData"
import { mockProjectContractsData } from "./MockProjectContractsData"

const EMPTY_DEPLOYER = {
  address: "",
  contracts: [],
}

const IS_USING_MOCK_DATA = false
const IS_USING_EMPTY_MOCK_DATA = false

export async function getDeployerOSOData(address: string) {
  if (IS_USING_MOCK_DATA) {
    return mockBackendOSOData.find((deployer) => {
      return address === deployer.address
    })
  } else {
    const result = await getDeployedContracts(address)
  }
}

function getDefaultValues(): z.infer<typeof ContractsSchema2> {
  return {
    deployers: [{ ...EMPTY_DEPLOYER }],
  }
}
export function ContractsForm3({ project }: { project: ProjectWithDetails }) {
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

  const { data: projectContractsData } = useProjectContracts(project.id)

  const { data: osoDeployerContractsData } = useOsoDeployedContracts(
    "0xa18d0226043a76683950f3baabf0a87cfb32e1cb",
  )

  const deployerAddresses = projectContractsData?.map((projectContractData) => {
    return projectContractData.deployerAddress
  })

  const { data: osoDeployersContractsData } = useOsoDeployersDeployedContracts(
    // deployerAddresses!,
    ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
  )

  // WORKING
  // useEffect(() => {
  //   async function get() {
  //     console.log("Starting get...")
  //     const result = await getDeployedContracts({
  //       deployer: "0xa18d0226043a76683950f3baabf0a87cfb32e1cb",
  //     })
  //     console.log(result)
  //   }
  //   get()
  // }, [])

  async function getProjectContractsData() {
    return IS_USING_MOCK_DATA
      ? IS_USING_EMPTY_MOCK_DATA
        ? []
        : mockProjectContractsData
      : projectContractsData
  }

  async function getOsoDeployerContractsData() {
    return IS_USING_MOCK_DATA
      ? mockOsoDeployerContractsData
      : osoDeployerContractsData
  }

  async function getOsoDeployersContractsData() {
    return IS_USING_MOCK_DATA
      ? mockOsoDeployersContractsData
      : osoDeployersContractsData
  }

  useEffect(() => {
    async function get() {
      const projectContracts = await getProjectContractsData()

      console.log("projects contracts:")
      console.log(projectContracts)

      const osoDeployerContracts = await getOsoDeployerContractsData()

      console.log("oso deployer contracts:")
      console.log(osoDeployerContracts)

      const osoDeployersContracts = await getOsoDeployersContractsData()

      console.log("oso deployers contracts:")
      console.log(osoDeployersContracts)
    }

    get()
  }, [projectContractsData, osoDeployerContractsData])

  useEffect(() => {
    const populateForm = async () => {
      //1. Get DB Data
      // TODO: Implement

      let fetchedDbData: ProjectContract[] | undefined = []

      if (IS_USING_MOCK_DATA) {
        fetchedDbData = mockProjectContractsData
      } else {
        fetchedDbData = projectContractsData
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
      const osoData: OSOData[] = await Promise.all(
        consolidatedDbDataArray.map(async (deployer: DBData) => {
          const result = await getDeployerOSOData(deployer.deployerAddress)
          if (result) {
            return {
              address: result.address,
              contracts: result.contracts,
            }
          }
        }),
      ).then((data) =>
        data.filter((data): data is OSOData => data !== undefined),
      )

      // console.log(osoData)

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
  }, [form, projectContractsData])

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
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <p>hello</p>
        </form>
      </Form>
      <div className="w-full h-10 bg-primary" />
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
