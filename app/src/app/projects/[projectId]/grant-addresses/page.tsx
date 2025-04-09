import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { auth } from "@/auth"

import { AddGrantDeliveryAddressContainer } from "./components"
import posthog from "@/lib/posthog"

export default async function Page({
  params,
}: {
  params: { projectId: string }
}) {
  const session = await auth()

  if (!session?.user.id) {
    redirect("/login")
  }

  if (!session?.user.id) {
    redirect("/dashboard")
  }

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
        <h3>Verified addresses</h3>
        <AddGrantDeliveryAddressContainer projectId={params.projectId} />
      </div>
      <div>
        <p className="text-secondary-foreground text-sm font-normal">
          Need help? Contact{" "}
          <Link href="mailto:retrofunding@optimism.io" className="underline">
            retrofunding@optimism.io
          </Link>
        </p>
      </div>
    </div>
  )
}
