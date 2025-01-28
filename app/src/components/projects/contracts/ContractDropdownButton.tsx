import { FormField } from "@/components/ui/form"
import { Ellipsis } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function ContractDropdownButton({
  form,
  field,
  index,
}: {
  form: any
  field: any
  index: number
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
    <button
      type="button"
      ref={buttonRef}
      className="flex items-center"
      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
    >
      <Ellipsis width={16} height={16} />
      {isDropdownOpen && (
        <div ref={dropdownRef} className="relative inline-block text-left">
          <div className="absolute mt-2 -right-1 w-48 bg-white border rounded-md shadow-lg">
            <ul className="py-1 text-sm text-gray-700">
              <li>
                <button
                  type="button"
                  className="block w-full py-2 hover:bg-gray-100"
                  onClick={() => field.onChange(!field.value)}
                >
                  {field.value ? "Include in project" : "Exclude from project"}
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
        </div>
      )}
    </button>
  )
}
