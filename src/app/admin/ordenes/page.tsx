import { createClient } from '@/lib/supabase/server'
import { updateOrderStatus } from './actions'
import { FilterBar } from '@/components/admin/FilterBar'
import { Pagination } from '@/components/admin/Pagination'
import { SubmitButton } from '@/components/ui/SubmitButton'
import Link from 'next/link'
import Image from 'next/image'
import { Printer } from 'lucide-react'
import { Suspense } from 'react'

const PER_PAGE = 20

const STATUS_OPTIONS = [
  { value: 'pending',   label: 'Pendiente' },
  { value: 'paid',      label: 'Pagado' },
  { value: 'preparing', label: 'En preparación' },
  { value: 'shipped',   label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
]

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  paid:      'bg-green-100 text-green-800',
  preparing: 'bg-blue-100 text-blue-800',
  shipped:   'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const NON_REVERTIBLE = new Set(['paid', 'preparing', 'shipped', 'delivered'])

function getAllowedStatuses(currentStatus: string) {
  if (NON_REVERTIBLE.has(currentStatus)) {
    return STATUS_OPTIONS.filter(opt => opt.value !== 'pending')
  }
  return STATUS_OPTIONS
}

export default async function AdminOrdenesPage(props: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await props.searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10))
  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select('*, profiles(first_name, last_name, phone), order_items(id, quantity, unit_price, products(name, image_url))', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)

  if (sp.estado) query = query.eq('status', sp.estado)
  if (sp.desde) query = query.gte('created_at', sp.desde)
  if (sp.hasta) query = query.lte('created_at', sp.hasta + 'T23:59:59')
  if (sp.cliente) query = query.ilike('shipping_address', `%${sp.cliente}%`)

  const { data: orders, count } = await query

  const { page: _p, ...filterParams } = sp

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Órdenes</h1>

      <Suspense>
        <FilterBar
          fields={[
            { key: 'cliente', type: 'text', label: 'Cliente / dirección', placeholder: 'Buscar...' },
            { key: 'estado', type: 'select', label: 'Estado', options: STATUS_OPTIONS },
            { key: 'desde', type: 'date', label: 'Desde' },
            { key: 'hasta', type: 'date', label: 'Hasta' },
          ]}
        />
      </Suspense>

      {(!orders || orders.length === 0) ? (
        <div className="text-center py-16 bg-background rounded-lg border text-muted-foreground">
          {Object.keys(filterParams).length > 0 ? 'No se encontraron órdenes con esos filtros.' : 'No hay órdenes todavía.'}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => {
              const allowedStatuses = getAllowedStatuses(order.status)
              return (
                <div key={order.id} className="bg-background rounded-lg border overflow-hidden">
                  {/* Header — mobile: stacked, desktop: horizontal */}
                  <div className="p-4 border-b bg-muted/30 space-y-2">
                    {/* Row 1: ID + Amount */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-semibold">#{order.id.slice(-8).toUpperCase()}</span>
                      <span className="font-bold text-base shrink-0">${Number(order.total_amount).toLocaleString('es-AR')}</span>
                    </div>
                    {/* Row 2: Client · Phone · Date · Address */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {[order.profiles?.first_name, order.profiles?.last_name].filter(Boolean).join(' ') || 'Cliente'}
                      </span>
                      {order.profiles?.phone && (
                        <>
                          <span>·</span>
                          <span>{order.profiles.phone}</span>
                        </>
                      )}
                      <span>·</span>
                      <span>{new Date(order.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                      {order.shipping_address && (
                        <>
                          <span>·</span>
                          <span className="truncate max-w-[200px]">{order.shipping_address}</span>
                        </>
                      )}
                    </div>
                    {/* Row 3: Status form + print */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <form action={updateOrderStatus} className="flex items-center gap-2 flex-1 min-w-0">
                        <input type="hidden" name="id" value={order.id} />
                        <select
                          name="status"
                          defaultValue={order.status}
                          className={`flex-1 min-w-0 text-xs px-2.5 py-1.5 rounded-full border-0 font-medium focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer ${STATUS_COLOR[order.status] ?? 'bg-muted'}`}
                        >
                          {allowedStatuses.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <SubmitButton size="sm" variant="outline" className="h-7 text-xs px-3 shrink-0">OK</SubmitButton>
                      </form>
                      <Link
                        href={`/admin/ordenes/${order.id}/imprimir`}
                        target="_blank"
                        className="flex items-center justify-center h-7 w-7 text-muted-foreground hover:text-foreground transition-colors border rounded shrink-0"
                        title="Imprimir"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                  <div className="divide-y">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between px-4 py-2.5 text-sm gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.products?.image_url ? (
                            <Image
                              src={item.products.image_url}
                              alt=""
                              width={36}
                              height={36}
                              className="rounded object-cover shrink-0 border"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded border bg-muted shrink-0" />
                          )}
                          <div className="min-w-0">
                            <span className="font-medium truncate block">{item.products?.name ?? 'Producto eliminado'}</span>
                            <span className="text-xs text-muted-foreground">{item.quantity}× unidad{item.quantity !== 1 ? 'es' : ''}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 text-muted-foreground text-xs">
                          <span className="hidden sm:inline">${Number(item.unit_price).toLocaleString('es-AR')} c/u</span>
                          <span className="font-semibold text-foreground">
                            ${(item.quantity * item.unit_price).toLocaleString('es-AR')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <Pagination page={page} total={count ?? 0} perPage={PER_PAGE} searchParams={filterParams} />
        </>
      )}
    </div>
  )
}
