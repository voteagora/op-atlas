import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"

interface IProps {
  setIsTeamConfirmed: React.Dispatch<React.SetStateAction<boolean>>
  isTeamConfirmed: boolean
}

export const ConfirmTeamCheckbox: React.FC<IProps> = ({
  setIsTeamConfirmed,
  isTeamConfirmed,
}) => (
  <div className="flex items-center gap-2 border border-input p-4 rounded-lg">
    <Checkbox
      id="team-confirmed"
      checked={isTeamConfirmed}
      onCheckedChange={(e) => setIsTeamConfirmed(e.valueOf() as boolean)}
      className="border-black border-2 rounded-[2px]"
    />
    <label
      htmlFor="team-confirmed"
      className="text-sm font-medium text-foreground"
    >
      Done adding team members
    </label>
  </div>
)
