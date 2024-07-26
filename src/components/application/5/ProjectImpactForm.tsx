import Image from "next/image"
import React from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

import { CATEGORIES } from "./ApplicationDetails"

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

export default ProjectImpactForm
