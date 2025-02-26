import { PlusIcon } from "lucide-react"

import { Button } from "@/components/common/Button"
import AddGrantDeliveryAddressForm from "@/components/projects/rewards/AddGrantDeliveryAddressForm"

export default function GrantAddress() {
  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <h2>Grant Delivery Address</h2>
        <p className="text-secondary-foreground font-normal">
          Add the address(es) your rewards will be delivered to. You can do this
          at any time, and your entry will be valid for one year.
        </p>
        <p className="text-secondary-foreground font-normal">
          KYC (identity verification) is required for each address.
        </p>
      </div>
      <div className="space-y-6">
        <h3>Your grant delivery addresses</h3>
        <AddGrantDeliveryAddressForm userInOrganization />
        <Button variant="secondary" leftIcon={<PlusIcon size={16} />}>
          Add more
        </Button>
      </div>
    </div>
  )
}
