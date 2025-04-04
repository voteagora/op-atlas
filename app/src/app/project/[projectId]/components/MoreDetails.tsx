import ExtendedLink from "@/components/common/ExtendedLink"

export default function MoreDetails() {
  return (
    <div className="w-full flex flex-col items-center justify-center border rounded-xl bg-background h-[208px] p-6 space-y-6">
      <div className="text-center">
        <h1 className="font-semibold text-base text-foreground">
          More details about this project are coming soon
        </h1>
        <p className="font-normal text-base text-secondary-foreground">
          In the meantime, explore other projects that have received Retro
          Funding
        </p>
      </div>
      <ExtendedLink
        as="button"
        text="View recipients"
        variant="primary"
        href="/round/results?rounds=7,8"
      />
    </div>
  )
}
