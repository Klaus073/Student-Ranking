"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"

interface MultiSelectProps {
  options: string[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option))
    } else {
      onChange([...value, option])
    }
  }

  const handleRemove = (option: string) => {
    onChange(value.filter((item) => item !== option))
  }

  return (
    <div className={cn("relative", className)}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-9 px-3 py-2"
          >
            <div className="flex flex-wrap gap-1">
              {value.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                value.map((item) => (
                  <Badge
                    key={item}
                    variant="secondary"
                    className="mr-1 mb-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove(item)
                    }}
                  >
                    {item}
                    <XIcon className="ml-1 h-3 w-3" />
                  </Badge>
                ))
              )}
            </div>
            <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-60 overflow-y-auto">
          {options.map((option) => (
            <DropdownMenuItem
              key={option}
              className="flex items-center gap-2 cursor-pointer"
              onSelect={(e) => {
                e.preventDefault()
                handleSelect(option)
              }}
            >
              <Checkbox
                checked={value.includes(option)}
                onChange={() => handleSelect(option)}
              />
              <span className="flex-1">{option}</span>
              {value.includes(option) && (
                <CheckIcon className="h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 