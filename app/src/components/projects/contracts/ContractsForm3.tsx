"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ProjectContract } from "@prisma/client"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"

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
    // reValidateMode: "onChange",
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

  useEffect(() => {
    async function get() {
      const projectContracts = await getProjectContractsData()
      const osoDeployersContracts = await getOsoDeployersContractsData()

      if (projectContracts === undefined || osoDeployersContracts === undefined)
        return

      // console.log("projects contracts:")
      // console.log(projectContracts)

      // const projectContractsByDeployer = Object.values(
      //   groupByDeployer(projectContracts!),
      // )

      // console.log("projects contracts (unique):")

      // console.log(projectContractsByDeployer)

      // const osoDeployerContracts = await getOsoDeployerContractsData()

      // console.log("oso deployer contracts:")
      // console.log(osoDeployerContracts)

      // console.log("oso deployers contracts:")
      // console.log(osoDeployersContracts)

      // deep clones as to not alter the original object
      const osoDeployersContracts__ChainCorrected =
        replaceArtifactSourceWithNumber(
          JSON.parse(JSON.stringify(osoDeployersContracts)),
        )

      // console.log("oso deployers contracts (chain corrected):")
      // console.log(osoDeployersContracts__ChainCorrected)

      const osoDeployersContracts__DeployerFormatted = convertContracts(
        osoDeployersContracts__ChainCorrected,
      )

      // console.log("oso deployers contracts (unique)")
      // console.log(osoDeployersContracts__DeployerFormatted)

      const deployersFormData: z.infer<typeof DeployersSchema> = {
        deployers: osoDeployersContracts__DeployerFormatted.map((deployer) => {
          return {
            address: deployer.deployerAddress,
            contracts: deployer.contracts.map((contract) => {
              return {
                address: contract.address,
                chainId: contract.chainId.toString(),
                excluded:
                  projectContracts?.find(
                    (projectContract) =>
                      projectContract.contractAddress === contract.address,
                  ) === undefined,
              }
            }),
          }
        }),
      }

      form3.setValue("deployers", deployersFormData.deployers)

      // console.log(deployersFormData)
    }

    get()
  }, [projectContractsData, osoDeployersContractsData])

  const onSubmit3 = (data: z.infer<typeof DeployersSchema>) => {
    console.log(data)
  }

  return (
    <Form {...form3}>
      <form onSubmit={form3.handleSubmit(onSubmit3)}>
        <DeployersFormField form={form3} />
      </form>

      <Button variant={"destructive"} type="submit" className="w-20">
        Save
      </Button>
    </Form>
  )
}
