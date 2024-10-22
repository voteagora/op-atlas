import { Results } from "@/components/round/results"

export default function Page({ params }: { params: { roundId: string } }) {
  return <Results roundId={params.roundId} />
}
