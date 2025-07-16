import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog"

type Props = {
  children: React.ReactNode
}

const Question = ({ children }: Props) => {
  return <div>{children}</div>
}

export type QuestionType = React.ReactNode

const Questionnaire = ({
  title,
  titleAltText,
  questions,
  onComplete,
  completionButtons,
  open = true,
  onOpenChange,
  hasSelection = false,
}: {
  title: string
  titleAltText?: string
  questions: QuestionType[]
  onComplete?: () => void
  completionButtons?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  hasSelection?: boolean
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[458px] min-h-[292px] p-0 rounded-xl">
        <div className="flex flex-col h-full">
          {/* Header Section */}
          <DialogHeader className="p-6 space-y-2">
            <p className="text-xl font-semibold leading-7 tracking-[0px] text-text-default text-center">
              {title}
            </p>
            {titleAltText && (
              <div className="text-base text-text-secondary text-center leading-6 font-normal">
                {titleAltText}
              </div>
            )}
          </DialogHeader>

          {/* Questions Section */}
          <div className=" flex justify-center">
            <div className="w-full">
              {questions.map((question, index) => (
                <Question key={`question-${index}`}>{question}</Question>
              ))}
            </div>
          </div>

          {/* Buttons Section */}
          <DialogFooter className="p-6 space-y-2 sm:space-y-0 rounded-b-xl flex justify-center">
            {completionButtons || (
              <Button
                variant="destructive"
                className="w-[410px] h-11 py-2.5 rounded-md hover:opacity-80 disabled:bg-destructive disabled:text-background"
                onClick={onComplete}
                disabled={!hasSelection}
              >
                Sign Message and Cast Vote
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Questionnaire
