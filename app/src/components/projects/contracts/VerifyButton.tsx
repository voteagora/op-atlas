import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form"
import { Loader2 } from "lucide-react"
import { ReactNode, useState } from "react"
import { mockDbContracts, mockOsoContracts } from "./ContractsForm2"

export function VerifyButton({
  form,
  deployerIndex,
  validateForm,
}: {
  form: any
  deployerIndex: number
  validateForm: any
}) {
  const [isVerifying, setIsVerifying] = useState(false)

  const [errorMessage, setErrorMessage] = useState<ReactNode>()

  async function handleOnClick() {
    setIsVerifying(true)
    setErrorMessage(undefined)

    //load from OSO - and append contracts
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // const deployer = form.getValues().deployers[deployerIndex]

    // const contracts = form.getValues().deployers[deployerIndex].contracts;

    form.setValue(`deployers.${deployerIndex}.contracts`, mockOsoContracts)
    // deployer.contracts = mockDbContracts

    if (form.getValues().deployers[deployerIndex].contracts.length <= 0) {
      setErrorMessage(
        <p className="text-rose-600">
          We couldn’t find any contracts deployed by this address. Learn more
          about <span className="underline">missing contracts</span>
        </p>,
      )
    }

    setIsVerifying(false)
  }

  return (
    <FormField
      control={form.control}
      name={`deployers.${deployerIndex}.contracts`}
      render={({ field: contractsField }) => (
        <>
          {isVerifying && (
            <div className="flex items-center">
              <Loader2 width={16} height={16} className="animate-spin" />
              <p>Searching for contracts</p>
            </div>
          )}

          {errorMessage}
          {contractsField.value.length <= 0 && !isVerifying && (
            <Button
              variant={"destructive"}
              type="button"
              className="w-20"
              onClick={handleOnClick}
            >
              {errorMessage !== undefined ? "Retry" : "Verify"}
            </Button>
          )}
        </>
      )}
    />
  )
}
