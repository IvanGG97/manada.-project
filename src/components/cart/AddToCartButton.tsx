'use client'

import { useCartStore } from '@/store/cart'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    price: number
    image_url: string | null
    stock: number
  }
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem)

  return (
    <Button 
      size="lg" 
      className="w-full md:w-auto gap-2" 
      disabled={product.stock === 0}
      onClick={() => addItem(product)}
    >
      <ShoppingCart className="h-5 w-5" />
      {product.stock === 0 ? 'Sin stock' : 'Agregar al Carrito'}
    </Button>
  )
}