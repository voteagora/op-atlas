import StandardProposals from "@/app/proposals/proposalsPage/components/standardProposals/StandardProposals"

const Page = () => {
  // Get the proposals page

  return (
    <main className="flex flex-col flex-1 h-full items-center bg-secondary pb-12">
      <StandardProposals />
    </main>
  )
}

export default Page
