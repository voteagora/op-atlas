import { FormField } from "@/components/ui/form"
import {
  removeProjectContract,
  removeProjectContracts,
  removeProjectContractsByDeployer,
} from "@/db/projects"
import { useProjectFromPath } from "@/hooks/useProjectFromPath"
import { Ellipsis } from "lucide-react"
import { project } from "ramda"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

export function DeployerDropdownButton({
  form,
  deployerIndex,
  onToggle,
}: {
  form: any
  deployerIndex: number
  onToggle: (value: boolean) => Promise<void>
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const theForm = form.watch("deployers")

  const projectId = useProjectFromPath()

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
      name={`deployers.${deployerIndex}`}
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
                    className="block w-full py-2 hover:bg-gray-100 text-left p-2"
                    onClick={async () => {
                      setIsDropdownOpen(false)

                      toast.info("Removing Deployer...")

                      try {
                        await removeProjectContractsByDeployer(
                          projectId,
                          theForm[deployerIndex].address,
                        )
                        toast.success("Succesfully removed deployer!")
                      } catch (e) {
                        toast.error(
                          "There was an issue removing the deployer. Please try again in a bit.",
                        )
                      }
                    }}
                  >
                    Remove
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
