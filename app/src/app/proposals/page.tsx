import { auth } from "@/auth"
import ProposalsPage from "@/components/proposals/ProposalsPage"

const Page = async () => {
  const session = await auth()
  const userId = session?.user?.id
  return <ProposalsPage userId={userId} />
}

export default Page
