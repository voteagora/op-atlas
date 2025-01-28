import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form"
import { Loader2 } from "lucide-react"
import { ReactNode, useState } from "react"

export function VerifyButton({
  form,
  isVerifying,
  errorMessage,
  deployerIndex,
  onVerify,
}: {
  form: any
  isVerifying: boolean
  errorMessage: ReactNode
  deployerIndex: number
  onVerify: () => void
}) {
  // const [isVerifying, setIsVerifying] = useState(false)

  // const [errorMessage, setErrorMessage] = useState<ReactNode>()

  // async function handleOnClick() {
  // //   setIsVerifying(true)
  // //   setErrorMessage(undefined)

  //   await new Promise((resolve) => setTimeout(resolve, 2000))

  //   form.setValue(`deployers.${deployerIndex}.contracts`, mockOsoContracts)

  // //   if (form.getValues().deployers[deployerIndex].contracts.length <= 0) {
  // //     setErrorMessage(
  // //       <p className="text-rose-600">
  // //         We couldn’t find any contracts deployed by this address. Learn more
  // //         about <span className="underline">missing contracts</span>
  // //       </p>,
  // //     )
  // //   }
  // //   setIsVerifying(false)
  // }

  return (
    <FormField
      control={form.control}
      name={`deployers.${deployerIndex}.address`}
      render={({ field: deployerField }) => (
        <>
          {isVerifying && (
            <div className="flex items-center">
              <Loader2 width={16} height={16} className="animate-spin" />
              <p>Searching for contracts</p>
            </div>
          )}

          {errorMessage}

          <FormField
            control={form.control}
            name={`deployers.${deployerIndex}.contracts`}
            render={({ field: contractsField }) => (
              <>
                {contractsField.value.length <= 0 && !isVerifying && (
                  <Button
                    disabled={deployerField.value.length <= 0}
                    variant={"destructive"}
                    type="button"
                    className="w-20"
                    onClick={onVerify}
                  >
                    {errorMessage !== undefined ? "Retry" : "Verify"}
                  </Button>
                )}
              </>
            )}
          />
        </>
      )}
    />
  )
}
