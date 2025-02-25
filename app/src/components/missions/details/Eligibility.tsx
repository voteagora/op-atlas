import { useMissionFromPath } from "@/hooks/db/useMissionFromPath"

export const Eligibility = () => {
  const mission = useMissionFromPath()

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xl font-semibold">Eligibility</p>
      <p className="text-secondary-foreground">
        In order to apply,{" "}
        <span className="font-semibold">your Onchain project</span> must first
        be added to OP Atlas. A project can&apos;t be considered for enrollment
        until its setup is complete.
      </p>

      {mission?.missionPageEligibility}
    </div>
  )
}
