"use client"

import * as React from "react"
import { ChevronDownIcon, CheckIcon, XIcon, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type SearchSelectProps = {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  emptyStateText?: string
}

export function SearchSelect({ options, value, onChange, placeholder = "Select...", className, emptyStateText = "No results" }: SearchSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const filtered = React.useMemo(() => {
    if (!query.trim()) return options
    const q = query.toLowerCase()
    return options.filter((opt) => opt.toLowerCase().includes(q))
  }, [options, query])

  const selectedLabel = value || ""

  return (
    <div className={cn("relative", className)}>
      <DropdownMenu open={open} onOpenChange={(o)=>{ setOpen(o); if (!o) setQuery("") }}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between h-10 px-3"
          >
            <span className={cn("truncate text-left", !selectedLabel && "text-muted-foreground")}>{selectedLabel || placeholder}</span>
            <ChevronDownIcon className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] p-0">
          <div className="p-2 border-b">
            <Input
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
              placeholder="Search..."
              className="h-9"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">{emptyStateText}</div>
            ) : (
              filtered.map((opt) => (
                <DropdownMenuItem key={opt} onSelect={(e)=>{ e.preventDefault(); onChange(opt); setOpen(false); }} className="flex items-center justify-between">
                  <span className="truncate pr-2">{opt}</span>
                  {value === opt && <CheckIcon className="h-4 w-4" />}
                </DropdownMenuItem>
              ))
            )}
          </div>
          {value && (
            <div className="p-2 border-t">
              <Button type="button" variant="ghost" size="sm" className="w-full justify-center" onClick={()=>{ onChange(""); setOpen(false); }}>
                <XIcon className="h-4 w-4 mr-2" /> Clear selection
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}


