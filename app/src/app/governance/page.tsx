import { auth } from "@/auth"
import GovernancePage from "@/components/governance/governancePage/GovernancePage"

const Page = async () => {
  const session = await auth()
  const userId = session?.user?.id
  return <GovernancePage userId={userId} />
}

export default Page
