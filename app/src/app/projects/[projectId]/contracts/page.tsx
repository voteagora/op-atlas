import { redirect } from "next/navigation"

export default async function Page({
  params,
}: {
  params: { projectId: string }
}) {
  redirect(`/projects/${params.projectId}/details`)
}
