'use client'

import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Minus, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function CartPage() {
  const [mounted, setMounted] = useState(false)
  const { items, updateQuantity, removeItem, getTotal } = useCartStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="container mx-auto p-4 py-8">Cargando carrito...</div>
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto p-4 py-16 text-center max-w-md">
        <div className="bg-muted p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <ShoppingCartIcon className="w-12 h-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mb-8">Parece que todavía no agregaste nada al carrito. ¡Explorá nuestros productos!</p>
        <Link href="/productos">
          <Button size="lg" className="w-full">Ir al Catálogo</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tu Carrito</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex gap-4 items-center">
                <div className="relative w-20 h-20 bg-muted rounded overflow-hidden shrink-0">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-secondary">Sin imagen</div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="font-bold">${item.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeItem(item.id)}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="w-full lg:w-80 shrink-0">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Resumen de compra</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${getTotal()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-4 border-t">
                  <span>Total</span>
                  <span>${getTotal()}</span>
                </div>
              </div>
              <Link href="/checkout">
                <Button size="lg" className="w-full">Continuar compra</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ShoppingCartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  )
}