'use client'

import { useCartStore } from '@/store/cart'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export function CartIcon() {
  const [mounted, setMounted] = useState(false)
  const itemCount = useCartStore((state) => state.getItemCount())

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Link href="/cart">
      <Button variant="ghost" size="icon" aria-label="Carrito" className="relative">
        <ShoppingCart className="h-5 w-5" />
        {mounted && itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </Button>
    </Link>
  )
}