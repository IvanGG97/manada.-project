'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ChevronDown, X, Menu } from 'lucide-react'

interface Category { id: string; name: string }

interface NavMenuProps {
  categories: Category[]
}

export function NavMenu({ categories }: NavMenuProps) {
  const [catOpen, setCatOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Cerrar dropdown al navegar
  useEffect(() => { setCatOpen(false); setMobileOpen(false) }, [pathname])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setCatOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="flex items-center">
      {/* ── Desktop ── */}
      <div className="hidden md:flex items-center gap-5">
        <Link
          href="/productos"
          className="text-sm font-medium hover:text-primary transition-colors"
        >
          Todos los productos
        </Link>

        {categories.length > 0 && (
          <div ref={dropRef} className="relative">
            <button
              onClick={() => setCatOpen((o) => !o)}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Categorías
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {catOpen && (
              <div className="absolute top-full left-0 mt-2 min-w-44 rounded-lg border bg-background shadow-lg z-50 py-1 animate-in fade-in-0 zoom-in-95 duration-100">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/productos?categoria=${cat.id}`}
                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Mobile hamburger ── */}
      <button
        className="md:hidden flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted transition-colors"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-background z-50 flex flex-col shadow-xl md:hidden animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                <Image src="/Logo.jpeg" alt="MaNaDa" width={30} height={30} className="rounded-lg object-cover" />
                <span className="text-lg font-bold tracking-tight">MaNaDa</span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              <Link
                href="/productos"
                className="block px-3 py-2.5 rounded-md text-sm font-medium hover:bg-muted transition-colors"
              >
                Todos los productos
              </Link>

              {categories.length > 0 && (
                <>
                  <p className="px-3 pt-4 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Categorías
                  </p>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/productos?categoria=${cat.id}`}
                      className="block px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </div>
  )
}
