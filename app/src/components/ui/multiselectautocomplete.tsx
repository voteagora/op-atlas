"use client"

import clsx from "clsx"
import { X } from "lucide-react"
import { useCallback, useRef, useState } from "react"

import { UserAvatarSmall } from "../common/UserAvatarSmall"
import { Badge } from "./badge"
import { Command, CommandGroup, CommandItem, CommandList } from "./command"
import { Input } from "./input"

export type IMultiSelectOptions = {
  value: string | number
  label: string
  farcasterId: string | null
  image?: string | null
}

interface MultiSelectAutocompleteProps {
  placeholder?: string
  parentClassName?: string
  options: IMultiSelectOptions[]
  inputValue: string
  setInputValue: React.Dispatch<React.SetStateAction<string>>
  selectedOptions: IMultiSelectOptions[]
  onSelect?: (option: IMultiSelectOptions) => void
  setSelectedOptions: React.Dispatch<
    React.SetStateAction<IMultiSelectOptions[]>
  >
}

export function MultiSelect({
  placeholder = "Select an item",
  parentClassName,
  options,
  inputValue,
  setInputValue,
  selectedOptions,
  setSelectedOptions,
  onSelect,
}: MultiSelectAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [, setOpen] = useState(false)


  const handleUnselect = useCallback(
    (item: IMultiSelectOptions) => {
      setSelectedOptions((prev) => prev.filter((s) => s.value !== item.value))
    },
    [setSelectedOptions],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        inputRef.current?.blur()
      }
    },
    [],
  )

  return (
    <div className={clsx(parentClassName, "grid w-full items-center")}>
      <Command className="overflow-visible bg-transparent">
        <Input
          onKeyDown={handleKeyDown}
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={() => setOpen(false)}
          onClick={() => setOpen(true)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="!focus-visible:ring-0"
        />

        <div className="relative">
          {options.length > 0 ? (
            <div
              onBlur={() => setOpen(false)}
              className="absolute w-full top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in"
            >
              <CommandGroup>
                <CommandList className="p-3 bg-white">
                  {options.length > 0 ? (
                    options.map((option, idx) => {
                      return (
                        <CommandItem
                          className="h-10 px-3 py-2"
                          key={idx}
                          onSelect={() => {
                            setInputValue("")
                            setSelectedOptions((prev) => [...prev, option])
                            setOpen(false)
                            onSelect?.(option)
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                        >
                          <div className="flex flex-row items-center gap-2">
                            <UserAvatarSmall imageUrl={option.image} />
                            {option.label}
                          </div>
                        </CommandItem>
                      )
                    })
                  ) : (
                    <p className="text-sm text-center text-secondary-foreground">
                      No users found
                    </p>
                  )}
                </CommandList>
              </CommandGroup>
            </div>
          ) : null}
        </div>
      </Command>

      {selectedOptions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 mt-2.5">
          {selectedOptions.map((item) => {
            return (
              <Badge
                key={item.value}
                className="py-2 px-3 rounded-md shrink-0 flex flex-row items-center gap-2"
                variant="secondary"
              >

                <div className="flex flex-row items-center gap-2">
                  <UserAvatarSmall imageUrl={item.image} />
                  <p className="text-sm text-secondary-foreground">
                    {item.label}
                  </p>
                </div>
                <button
                  className="ring-offset-background rounded-full outline-none ml-2"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={() => handleUnselect(item)}
                >
                  <X
                    size={16}
                    className="text-secondary-foreground hover:text-foreground"
                  />
                </button>
              </Badge>
            )
          })}
        </div>
      ) : null
      }
    </div >
  )
}
