'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Search, X, Loader2 } from 'lucide-react'

interface Suggestion {
  id: string
  name: string
  slug: string
  image_url: string | null
  price: number
}

export function ProductSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); setLoading(false); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/productos/buscar?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setSuggestions(data)
      setOpen(true)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, fetchSuggestions])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setOpen(false)
    const params = new URLSearchParams(searchParams.toString())
    if (query.trim()) {
      params.set('q', query.trim())
    } else {
      params.delete('q')
    }
    params.delete('page')
    router.push(`/productos?${params.toString()}`)
  }

  function handleSelect(slug: string) {
    setOpen(false)
    setQuery('')
    router.push(`/productos/${slug}`)
  }

  function handleClear() {
    setQuery('')
    setSuggestions([])
    setOpen(false)
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    params.delete('page')
    router.push(`/productos?${params.toString()}`)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Buscar productos..."
          className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
        {!loading && query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full mt-1 w-full z-50 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelect(s.slug)}
              className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-muted transition-colors text-left"
            >
              <div className="relative h-10 w-10 shrink-0 rounded overflow-hidden bg-muted border">
                {s.image_url ? (
                  <Image src={s.image_url} alt={s.name} fill className="object-cover" sizes="40px" />
                ) : (
                  <div className="w-full h-full bg-secondary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground">${Number(s.price).toLocaleString('es-AR')}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && !loading && query.length >= 2 && suggestions.length === 0 && (
        <div className="absolute top-full mt-1 w-full z-50 bg-background border border-border rounded-lg shadow-lg px-4 py-3 text-sm text-muted-foreground">
          No se encontraron productos
        </div>
      )}
    </div>
  )
}
