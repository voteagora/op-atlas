import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../ui/accordion"

export const GrantsGlossary = () => {
  return (
    <div className="flex flex-col gap-8">
      <h4 className="text-xl font-semibold">
        Our grant programs support the Superchain ecosystem
      </h4>
      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem
          value="retro-funding"
          className="pb-4 border-b border-border"
        >
          <AccordionTrigger className="text-base p-0">
            Retro Funding
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <p className="text-sm">
              Rewards for existing projects that have already demonstrated value
              to the Superchain ecosystem.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem
          value="grants-council-missions"
          className="pb-4 border-b border-border"
        >
          <AccordionTrigger className="text-base">
            Grants Council Missions
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <p className="text-sm">
              Community-led funding for projects aligned with ecosystem needs.
              Regular application cycles with flexible focus areas.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem
          value="foundation-missions"
          className="pb-4 border-b border-border"
        >
          <AccordionTrigger className="text-base">
            Foundation Missions
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <p className="text-sm">
              Strategic initiatives to solve specific challenges identified by
              the OP Foundation.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
