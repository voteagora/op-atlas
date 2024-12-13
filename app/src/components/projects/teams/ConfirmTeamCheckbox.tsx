import { Checkbox } from "@/components/ui/checkbox"

const ConfirmTeamCheckbox = ({
  setIsTeamConfirmed,
  isTeamConfirmed,
}: {
  setIsTeamConfirmed: React.Dispatch<React.SetStateAction<boolean>>
  isTeamConfirmed: boolean
}) => (
  <div className="flex items-center gap-2 border border-input p-4 h-10 rounded-lg">
    <Checkbox
      id="team-confirmed"
      checked={isTeamConfirmed}
      onCheckedChange={(e) => setIsTeamConfirmed(e.valueOf() as boolean)}
    />
    <label
      htmlFor="team-confirmed"
      className="text-sm font-medium text-foreground"
    >
      Done adding team members
    </label>
  </div>
)

export default ConfirmTeamCheckbox
