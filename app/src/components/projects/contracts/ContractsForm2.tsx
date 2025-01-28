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
  {
    deployerAddress: "0xCA40c9aBDe6EC4b9a4d6C2cADe48513802740B6d",
    address: "0xC11f4675342041F5F0e5d294A120519fcfd9EF5c",
    chain: "34443",
  },
]

export const mockOsoContracts = [
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

const mockOsoData = [
  {
    address: "0xEa6F889692CF943f30969EEbe6DDb323CD7b9Ac1",
    contracts: [...mockOsoContracts],
  },
  {
    address: "0xCA40c9aBDe6EC4b9a4d6C2cADe48513802740B6d",
    contracts: [...mockOsoContracts2],
  },
]
// const EMPTY_CONTRACT = {
//   contractAddress: "",
//   chain: Chain.options[0],
//   name: "",
//   description: "",
// } satisfies z.infer<typeof ContractSchema2>

// function toFormValues(
//   contract: ProjectContract,
// ): z.infer<typeof ContractSchema2> {
//   return {
//     contractAddress: contract.contractAddress,
//     chain: contract.chainId.toString(),
//     name: contract.name ?? "",
//     description: contract.description ?? "",
//   }
// }

// function getDefaultValues(
//   project?: ProjectWithDetails,
// ): z.infer<typeof ContractsSchema2> {
//   if (!project) {
//     return {
//       isOffChain: false,

//       submittedToOSO: false,
//       osoSlug: "",
//       deployers: [
//         {
//           ...EMPTY_DEPLOYER,
//         },
//       ],
//     }
//   }

//   const deployers: any[] = []

//   return {
//     isOffChain: project.isOnChainContract === false,
//     deployers: deployers.length > 0 ? deployers : [{ ...EMPTY_DEPLOYER }],
//     submittedToOSO: !!project.openSourceObserverSlug,
//     osoSlug: project.openSourceObserverSlug ?? "",
//   }
// }

const mockDeployerContracts = [
  {
    deployerAddress: "0xEa6F889692CF943f30969EEbe6DDb323CD7b9Ac1",
    contracts: [
      {
        address: "0x123",
        chain: 8453,
        selected: true,
        initialSelected: true,
      },
      {
        address: "0x456",
        chain: 34443,
        selected: true,
        initialSelected: true,
      },
      {
        address: "0x789",
        chain: 10,
        selected: true,
        initialSelected: true,
      },

      {
        address: "0x111",
        chain: 10,
        selected: true,
        initialSelected: true,
      },
    ],
  },
]

export function ContractsForm2({ project }: { project: ProjectWithDetails }) {
  // const router = useRouter()
  // const [isSubmitting, setIsSubmitting] = useState(false)
  // const [isSaving, setIsSaving] = useState(false)

  // const deployers = []

  // useEffect(() => {
  //   console.log("RESET")
  //   form.reset({
  //     deployers: {
  //       ...mockDeployerContracts,
  //     },
  //   })
  // }, [form.reset, mockDeployerContracts])
  // const {
  //   fields: deployejkrFields,
  //   append: addDeployerField,
  //   // remove: removeContractsFields,
  // } = useFieldArray({
  //   control: form.control,
  //   name: "deployers",
  // })

  // // Locally, this runs twice because of strict mode but dw about it
  // useEffect(() => {
  //   toast.info("We recommend asking your developer to complete this step")
  // }, [])

  // // const onRemoveContract = async (index: number) => {
  // //   try {
  // //     const isOnlyContract = contractsFields.length === 1
  // //     const contract = form.getValues(`contracts.${index}`)

  // //     await removeContract({
  // //       projectId: project.id,
  // //       address: contract.contractAddress,
  // //       chainId: parseInt(contract.chain),
  // //     })

  // //     removeContractsFields(index)

  // //     if (isOnlyContract) {
  // //       addContractsFields({ ...EMPTY_CONTRACT })
  // //     }
  // //   } catch (error) {
  // //     console.error("Error removing repo", error)
  // //   }
  // // }

  // const onSubmit =
  //   (isSave: boolean) => (values: z.infer<typeof ContractsSchema2>) => {
  //     console.log(values)
  //   }
  // const onSubmit =
  //   (isSave: boolean) => async (values: z.infer<typeof ContractsSchema>) => {
  //     isSave ? setIsSaving(true) : setIsSubmitting(true)

  //     try {
  //       const [result] = await Promise.all([
  //         updateProjectOSOStatus({
  //           projectId: project.id,
  //           osoProjectName: values.osoSlug,
  //         }),
  //         updateProjectDetails(project.id, {
  //           isOnChainContract: !values.isOffChain,
  //         }),
  //         !values.isOffChain &&
  //           updateContractDetails({
  //             projectId: project.id,
  //             contractAddress: values.contracts[0].contractAddress,
  //             chainId: parseInt(values.contracts[0].chain),
  //             name: values.contracts[0].name,
  //             description: values.contracts[0].description,
  //           }),
  //       ])

  //       if (result.error) {
  //         throw new Error(result.error)
  //       }

  //       !isSave && router.push(`/projects/${project.id}/grants`)
  //       setIsSaving(false)
  //       toast.success("Project saved")
  //     } catch (error) {
  //       toast.error("There was an error updating project OSO status.")
  //       isSave ? setIsSaving(false) : setIsSubmitting(false)
  //     }
  //   }

  // const formValues = useWatch({
  //   control: form.control,
  // })

  // const canSubmit = (function () {
  //   return (
  //     (!!formValues.submittedToOSO &&
  //       formValues.contracts &&
  //       formValues.contracts.length > 0) ||
  //     formValues.isOffChain
  //   )
  // })()

  // can add a new contract once the previous one is verified
  // const canAddContract =
  //   formValues.contracts.length < 1 ||
  //   Boolean(formValues.contracts[formValues.contracts.length - 1].signature)

  // console.log(deployejkrFields)

  const DeployerSchema = z.object({
    address: AddressSchema,
    contracts: z.array(ContractSchema2),
  })

  const form = useForm<z.infer<typeof ContractsSchema2>>({
    resolver: zodResolver(ContractsSchema2),
    mode: "onSubmit",
    reValidateMode: "onChange",
  })

  const validateForm = (data: z.infer<typeof ContractsSchema2>) => {
    // console.log(data)
  }
  // Form submission handler
  const onSubmit = (data: z.infer<typeof ContractsSchema2>) => {
    console.log(data)
  }

  const [allDbData, setAllDbData] = useState<any>()

  useEffect(() => {
    const populateForm = async () => {
      //1. Get DB Data
      const fetchedDbData = mockDbData
      // TODO: Implement

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
      console.log(consolidatedDbDataArray)

      //3. Get OSO Data
      const fetchedOsoData = mockOsoData

      // for (let i = 0; i < consolidatedDbDataArray.length; i++) {
      //   const osoResult = await oso.getContracts(consolidatedDbDataArray[i].deployerAddress);
      //   fetchedOsoData.push(osoResult);
      // }

      //4. Cross Reference
      const formDeployers = fetchedOsoData.map((deployer) => {
        return {
          address: deployer.address,
          contracts: deployer.contracts.map((contract) => {
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

  // const deployerIndex = 0

  const { append } = useFieldArray({
    control: form.control,
    name: "deployers", // Name of the array field
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
                      <DeployerForm form={form} deployerIndex={deployerIndex} />
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
