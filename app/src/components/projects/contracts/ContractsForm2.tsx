"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ProjectContract } from "@prisma/client"
import { Check, Ellipsis, Plus, X } from "lucide-react"
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

const EMPTY_DEPLOYER = {
  deployerAddress: "",
  contracts: [],
}

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

function getDefaultValues(
  project?: ProjectWithDetails,
): z.infer<typeof ContractsSchema2> {
  if (!project) {
    return {
      isOffChain: false,

      submittedToOSO: false,
      osoSlug: "",
      deployers: [
        {
          ...EMPTY_DEPLOYER,
        },
      ],
    }
  }

  const deployers: any[] = []

  return {
    isOffChain: project.isOnChainContract === false,
    deployers: deployers.length > 0 ? deployers : [{ ...EMPTY_DEPLOYER }],
    submittedToOSO: !!project.openSourceObserverSlug,
    osoSlug: project.openSourceObserverSlug ?? "",
  }
}

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
    // deployerAddress: AddressSchema,
    contracts: z.array(ContractSchema2),
  })

  const form = useForm<z.infer<typeof DeployerSchema>>({
    resolver: zodResolver(DeployerSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
  })

  // Form submission handler
  const onSubmit = (data: z.infer<typeof DeployerSchema>) => {
    console.log(data)
  }

  const [dbData, setDbData] = useState<any>()

  const [isDropdownOpens, setIsDropdownOpens] = useState<boolean[]>([])

  useEffect(() => {
    const populateForm = async () => {
      const osoData = {
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
      }

      const dbData = {
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
        ],
      }

      setDbData(dbData)
      const resultingData = osoData.contracts.map((contract) => {
        // Check if the contract is present in dbData
        const isInDb = dbData.contracts.some(
          (dbContract) =>
            dbContract.address === contract.address &&
            dbContract.chain === contract.chain,
        )

        return {
          ...contract,
          excluded: !isInDb, // Mark as excluded if not found in dbData
        }
      })

      setIsDropdownOpens([
        ...resultingData.map(() => {
          return true
        }),
      ])

      form.setValue("address", dbData.address)
      form.setValue("contracts", resultingData)
    }
    populateForm()
  }, [form])

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Name Field */}
          <FormField
            control={form.control}
            name={`address`}
            render={({ field }) => (
              <div>
                <FormLabel>Address</FormLabel>
                <Input {...field} />
                {form.formState.errors.address && (
                  <p>{form.formState.errors.address.message}</p>
                )}
              </div>
            )}
          />

          <FormField
            control={form.control}
            name={`contracts`}
            render={({ field }) => (
              <div>
                {field.value?.map((contract, index) => (
                  <FormField
                    control={form.control}
                    name={`contracts.${index}`}
                    render={({ field }) => (
                      <div className="flex">
                        <div
                          key={index}
                          className="flex justify-between h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  focus-visible:ring-0 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {/* You can render contract details here */}
                          <div className="flex items-center">
                            {field.value.excluded ? (
                              <X width={16} height={16} />
                            ) : (
                              <Check width={16} height={16} />
                            )}
                            <p>{field.value.address}</p>
                          </div>

                          <div className="flex gap-4">
                            {field.value.excluded &&
                              dbData.contracts.some(
                                (dbContract: any) =>
                                  dbContract.address === field.value.address &&
                                  dbContract.chain === field.value.chain,
                              ) && (
                                <p className="bg-gray-300 rounded-lg px-2 py.5">
                                  Exclude
                                </p>
                              )}

                            {!field.value.excluded &&
                              !dbData.contracts.some(
                                (dbContract: any) =>
                                  dbContract.address === field.value.address &&
                                  dbContract.chain === field.value.chain,
                              ) && (
                                <p className="bg-gray-300 rounded-lg px-2 py.5">
                                  Include
                                </p>
                              )}

                            <ContractDropdownButton form={form} index={index} />
                          </div>

                          {/* Example */}
                          {/* Add more fields related to the contract here */}
                        </div>
                      </div>
                    )}
                  />
                ))}
              </div>
            )}
          />

          <button type="submit">Save</button>
        </form>
      </Form>
      {/* <Form {...form}> */}
      {/* <></> */}
      {/* </Form> */}
    </div>
  )
}
