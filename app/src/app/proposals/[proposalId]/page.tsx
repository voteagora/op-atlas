import { notFound } from "next/navigation"

interface PageProps {
  params: {
    proposalId: string
  }
}

const Page = (params: PageProps) => {
  // Get the proposals page

  if (!false) {
    return notFound()
  }

  return (
    <main className="flex flex-col flex-1 h-full items-center bg-secondary pb-12">
      Test
    </main>
  )
}

export default Page
