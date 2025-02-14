import Accordion from "@/components/common/Accordion"
import ExtendedLink from "@/components/common/ExtendedLink"

import DeliveryAddressVerificationForm from "./DeliveryAddressVerificationForm"

export default function AddGrantDeliveryAddressForm({
  userInOrganization,
}: {
  userInOrganization: boolean
}) {
  return (
    <div className="p-6 border rounded-md space-y-6 w-full">
      <h4 className="font-semibold">Add an address</h4>
      <Accordion
        type="multiple"
        items={[
          {
            title: (
              <AccordionTitleContainer
                i={1}
                text="Enter your grant delivery address"
              />
            ),
            content: <DeliveryAddressVerificationForm />,
          },
          {
            title: (
              <AccordionTitleContainer
                i={2}
                text="Submit the grant eligibility form"
              />
            ),
            content: (
              <div className="space-y-4">
                <p className="text-secondary-foreground text-sm font-normal">
                  After submitting the form, your status will be updated (within
                  1 hour).
                </p>
                {/* TODO: Disable conditionally depending on address verification */}
                <div>
                  <ExtendedLink
                    as="button"
                    variant="primary"
                    // TODO: Check if form already submitted and conditionally change text to 'Resubmit the form'
                    text={"Fill out the form"}
                    href={
                      userInOrganization
                        ? "https://kyb.optimism.io/form"
                        : "https://kyc.optimism.io/form"
                    }
                    showOutboundLinkIcon={false}
                  />
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}

function AccordionTitleContainer({ i, text }: { i: number; text: string }) {
  return (
    <div className="font-medium text-sm flex items-center space-x-2">
      <span>{i}</span>
      <span>{text}</span>
    </div>
  )
}
