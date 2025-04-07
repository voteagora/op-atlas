import { redirect } from "next/navigation"

export default async function Page({
  params,
}: {
  params: { rewardId: string }
}) {
  redirect("/dashboard")
}
