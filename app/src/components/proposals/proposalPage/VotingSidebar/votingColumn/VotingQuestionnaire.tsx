import { useState } from "react"

import DropdownItem from "@/components/common/DropdownItem"
import Questionnaire, { QuestionType } from "@/components/dialogs/Questionnaire"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem as BaseSelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import * as SelectPrimitive from "@radix-ui/react-select"
import * as React from "react"

// Custom SelectItem without checkmark
const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none focus:bg-secondary focus:text-secondary-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
// Necessary for forwardRef
SelectItem.displayName = "SelectItem"

type VotingQuestionerProps = {
  title?: string
  titleAltText?: string
  onVoteSubmit?: (vote: string) => void
  onCancel?: () => void
  options?: string[]
  open?: boolean
}

const VotingQuestionnaire = ({
  title = "On a scale of 1-10, how easy was it for you to identify credible-candidates?",
  titleAltText = "Required to submit your vote. You can't make edits after choosing to submit.",
  onVoteSubmit,
  onCancel,
  options,
  open = true,
}: VotingQuestionerProps) => {
  // Create a scale from 1-10 with descriptive text for 1 and 10
  const defaultOptions = [
    "1 (extremely difficult)",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10 (extremely easy)",
  ]

  // Use provided options or default to our scale
  const voteOptions = options || defaultOptions
  const [selectedVote, setSelectedVote] = useState<string>("")

  // Create the dropdown question
  const voteQuestion: QuestionType = (
    <div className="w-full flex justify-center">
      <Select value={selectedVote} onValueChange={setSelectedVote}>
        <SelectTrigger className="w-[410px] py-2 rounded-lg border border-input">
          <SelectValue placeholder="Select your vote" />
        </SelectTrigger>
        <SelectContent className="w-[410px] h-[240px] py-2 rounded-lg border border-input shadow-[0px_12px_42px_-4px_#14171A1F,0px_8px_18px_-6px_#14171A1F]">
          <div className="w-[410px] h-[224px]">
            {voteOptions.map((option) => (
              <SelectItem
                key={option}
                value={option}
                className="mb-1 last:mb-0 w-[410px] h-8 px-2"
              >
                <DropdownItem>{option}</DropdownItem>
              </SelectItem>
            ))}
          </div>
        </SelectContent>
      </Select>
    </div>
  )

  // Custom completion button
  const completionButtons = (
    <div className="flex flex-col gap-2 w-[410px] mx-auto">
      <Button
        variant="destructive"
        className="h-11 py-2.5 rounded-md w-[410px] hover:opacity-80 disabled:bg-destructive disabled:text-background"
        onClick={() => onVoteSubmit && onVoteSubmit(selectedVote)}
        disabled={!selectedVote}
      >
        Sign message and cast vote
      </Button>
    </div>
  )

  return (
    <Questionnaire
      title={title}
      titleAltText={titleAltText}
      questions={[voteQuestion]}
      completionButtons={completionButtons}
      open={open}
      hasSelection={!!selectedVote}
      onOpenChange={(isOpen) => {
        if (!isOpen && onCancel) {
          setSelectedVote("")
          onCancel()
        }
      }}
      onComplete={() => onVoteSubmit && onVoteSubmit(selectedVote)}
    />
  )
}

export default VotingQuestionnaire
