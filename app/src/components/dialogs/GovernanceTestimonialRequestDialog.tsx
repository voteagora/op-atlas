import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { clickSignInWithFarcasterButton } from "@/lib/utils"

import { Button } from "../ui/button"
import { DialogProps } from "./types"

function GovernanceTestimonialRequestDialog(props: DialogProps<object>) {
  const { status } = useSession()
  const router = useRouter()

  const onGetStarted = () => {
    if (status === "authenticated") {
      router.push("/dashboard")
    } else {
      clickSignInWithFarcasterButton()
    }

    props.onOpenChange(false)
  }

  return (
    <Dialog {...props}>
      <DialogContent className="max-w-md max-h-[80vh]">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col text-center">
            <Image
              src="/assets/icons/info-black.svg"
              alt="Governance Testimonial Request Dialog"
              className="rotate-180 mx-auto"
              width={50}
              height={50}
            />
            <h3 className="mt-4">Don&apos;t forget to request testimonials</h3>
            <p className="text-secondary-foreground mt-2">
              Governance leadership submissions are encouraged to ask citizens
              and delegates familiar with their projects for testimonials on
              Metrics Garden.
            </p>
          </div>
          <Button
            onClick={onGetStarted}
            className="py-3 text-base mt-4"
            type="button"
            variant="destructive"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default GovernanceTestimonialRequestDialog
