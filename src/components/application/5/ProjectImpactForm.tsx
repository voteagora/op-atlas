import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Callout } from "@/components/common/Callout"
import ExternalLink from "@/components/ExternalLink"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import { CATEGORIES } from "./ApplicationDetails"

const REPOSANDLINKS = [
  {
    type: "Repo",
    title: "Cuiditate non provident",
  },
  {
    type: "Link",
    title: "Quod maxime placeat facere possimus",
  },
  {
    type: "Link",
    title: "Laborum et dolorum",
  },
  {
    type: "Link",
    title: "Nam libero tempore",
  },
  {
    type: "Contract",
    title: "Itaque earum rerum hic tenetur a sapiente delectus",
  },
  {
    type: "Contract",
    title: "At vero eos et accusamus et iusto",
  },
  {
    type: "Contract",
    title: "Nam liberotini",
  },
  {
    type: "Contract",
    title: "Omnis dolor repellendus",
  },
]

const ProjectImpactForm = () => {
  return (
    <div className="p-8 border border-input rounded-xl">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="!p-0">
            <div className="flex gap-4 items-center w-full">
              <Checkbox
                checked={false}
                className="mt-1 border-2 rounded-[2px]"
              />
              <Image
                width={48}
                height={48}
                className="h-12 w-12 rounded-sm"
                src="/assets/images/social-share-background.png"
                alt=""
              />
              <div className="flex flex-col text-start">
                <h5 className="text-base font-semibold text-secondary-foreground">
                  RPC & Block Explorer
                </h5>
                <p>Admin</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="mt-12 flex flex-col gap-4">
              <h5 className="text-sm font-medium">
                Choose a category of impact for this project
                <span className="text-destructive">*</span>
              </h5>

              {CATEGORIES.map((category, index) => (
                <CategoryItem
                  key={index}
                  title={category.title}
                  description={category.description}
                  className={category.className}
                  icon={category.icon}
                />
              ))}

              <p className="text-sm text-secondary-foreground">
                Unsure which category to choose?
                <ExternalLink className="underline" href="#">
                  {" "}
                  Get help in Discord.
                </ExternalLink>
              </p>

              <ImpactDetailsForm />

              <p className="text-sm text-secondary-foreground">
                To add new repos, links, or contracts,
                <ExternalLink className="underline" href="/dashboard">
                  {" "}
                  visit your project settings.
                </ExternalLink>
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

const CategoryItem = ({
  checked,
  onCheckboxChange,
  title,
  description,
  icon,
  className,
}: {
  title: string
  description: string
  icon: string
  className?: string

  checked?: boolean
  onCheckboxChange?: (checked: boolean) => void
}) => {
  return (
    <div className="p-6 flex items-center gap-4 border border-input rounded-xl">
      <Checkbox
        // checked={checked}
        // onChange={(e) => onCheckboxChange(e)}
        className="mt-1 border-2 rounded-[2px]"
      />
      <div>
        <h6 className="text-sm font-medium">{title}</h6>
        <p className="text-sm text-secondary-foreground">{description}</p>
      </div>
      <div
        className={cn(
          "min-w-16 h-16 flex justify-center items-center rounded-lg",
          className,
        )}
      >
        <Image src={icon} alt={title} width={16} height={18} />
      </div>
    </div>
  )
}

const ImpactDetailsForm = () => {
  return (
    <div className="flex flex-col gap-6">
      <h4 className="text-xl font-semibold">Impact</h4>
      <p className="text-sm">
        Describe this project’s impact on the OP Stack from Oct 1, 2023 - July
        31, 2024. Please only describe the impact that was delivered during that
        specific time period.
      </p>
      <p className="text-sm">
        You’ve already given your project a description in your project setup.
        There’s no need to repeat that information here. Instead, focus on
        communicating your project’s impact.
      </p>
      <Callout
        className="!text-sm"
        type="info"
        text="Promises of future deliverables or impact are not allowed. "
      />

      <div>
        <h6 className="text-sm font-medium">
          What entities or infrastructure depend on this project (Oct 1, 2023 -
          July 31, 2024)?<span className="text-destructive">*</span>
        </h6>
        <p className="text-sm text-secondary-foreground">
          Aka: who gets value from this project?
        </p>
        <Textarea className="min-h-60" placeholder="Add a response" />
      </div>

      <div>
        <h6 className="text-sm font-medium">
          How do you measure impact and what were your results (Oct 1, 2023 -
          July 31, 2024)?<span className="text-destructive">*</span>
        </h6>
        <p className="text-sm text-secondary-foreground">
          Aka: what are your success metrics?
        </p>
        <Textarea className="min-h-60 mt-2" placeholder="Add a response" />
      </div>
      <div>
        <h6 className="text-sm font-medium">
          Is there anything else you’d like to add?
        </h6>
        <Textarea className="min-h-60 mt-2" placeholder="Add a response" />
      </div>
      <div>
        <h6 className="text-sm font-medium">
          What repos, links, and contracts should badgeholders review?{" "}
          <span className="text-destructive">*</span>
        </h6>
        <p className="text-sm text-secondary-foreground">
          Clarify what badgeholders should focus on for this round. By default,
          all are selected.
        </p>
        <div className="flex flex-col gap-2 mt-2">
          {REPOSANDLINKS.map((link, index) => (
            <div
              key={index}
              className="px-3 py-2.5 flex items-center gap-2 border border-input rounded-xl"
            >
              <Checkbox
                // checked={checked}
                // onChange={(e) => onCheckboxChange(e)}
                className="border-2 rounded-[2px]"
              />
              <Badge variant="secondary">{link.type}</Badge>
              <p className="text-sm">{link.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProjectImpactForm
