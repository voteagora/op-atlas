import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { ReposFormSchema } from "./schema"

export const LinkForm = ({
  form,
  index,
}: {
  form: UseFormReturn<z.infer<typeof ReposFormSchema>>
  index: number
}) => {
  const [isFormExpanded, setIsRepoFormExpanded] = useState(true)
  return (
    <div className="p-6 border border-input rounded-lg">
      <div className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name={`links.${index}.url`}
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1.5">
              <FormLabel className="text-foreground">Link URL</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Add a URL" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isFormExpanded && (
          <div className="flex flex-col gap-6">
            <FormField
              control={form.control}
              name={`links.${index}.name`}
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1.5">
                  <FormLabel className="text-foreground">Name</FormLabel>
                  <Input
                    type=""
                    id="name"
                    placeholder="Add a name"
                    {...field}
                  />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`links.${index}.description`}
              render={({ field }) => (
                <FormItem className="flex flex-col gap-1.5">
                  <FormLabel className="text-foreground">Description</FormLabel>

                  <Textarea
                    placeholder="Describe this contribution"
                    className="resize-none"
                    {...field}
                  />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
      <Button
        onClick={() => setIsRepoFormExpanded(!isFormExpanded)}
        variant="ghost"
        type="button"
        className="!p-0 text-sm font-medium text-secondary-foreground"
      >
        {isFormExpanded ? "Hide additional inputs" : "Show additional inputs"}{" "}
        {isFormExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </Button>
    </div>
  )
}
