'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Menu, X, LayoutDashboard, Package, Tag,
  ShoppingBag, TrendingUp, Truck, Wallet,
  MapPin, Percent, ExternalLink, LogOut, Loader2,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { logout } from '@/app/profile/actions'

const STORE_LINKS = [
  { href: '/admin',            label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/productos',  label: 'Productos',   icon: Package },
  { href: '/admin/categorias', label: 'Categorías',  icon: Tag },
  { href: '/admin/ordenes',    label: 'Órdenes',     icon: ShoppingBag },
  { href: '/admin/envios',     label: 'Envíos',      icon: MapPin },
  { href: '/admin/descuentos', label: 'Descuentos',  icon: Percent },
]

const FINANCE_LINKS = [
  { href: '/admin/ventas',  label: 'Ventas',  icon: TrendingUp },
  { href: '/admin/compras', label: 'Compras', icon: Truck },
  { href: '/admin/caja',    label: 'Caja',    icon: Wallet },
]

function LogoutSubmit() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      {pending ? 'Saliendo...' : 'Cerrar sesión'}
    </button>
  )
}

export function AdminMobileBar({ lowStockCount = 0 }: { lowStockCount?: number }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  function isActive(href: string) {
    return href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
  }

  return (
    <>
      {/* Barra superior mobile */}
      <div className="md:hidden sticky top-0 z-30 bg-background border-b flex items-center gap-3 px-4 h-14">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Image src="/Logo.jpeg" alt="MaNaDa" width={28} height={28} className="rounded-lg object-cover" />
        <span className="font-bold text-base">MaNaDa</span>
        <span className="text-xs font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-wider">
          Admin
        </span>
      </div>

      {/* Overlay */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed left-0 top-0 h-full w-64 max-w-[85vw] bg-background z-50 flex flex-col shadow-xl animate-in slide-in-from-left duration-200">

            {/* Header del drawer */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2.5">
                <Image src="/Logo.jpeg" alt="MaNaDa" width={36} height={36} className="rounded-xl object-cover" />
                <div>
                  <p className="font-bold text-sm leading-tight">MaNaDa</p>
                  <p className="text-xs text-muted-foreground">Panel Admin</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Links */}
            <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
              <div className="space-y-1">
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Tienda</p>
                {STORE_LINKS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{label}</span>
                    {href === '/admin/productos' && lowStockCount > 0 && (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                        isActive(href) ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'
                      }`}>{lowStockCount}</span>
                    )}
                  </Link>
                ))}
              </div>

              <div className="space-y-1">
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Finanzas</p>
                {FINANCE_LINKS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                ))}
              </div>
            </nav>

            <div className="p-4 border-t space-y-2">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver tienda
                </Link>
                <ThemeToggle />
              </div>
              <form action={logout} className="w-full">
                <LogoutSubmit />
              </form>
            </div>
          </aside>
        </>
      )}
    </>
  )
}
