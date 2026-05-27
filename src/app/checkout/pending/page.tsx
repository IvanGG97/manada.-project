import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'
import { ClearCartOnMount } from '@/components/cart/ClearCartOnMount'

export default async function CheckoutPendingPage(props: {
  searchParams: Promise<{ external_reference?: string }>
}) {
  const searchParams = await props.searchParams
  const orderId = searchParams.external_reference

  return (
    <div className="container mx-auto px-4 py-20 max-w-md text-center">
      <ClearCartOnMount />
      <Clock className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold mb-3">Pago pendiente</h1>
      <p className="text-muted-foreground mb-2">
        Tu pago está siendo procesado. Te notificaremos cuando se confirme.
      </p>
      {orderId && (
        <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-1 rounded-md inline-block mt-2">
          Orden #{orderId.slice(-8).toUpperCase()}
        </p>
      )}
      <div className="flex flex-col gap-3 mt-10">
        <Link href="/profile">
          <Button className="w-full">Ver mis pedidos</Button>
        </Link>
        <Link href="/productos">
          <Button variant="outline" className="w-full">Seguir comprando</Button>
        </Link>
      </div>
    </div>
  )
}
