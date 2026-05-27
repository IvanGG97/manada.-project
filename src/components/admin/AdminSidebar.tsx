'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Tag, ShoppingBag, TrendingUp, Truck, Wallet, ExternalLink, MapPin, Percent } from 'lucide-react'

const STORE_LINKS = [
  { href: '/admin',              label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/productos',    label: 'Productos',   icon: Package },
  { href: '/admin/categorias',   label: 'Categorías',  icon: Tag },
  { href: '/admin/ordenes',      label: 'Órdenes',     icon: ShoppingBag },
  { href: '/admin/envios',       label: 'Envíos',      icon: MapPin },
  { href: '/admin/descuentos',   label: 'Descuentos',  icon: Percent },
]

const FINANCE_LINKS = [
  { href: '/admin/ventas',  label: 'Ventas',  icon: TrendingUp },
  { href: '/admin/compras', label: 'Compras', icon: Truck },
  { href: '/admin/caja',    label: 'Caja',    icon: Wallet },
]

function NavLink({
  href,
  label,
  icon: Icon,
  badge,
}: {
  href: string
  label: string
  icon: React.ElementType
  badge?: number
}) {
  const pathname = usePathname()
  const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full leading-none ${
          isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'
        }`}>
          {badge}
        </span>
      )}
    </Link>
  )
}

interface AdminSidebarProps {
  lowStockCount?: number
}

export function AdminSidebar({ lowStockCount = 0 }: AdminSidebarProps) {
  return (
    <aside className="w-56 border-r bg-background flex flex-col shrink-0">
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Image
            src="/Logo.jpeg"
            alt="MaNaDa"
            width={40}
            height={40}
            className="rounded-xl object-cover shrink-0"
          />
          <div>
            <p className="text-base font-bold leading-tight">MaNaDa</p>
            <p className="text-xs text-muted-foreground">Panel Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Tienda
          </p>
          {STORE_LINKS.map((link) => (
            <NavLink
              key={link.href}
              {...link}
              badge={link.href === '/admin/productos' ? lowStockCount : undefined}
            />
          ))}
        </div>

        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Finanzas
          </p>
          {FINANCE_LINKS.map((link) => <NavLink key={link.href} {...link} />)}
        </div>
      </nav>

      <div className="p-4 border-t">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Ver tienda
        </Link>
      </div>
    </aside>
  )
}
