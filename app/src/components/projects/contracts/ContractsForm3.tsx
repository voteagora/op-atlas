"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ProjectContract } from "@prisma/client"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormMessage } from "@/components/ui/form"

import { OsoDeployerContractsReturnType, ProjectWithDetails } from "@/lib/types"

import { ContractsSchema2 } from "./schema2"

import { useProjectContracts } from "@/hooks/useProjectContracts"
import {
  useOsoDeployedContracts,
  useOsoDeployersDeployedContracts,
} from "@/hooks/useOsoDeployedContracts"
import {
  mockOsoDeployerContractsData,
  mockOsoDeployersContractsData,
} from "./MockOsoDeployerContractsData"
import {
  IS_USING_EMPTY_MOCK_DATA,
  IS_USING_MOCK_DATA,
  mockProjectContractsData,
} from "./MockProjectContractsData"
import { DeployersSchema } from "./schema3"
import { DeployersFormField } from "./DeployersFormField"
import {
  convertContracts,
  groupByDeployer,
  replaceArtifactSourceWithNumber,
} from "@/lib/utils/contractForm"
import { getAddress } from "viem"

const osoLiveTestDeployerAddresses = [
  "0xa18d0226043a76683950f3baabf0a87cfb32e1cb", // OSO Sample
  "0x3fab184622dc19b6109349b94811493bf2a45362", // OSO image
  "0x83bc3055649f9a829bebeccbc86e090d6a157161",
]
const EMPTY_DEPLOYER = {
  address: "",
  contracts: [],
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
    reValidateMode: "onChange",
  })

  const { data: projectContractsData } = useProjectContracts(project.id)

  const projectContractsByDeployer = Object.values(
    groupByDeployer(projectContractsData || []),
  )

  // const { data: osoDeployerContractsData } = useOsoDeployedContracts(
  //   "0xa18d0226043a76683950f3baabf0a87cfb32e1cb",
  // )

  const deployerAddresses = projectContractsByDeployer?.map(
    (projectContractData) => {
      return projectContractData.deployerAddress
    },
  )

  // console.log(deployerAddresses)

  const { data: osoDeployersContractsData } = useOsoDeployersDeployedContracts(
    deployerAddresses ?? [],
    // ["0xa18d0226043a76683950f3baabf0a87cfb32e1cb"],
  )

  // console.log(osoDeployersContractsData)

  function getProjectContractsData() {
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

  function getOsoDeployersContractsData() {
    return IS_USING_MOCK_DATA
      ? IS_USING_EMPTY_MOCK_DATA
        ? []
        : mockOsoDeployersContractsData
      : osoDeployersContractsData
  }

  useEffect(() => {
    async function get() {
      const projectContracts = getProjectContractsData()
      const osoDeployersContracts = getOsoDeployersContractsData()

      if (projectContracts === undefined || osoDeployersContracts === undefined)
        return

      console.log("projects contracts:")
      console.log(projectContracts)

      // const projectContractsByDeployer = Object.values(
      //   groupByDeployer(projectContracts!),
      // )

      console.log("projects contracts (unique):")
      console.log(projectContractsByDeployer)

      // const osoDeployerContracts = await getOsoDeployerContractsData()

      // console.log("oso deployer contracts:")
      // console.log(osoDeployerContracts)

      console.log("oso deployers contracts:")
      console.log(osoDeployersContracts)

      // deep clones as to not alter the original object
      const osoDeployersContracts__ChainCorrected =
        replaceArtifactSourceWithNumber(
          JSON.parse(JSON.stringify(osoDeployersContracts)),
        )

      console.log("oso deployers contracts (chain corrected):")
      console.log(osoDeployersContracts__ChainCorrected)

      const osoDeployersContracts__DeployerFormatted = convertContracts(
        osoDeployersContracts__ChainCorrected,
      )

      console.log("oso deployers contracts (unique)")
      console.log(osoDeployersContracts__DeployerFormatted)

      const mergedDeployersFormData: z.infer<typeof DeployersSchema> = {
        deployers: [] as Array<{
          address: string
          contracts: Array<{
            address: string
            chainId: string
            excluded: boolean
          }>
        }>,
      }

      // Merge the deployers data from both sources
      const deployersData = [
        ...projectContractsByDeployer.map((deployer) => ({
          address: deployer.deployerAddress,
          contracts: deployer.contracts.map((contract) => ({
            address: contract.address,
            chainId: contract.chainId.toString(),
            excluded: false,
          })),
        })),

        ...osoDeployersContracts__DeployerFormatted.map((deployer) => ({
          address: deployer.deployerAddress,
          contracts: deployer.contracts.map((contract) => {
            const isContractExcluded =
              projectContracts?.find(
                (projectContract) =>
                  getAddress(projectContract.contractAddress) ===
                    getAddress(contract.address) &&
                  projectContract.chainId === contract.chainId,
              ) === undefined

            return {
              address: contract.address,
              chainId: contract.chainId.toString(),
              excluded: isContractExcluded,
            }
          }),
        })),
      ]

      // Now we need to merge the deployers based on `deployerAddress`
      const mergedDeployers = new Map<
        string,
        {
          address: string
          contracts: Array<{
            address: string
            chainId: string
            excluded: boolean
          }>
        }
      >()

      deployersData.forEach((deployer) => {
        if (!mergedDeployers.has(deployer.address)) {
          mergedDeployers.set(deployer.address, {
            address: deployer.address,
            contracts: [],
          })
        }

        // Merge contracts for the same deployer
        const existingDeployer = mergedDeployers.get(deployer.address)
        deployer.contracts.forEach((contract) => {
          // Check if contract already exists, if not, add it
          const existingContract = existingDeployer!.contracts.find(
            (existingContract) =>
              getAddress(existingContract.address) ===
                getAddress(contract.address) &&
              existingContract.chainId === contract.chainId,
          )
          if (!existingContract) {
            existingDeployer!.contracts.push(contract)
          } else {
            // Update the excluded status if needed
            existingContract.excluded =
              existingContract.excluded || contract.excluded
          }
        })
      })

      // Convert the merged data into the expected structure
      mergedDeployersFormData.deployers = Array.from(mergedDeployers.values())

      // // const a = [
      // //   ...deployersFormData2.deployers,
      // //   deployersFormData.deployers,
      // // ];

      // console.log([
      //   ...deployersFormData2.deployers,
      //   deployersFormData.deployers,
      // ])

      form3.setValue("deployers", mergedDeployersFormData.deployers)

      // console.log(deployersFormData)
    }

    get()
  }, [projectContractsData, osoDeployersContractsData])

  const onSubmit3 = (data: z.infer<typeof DeployersSchema>) => {
    console.log(data)
  }

  const projectContracts = getProjectContractsData()

  return (
    <Form {...form3}>
      <form onSubmit={form3.handleSubmit(onSubmit3)}>
        <DeployersFormField
          form={form3}
          projectContracts={projectContracts || []}
        />
      </form>

      <Button variant={"destructive"} type="submit" className="w-20">
        Save
      </Button>
    </Form>
  )
}
