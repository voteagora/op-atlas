import * as React from "react"

import { Checkbox } from "@/components/ui/checkbox"

interface IProps {
  setIsCodeRepoConfirmed: React.Dispatch<React.SetStateAction<boolean>>
  isCodeRepoConfirmed: boolean
}

export const CodeRepoCheckbox: React.FC<IProps> = ({
  setIsCodeRepoConfirmed,
  isCodeRepoConfirmed,
}) => (
  <div className="flex items-center space-x-2 border border-input p-4 rounded-lg w-full">
    <Checkbox
      checked={isCodeRepoConfirmed}
      onCheckedChange={(e) => setIsCodeRepoConfirmed(e.valueOf() as boolean)}
      className="border-black border-2 rounded-[2px]"
    />
    <label htmlFor="terms2" className="text-sm font-medium text-foreground ">
      This project doesn’t have a code repo
    </label>
  </div>
)
