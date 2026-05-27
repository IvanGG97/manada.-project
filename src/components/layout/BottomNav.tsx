'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutGrid, ShoppingCart, User } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useEffect, useState } from 'react'

const TABS = [
  { href: '/',          label: 'Inicio',    icon: Home },
  { href: '/productos', label: 'Catálogo',  icon: LayoutGrid },
  { href: '/cart',      label: 'Carrito',   icon: ShoppingCart },
  { href: '/mi-cuenta', label: 'Mi cuenta', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const itemCount = useCartStore((s) => s.getItemCount())

  useEffect(() => { setMounted(true) }, [])

  if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/register') return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-stretch h-16">
        {TABS.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 transition-transform duration-150 ${isActive ? 'scale-110' : ''}`} />
                {href === '/cart' && mounted && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 leading-none">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] leading-none ${isActive ? 'font-semibold' : ''}`}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
