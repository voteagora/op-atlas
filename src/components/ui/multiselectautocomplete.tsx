"use client"

import { X } from "lucide-react"
import * as React from "react"
import Image from "next/image"

import clsx from "clsx"

import { Badge } from "./badge"
import { Command, CommandGroup, CommandItem, CommandList } from "./command"
import { Input } from "./input"

export type IMultiSelectOptions = Record<"value" | "label" | "image", string>

export function MultiSelect({
  placeholder = "Select an item",
  parentClassName,
  options,
  selectedOptions,
  setSelectedOptions,
}: {
  image?: string
  placeholder?: string
  parentClassName?: string
  options: IMultiSelectOptions[]
  selectedOptions: IMultiSelectOptions[]
  setSelectedOptions: React.Dispatch<
    React.SetStateAction<IMultiSelectOptions[]>
  >
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const [selectables, setSelectable] = React.useState(options)

  const handleUnselect = React.useCallback((item: IMultiSelectOptions) => {
    setSelectedOptions((prev) => prev.filter((s) => s.value !== item.value))
  }, [])

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        inputRef.current?.blur()
      }
    },
    [],
  )

  React.useEffect(() => {
    const filterData = options.filter((item) => !selectedOptions.includes(item))
    if (inputValue === "") {
      setSelectable(filterData)
    } else {
      setSelectable(
        filterData.filter((item) =>
          item.label.toLowerCase().includes(inputValue.toLowerCase()),
        ),
      )
    }
  }, [options, inputValue, selectedOptions])

  return (
    <div className={clsx(parentClassName, "grid w-full items-center ")}>
      <Command className="overflow-visible bg-transparent">
        <Input
          onKeyDown={handleKeyDown}
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={() => setOpen(false)}
          onClick={() => setOpen(true)}
          placeholder={placeholder}
          className="!focus-visible:ring-offset-0"
        />

        <div className="relative mt-2">
          {open ? (
            <div
              onBlur={() => setOpen(false)}
              className="absolute w-full top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in"
            >
              <CommandGroup>
                <CommandList className="gap-3 p-3 bg-white">
                  {selectables.length > 0
                    ? selectables.map((framework) => {
                        return (
                          <CommandItem
                            className="px-3 py-2"
                            key={framework.value}
                            onSelect={() => {
                              setInputValue("")
                              setSelectedOptions((prev) => [...prev, framework])
                              setOpen(false)
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                            }}
                          >
                            <Image
                              src={framework.image}
                              alt={framework.label}
                              width={24}
                              height={24}
                              style={{ marginRight: "8px" }}
                            />

                            {framework.label}
                          </CommandItem>
                        )
                      })
                    : "No options available"}
                </CommandList>
              </CommandGroup>
            </div>
          ) : null}
        </div>
      </Command>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {selectedOptions.map((item) => {
          return (
            <Badge
              key={item.value}
              className="py-2 px-3 gap-1 rounded-md"
              variant="secondary"
            >
              <Image src={item.image} alt={item.label} width={24} height={24} />
              {item.label}
              <button
                className="ring-offset-background rounded-full outline-none"
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onClick={() => handleUnselect(item)}
              >
                <X className="ml-1 h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          )
        })}
      </div>
    </div>
  )
}
