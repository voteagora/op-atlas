import { Metadata } from "next"
import { redirect } from "next/navigation"

import { sharedMetadata } from "@/app/shared-metadata"
import { auth } from "@/auth"
import { getOrganization } from "@/db/organizations"

import { GrantAddressForm } from "./components"

export async function generateMetadata({
  params,
}: {
  params: { organizationId: string }
}): Promise<Metadata> {
  const organization = await getOrganization({ id: params.organizationId })
  const title = `Profile Organizations: ${
    organization?.name ?? ""
  } | Grant Addresses - OP Atlas`
  const description = organization?.description ?? ""
  return {
    ...sharedMetadata,
    title,
    description,
    openGraph: {
      ...sharedMetadata.openGraph,
      title,
      description,
    },
  }
}

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  return <GrantAddressForm />
}
