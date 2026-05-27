'use client'

import { useState, useRef, useEffect, useId } from 'react'
import { Search, X, Check } from 'lucide-react'

export interface ComboboxProduct {
  id: string
  name: string
  stock: number
}

interface ProductComboboxProps {
  products: ComboboxProduct[]
  onSelect: (product: ComboboxProduct | null) => void
  placeholder?: string
  name?: string
}

export function ProductCombobox({
  products,
  onSelect,
  placeholder = 'Buscar producto por nombre...',
  name = 'product_id',
}: ProductComboboxProps) {
  const id = useId()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<ComboboxProduct | null>(null)
  const [highlighted, setHighlighted] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  )

  function selectProduct(product: ComboboxProduct) {
    setSelected(product)
    setQuery(product.name)
    setOpen(false)
    setHighlighted(-1)
    onSelect(product)
  }

  function clearSelection() {
    setSelected(null)
    setQuery('')
    setOpen(false)
    setHighlighted(-1)
    onSelect(null)
    inputRef.current?.focus()
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    setOpen(true)
    setHighlighted(-1)
    if (!val) {
      setSelected(null)
      onSelect(null)
    } else if (selected && selected.name !== val) {
      setSelected(null)
      onSelect(null)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') setOpen(true)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlighted >= 0 && filtered[highlighted]) {
        selectProduct(filtered[highlighted])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setHighlighted(-1)
    }
  }

  // Scroll al item destacado
  useEffect(() => {
    if (highlighted >= 0 && listRef.current) {
      const item = listRef.current.children[highlighted] as HTMLElement
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlighted])

  // Cerrar al hacer click fuera
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        // Si hay texto pero no hay selección, limpiar
        if (!selected) setQuery('')
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [selected])

  return (
    <div ref={containerRef} className="relative">
      {/* Input oculto para el FormData */}
      <input type="hidden" name={name} value={selected?.id ?? ''} />

      {/* Input visible */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          id={id}
          type="text"
          autoComplete="off"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-9 w-full rounded-md border bg-background pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
        />
        {(query || selected) && (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-background shadow-lg"
          role="listbox"
        >
          {filtered.length > 0 ? (
            filtered.map((product, i) => (
              <button
                key={product.id}
                type="button"
                role="option"
                aria-selected={selected?.id === product.id}
                onMouseDown={(e) => {
                  e.preventDefault() // evita que el blur del input cierre antes
                  selectProduct(product)
                }}
                onMouseEnter={() => setHighlighted(i)}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                  i === highlighted ? 'bg-muted' : 'hover:bg-muted/60'
                }`}
              >
                <span className={selected?.id === product.id ? 'font-medium' : ''}>
                  {product.name}
                </span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={product.stock === 0 ? 'text-red-500' : ''}>
                    stock: {product.stock}
                  </span>
                  {selected?.id === product.id && (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  )}
                </div>
              </button>
            ))
          ) : (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              No se encontraron productos
            </p>
          )}
        </div>
      )}
    </div>
  )
}
