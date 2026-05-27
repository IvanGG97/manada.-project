'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { Search, X } from 'lucide-react'

export interface FilterField {
  key: string
  type: 'text' | 'select' | 'date'
  label: string
  placeholder?: string
  options?: { value: string; label: string }[]
}

interface FilterBarProps {
  fields: FilterField[]
}

function useUrlParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  function clearAll(keys: string[]) {
    const params = new URLSearchParams(searchParams.toString())
    keys.forEach((k) => params.delete(k))
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  return { searchParams, setParam, clearAll }
}

function TextField({
  field,
  initialValue,
  onChange,
}: {
  field: FilterField
  initialValue: string
  onChange: (value: string) => void
}) {
  const [value, setValue] = useState(initialValue)

  // Sync si el URL cambia externamente
  useEffect(() => { setValue(initialValue) }, [initialValue])

  useEffect(() => {
    const timer = setTimeout(() => onChange(value), 400)
    return () => clearTimeout(timer)
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative flex-1 min-w-36">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={field.placeholder ?? `Buscar por ${field.label.toLowerCase()}...`}
        className="h-8 w-full rounded-md border bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  )
}

export function FilterBar({ fields }: FilterBarProps) {
  const { searchParams, setParam, clearAll } = useUrlParams()
  const keys = fields.map((f) => f.key)
  const activeCount = keys.filter((k) => searchParams.get(k)).length

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {fields.map((field) => {
        const current = searchParams.get(field.key) ?? ''

        if (field.type === 'text') {
          return (
            <TextField
              key={field.key}
              field={field}
              initialValue={current}
              onChange={(v) => setParam(field.key, v)}
            />
          )
        }

        if (field.type === 'select') {
          return (
            <select
              key={field.key}
              value={current}
              onChange={(e) => setParam(field.key, e.target.value)}
              className="h-8 rounded-md border bg-background px-3 text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            >
              <option value="">{field.label}</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )
        }

        if (field.type === 'date') {
          return (
            <div key={field.key} className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground whitespace-nowrap">{field.label}</span>
              <input
                type="date"
                value={current}
                onChange={(e) => setParam(field.key, e.target.value)}
                className="h-8 rounded-md border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )
        }

        return null
      })}

      {activeCount > 0 && (
        <button
          onClick={() => clearAll(keys)}
          className="flex items-center gap-1 h-8 px-2.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border"
        >
          <X className="h-3 w-3" />
          Limpiar ({activeCount})
        </button>
      )}
    </div>
  )
}
