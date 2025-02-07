import { FormField } from "@/components/ui/form"
import { Ellipsis } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function ContractDropdownButton({
  form,
  deployerIndex,
  contractIndex,
  onToggle,
}: {
  form: any
  deployerIndex: number
  contractIndex: number
  onToggle: (value: boolean) => Promise<void>
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("click", handleClickOutside)

    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [])

  return (
    <FormField
      control={form.control}
      name={`deployers.${deployerIndex}.contracts.${contractIndex}.excluded`}
      render={({ field: excludedField }) => (
        <div className="relative">
          <button
            type="button"
            ref={buttonRef}
            className="flex items-center"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Ellipsis width={16} height={16} />
          </button>
          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute mt-1 -right-1 w-48 bg-white border rounded-md shadow-lg z-[1]"
            >
              <ul className="py-1 text-sm text-gray-700">
                <li>
                  <button
                    type="button"
                    className="block w-full py-2 hover:bg-gray-100"
                    onClick={async () => {
                      setIsDropdownOpen(false)

                      await onToggle(!excludedField.value)

                      //replace this with call to database
                      excludedField.onChange(!excludedField.value)
                    }}
                  >
                    {excludedField.value
                      ? "Include in project"
                      : "Exclude from project"}
                  </button>
                </li>
                <li>
                  {/* TODO:// Complete functionality */}
                  {/* <button className="block w-full py-2 hover:bg-gray-100">
                  Copy address
                </button> */}
                </li>
                <li>
                  {/* TODO:// Complete functionality */}
                  {/* <button className="block w-full py-2 hover:bg-gray-100">
                  Edit name
                </button> */}
                </li>
                <li>
                  {/* TODO:// Complete functionality */}
                  {/* <button className="block w-full py-2 hover:bg-gray-100">
                  View attestation
                </button> */}
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    />
  )
}
