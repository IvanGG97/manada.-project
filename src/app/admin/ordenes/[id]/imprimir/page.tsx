import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PrintButton } from '@/components/admin/PrintButton'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

const STATUS_LABEL: Record<string, string> = {
  pending:   'Pendiente de pago',
  paid:      'Pagado',
  preparing: 'En preparación',
  shipped:   'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

export default async function ImprimirOrdenPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      profiles(first_name, last_name),
      order_items(
        id,
        quantity,
        unit_price,
        products(name)
      )
    `)
    .eq('id', id)
    .single()

  if (!order) notFound()

  const shortId = order.id.slice(-8).toUpperCase()
  const fecha = new Date(order.created_at).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
  const customerName = [order.profiles?.first_name, order.profiles?.last_name]
    .filter(Boolean).join(' ') || 'Cliente'

  return (
    <>
      {/* Estilos de impresión */}
      <style>{`
        @media print {
          * { visibility: hidden !important; }
          #resumen-orden, #resumen-orden * { visibility: visible !important; }
          #resumen-orden { position: fixed; inset: 0; }
        }
      `}</style>

      {/* Controles (no se imprimen) */}
      <div className="flex items-center gap-3 mb-6 print:hidden">
        <Link
          href="/admin/ordenes"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a órdenes
        </Link>
        <div className="ml-auto">
          <PrintButton />
        </div>
      </div>

      {/* Resumen imprimible */}
      <div
        id="resumen-orden"
        className="mx-auto max-w-sm bg-white text-black p-6 border rounded-lg font-mono text-sm"
      >
        {/* Encabezado */}
        <div className="text-center border-b border-dashed pb-4 mb-4">
          <p className="text-2xl font-bold tracking-widest">MANADA</p>
          <p className="text-xs text-gray-500 mt-0.5">Resumen de pedido</p>
        </div>

        {/* Info del pedido */}
        <div className="space-y-1 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Pedido</span>
            <span className="font-bold">#{shortId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Fecha</span>
            <span>{fecha}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Estado</span>
            <span className="font-medium">{STATUS_LABEL[order.status] ?? order.status}</span>
          </div>
        </div>

        {/* Cliente */}
        <div className="border-t border-dashed pt-4 mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Cliente</p>
          <p className="font-semibold">{customerName}</p>
          {order.shipping_address && (
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{order.shipping_address}</p>
          )}
        </div>

        {/* Productos */}
        <div className="border-t border-dashed pt-4 mb-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Productos</p>
          <div className="space-y-2">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{item.quantity}×</span>{' '}
                  <span className="break-words">{item.products?.name ?? 'Producto'}</span>
                </div>
                <span className="shrink-0 text-right">
                  ${(item.quantity * item.unit_price).toLocaleString('es-AR')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-dashed pt-4 mb-4">
          <div className="flex justify-between font-bold text-base">
            <span>TOTAL</span>
            <span>${Number(order.total_amount).toLocaleString('es-AR')}</span>
          </div>
        </div>

        {/* Pie */}
        <div className="border-t border-dashed pt-4 text-center text-xs text-gray-400">
          <p>¡Gracias por tu compra!</p>
          <p className="mt-0.5">manada.com.ar</p>
        </div>
      </div>
    </>
  )
}
