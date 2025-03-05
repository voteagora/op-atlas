import {
  Accordion as ShadcnAccordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type Item = {
  title: string | React.ReactNode
  content: string | React.ReactNode
}

type AccordionProps = {
  items: Item[]
  type: "single" | "multiple"
  collapsible?: boolean
  triggerLocation?: "top" | "bottom"
}

/**
 * Accordion component.
 * @param items - The items to display in the accordion.
 * @param type - The type of accordion to display.
 * @param collapsible - Whether the accordion is collapsible. Default is true.
 *
 * @example
 * const faqQuestions = [
 *  {
 *      title: "What is Saasify?",
 *      content: "Saasify is a highly optimized, battle-tested boilerplate for building SaaS applications. It includes modern tools, best practices, and pre-built features to help developers save time and focus on their product's unique value.",
 *  },
 * ]
 *
 * <Accordion items={faqQuestions} type="single" />
 */
export default function Accordion({
  items,
  type,
  collapsible = true,
  triggerLocation = "top",
}: AccordionProps) {
  return (
    <ShadcnAccordion
      type={type as any}
      collapsible={collapsible}
      className="w-full space-y-1"
      defaultValue={type === "multiple" ? (["item-0"] as any) : "item-0"}
    >
      {items?.map(({ content, title }, index) => {
        const wrappedTitle =
          typeof title === "string" ? (
            <h4 className="font-medium text-sm">{title}</h4>
          ) : (
            title
          )

        return (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="w-full space-y-1"
          >
            {collapsible && triggerLocation === "top" ? (
              <AccordionTrigger>{wrappedTitle}</AccordionTrigger>
            ) : null}

            {!collapsible && triggerLocation === "top" ? (
              <h4 className="h-9 pt-2">{wrappedTitle}</h4>
            ) : null}

            <AccordionContent>{content}</AccordionContent>

            {collapsible && triggerLocation === "bottom" ? (
              <AccordionTrigger>{wrappedTitle}</AccordionTrigger>
            ) : null}

            {!collapsible && triggerLocation === "bottom" ? (
              <h4 className="h-9 pt-2">{wrappedTitle}</h4>
            ) : null}
          </AccordionItem>
        )
      })}
    </ShadcnAccordion>
  )
}
