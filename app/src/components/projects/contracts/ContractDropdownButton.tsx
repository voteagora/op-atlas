import { FormField } from "@/components/ui/form"
import { Ellipsis } from "lucide-react"
import { useState } from "react"

export function ContractDropdownButton({
  form,
  index,
}: {
  form: any
  index: number
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <button
      type="button"
      className="flex items-center"
      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
    >
      <Ellipsis width={16} height={16} />
      {isDropdownOpen && (
        <div className="relative inline-block text-left">
          <div className="absolute mt-2 -right-1 w-48 bg-white border rounded-md shadow-lg">
            <ul className="py-1 text-sm text-gray-700">
              <li>
                <button
                  type="button"
                  className="block w-full py-2 hover:bg-gray-100"
                  onClick={() =>
                    form.setValue(
                      `contracts.${index}.excluded`,
                      !form.watch(`contracts.${index}.excluded`),
                    )
                  }
                >
                  {form.getValues().contracts[index].excluded
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
        </div>
      )}
    </button>
  )
}
