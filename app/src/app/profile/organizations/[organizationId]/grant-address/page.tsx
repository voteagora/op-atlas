import { notFound } from "next/navigation"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import posthog from "@/lib/posthog"

import { GrantAddressForm } from "./components"

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  const isKycEnabled = await posthog.isFeatureEnabled(
    "add-grant-delivery-address-form",
    session.user.id,
  )

  if (!isKycEnabled) {
    return notFound()
  }

  return <GrantAddressForm isKycEnabled={isKycEnabled} />
}
