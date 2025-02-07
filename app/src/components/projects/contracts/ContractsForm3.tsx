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
import { OsoDeployerContractsReturnType, ProjectWithDetails } from "@/lib/types"

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
import { DeployersSchema } from "./schema3"
import { ContractFormField } from "./ContractFormField"

const EMPTY_DEPLOYER = {
  address: "",
  contracts: [],
}

const IS_USING_MOCK_DATA = true
const IS_USING_EMPTY_MOCK_DATA = false

const supportedMappings = {
  OPTIMISM: 10,
  BASE: 8453,
  MODE: 34443,
}

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
  const form3 = useForm<z.infer<typeof DeployersSchema>>({
    resolver: zodResolver(DeployersSchema),
    mode: "onSubmit",
    // reValidateMode: "onChange",
  })

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

  // const { data: osoDeployerContractsData } = useOsoDeployedContracts(
  //   "0xa18d0226043a76683950f3baabf0a87cfb32e1cb",
  // )

  const deployerAddresses = projectContractsData?.map((projectContractData) => {
    return projectContractData.deployerAddress
  })

  const { data: osoDeployersContractsData } = useOsoDeployersDeployedContracts(
    deployerAddresses!,
    // ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
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

  // async function getOsoDeployerContractsData() {
  //   return IS_USING_MOCK_DATA
  //     ? mockOsoDeployerContractsData
  //     : osoDeployerContractsData
  // }

  async function getOsoDeployersContractsData() {
    return IS_USING_MOCK_DATA
      ? IS_USING_EMPTY_MOCK_DATA
        ? []
        : mockOsoDeployersContractsData
      : osoDeployersContractsData
  }

  function convertContracts(
    data: OsoDeployerContractsReturnType[],
  ): ProjectContractsByDeployer[] {
    const result: ProjectContractsByDeployer[] = []

    for (const item of data) {
      for (const contract of item.oso_contractsV0) {
        // Find existing entry for this deployer or create a new one
        let entry = result.find(
          (e) => e.deployerAddress === contract.rootDeployerAddress,
        )
        if (!entry) {
          entry = {
            deployerAddress: contract.rootDeployerAddress,
            contracts: [],
          }
          result.push(entry)
        }

        // Add contract address if it's not already in the list
        if (
          !entry.contracts.find(
            (entryContract) =>
              entryContract.address === contract.contractAddress,
          )
        ) {
          entry.contracts.push({
            address: contract.contractAddress,
            chainId: Number(contract.artifactSource),
          })
        }
      }
    }

    return result
  }

  function replaceArtifactSourceWithNumber(
    data: OsoDeployerContractsReturnType[],
  ) {
    // Define a counter for unique numbers

    // Use map to create a new array with the modified data
    return data.map((item) => {
      // If oso_contractsV0 exists and is an array, modify each contract
      if (Array.isArray(item.oso_contractsV0)) {
        item.oso_contractsV0 = item.oso_contractsV0.map((contract) => {
          try {
            // Replace artifactSource with a number
            contract.artifactSource =
              supportedMappings[
                contract.artifactSource as keyof typeof supportedMappings
              ].toString()
          } catch (e) {
            contract.artifactSource = "UNSUPPORTED"
          }

          return contract
        })
      }
      return item
    })
  }

  interface ProjectContractsByDeployer {
    deployerAddress: string
    contracts: Array<{ address: string; chainId: number }>
  }

  function groupByDeployer(deployments: ProjectContract[]): {
    [key: string]: ProjectContractsByDeployer
  } {
    const groupedMap: { [key: string]: ProjectContractsByDeployer } = {}

    for (const deployment of deployments) {
      if (!groupedMap[deployment.deployerAddress]) {
        groupedMap[deployment.deployerAddress] = {
          deployerAddress: deployment.deployerAddress,
          contracts: [],
        }
      }
      groupedMap[deployment.deployerAddress].contracts.push({
        address: deployment.contractAddress,
        chainId: deployment.chainId,
      })
    }

    // Convert the map to an array
    return groupedMap
  }

  const [formValidProjectContracts, setFormValidProjectContracts] = useState<
    ProjectContractsByDeployer[]
  >([])
  const [formValidOsoDeployers, setFormValidOsoDeployers] =
    useState<OsoDeployerContractsReturnType[]>()

  useEffect(() => {
    async function get() {
      // Steps to get data properly
      // 1. Load project contracts from Database
      // 2. Sort project contracts by deployer
      // 3. Get OSO data
      // 4. Correct OSO data chains

      const projectContracts = await getProjectContractsData()

      console.log("projects contracts:")
      console.log(projectContracts)

      const projectContractsByDeployer = Object.values(
        groupByDeployer(projectContracts!),
      )

      console.log("projects contracts (unique):")

      console.log(projectContractsByDeployer)

      setFormValidProjectContracts(projectContractsByDeployer)

      // const osoDeployerContracts = await getOsoDeployerContractsData()

      // console.log("oso deployer contracts:")
      // console.log(osoDeployerContracts)

      const osoDeployersContracts = await getOsoDeployersContractsData()

      console.log("oso deployers contracts:")
      console.log(osoDeployersContracts)

      // deep clones as to not alter the original object
      const osoDeployersContracts__ChainCorrected =
        replaceArtifactSourceWithNumber(
          JSON.parse(JSON.stringify(osoDeployersContracts)),
        )

      console.log("oso deployers contracts (chain corrected):")
      console.log(osoDeployersContracts__ChainCorrected)

      setFormValidOsoDeployers(osoDeployersContracts__ChainCorrected)

      const osoDeployersContracts__DeployerFormatted = convertContracts(
        osoDeployersContracts__ChainCorrected,
      )

      console.log("oso deployers contracts (unique)")
      console.log(osoDeployersContracts__DeployerFormatted)

      const deployersFormData: z.infer<typeof DeployersSchema> = {
        deployers: osoDeployersContracts__DeployerFormatted.map((deployer) => {
          return {
            address: deployer.deployerAddress,
            contracts: deployer.contracts.map((contract) => {
              return {
                address: contract.address,
                chain: contract.chainId.toString(),
              }
            }),
          }
        }),
      }

      form3.setValue("deployers", deployersFormData.deployers)

      console.log(deployersFormData)
    }

    get()
  }, [projectContractsData, osoDeployersContractsData])

  const onSubmit3 = (data: z.infer<typeof DeployersSchema>) => {
    console.log(data)
  }

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
      <Form {...form3}>
        <form onSubmit={form3.handleSubmit(onSubmit3)}>
          <FormField
            control={form3.control}
            name={`deployers`}
            render={({ field: deployers }) => (
              <div>
                {deployers?.value?.map((deployer, deployerIndex) => {
                  return (
                    <div key={"Deployer" + deployerIndex}>
                      <FormField
                        control={form3.control}
                        name={`deployers.${deployerIndex}.address`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col gap-1.5">
                            <FormLabel>Deployer Address</FormLabel>
                            <Input
                              {...field}
                              placeholder="Add a deployer address"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormItem className="flex flex-col gap-1.5">
                        <FormLabel>Contracts</FormLabel>
                        <FormField
                          control={form3.control}
                          name={`deployers.${deployerIndex}.contracts`}
                          render={({ field: contracts }) => (
                            <div>
                              {contracts.value.map((contract, index) => {
                                return (
                                  <ContractFormField
                                    form={form3}
                                    deployerIndex={deployerIndex}
                                    contractIndex={index}
                                  />
                                )
                              })}
                            </div>
                          )}
                        />
                        <FormMessage />
                      </FormItem>
                    </div>
                  )
                })}
              </div>
            )}
          />

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
