import { Circle } from "lucide-react"
import { Check } from "lucide-react"

export default function CircleWithCheckmark({}) {
  return (
    <div className="relative w-full h-full">
      <Circle
        className="absolute top-0 left-0 w-full h-full"
        color="green"
        fill="green"
      />
      <Check
        className="absolute top-0 left-0 w-full h-full p-1"
        color="white"
        strokeWidth={4}
      />
    </div>
  )
}
