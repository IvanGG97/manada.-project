import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'

export default async function CheckoutFailurePage(props: {
  searchParams: Promise<{ external_reference?: string }>
}) {
  const searchParams = await props.searchParams
  const orderId = searchParams.external_reference

  return (
    <div className="container mx-auto px-4 py-20 max-w-md text-center">
      <XCircle className="w-20 h-20 text-destructive mx-auto mb-6" />
      <h1 className="text-3xl font-bold mb-3">Pago rechazado</h1>
      <p className="text-muted-foreground mb-2">
        No pudimos procesar tu pago. Podés intentarlo nuevamente o elegir otro método.
      </p>
      {orderId && (
        <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-1 rounded-md inline-block mt-2">
          Orden #{orderId.slice(-8).toUpperCase()}
        </p>
      )}
      <div className="flex flex-col gap-3 mt-10">
        <Link href="/checkout">
          <Button className="w-full">Reintentar pago</Button>
        </Link>
        <Link href="/cart">
          <Button variant="outline" className="w-full">Volver al carrito</Button>
        </Link>
      </div>
    </div>
  )
}
