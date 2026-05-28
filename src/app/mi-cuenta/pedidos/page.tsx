import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Mis pedidos' }

import { logout } from '@/app/profile/actions'
import { Package, MapPin, ShoppingBag, LogOut } from 'lucide-react'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = {
  pending:   'Pendiente',
  paid:      'Pagado',
  preparing: 'En preparación',
  shipped:   'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const STATUS_COLOR: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  paid:      'bg-green-100 text-green-800',
  preparing: 'bg-blue-100 text-blue-800',
  shipped:   'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const STATUS_STEP: Record<string, number> = {
  pending: 1, paid: 2, preparing: 3, shipped: 4, delivered: 5, cancelled: 0,
}

const STEPS = ['Recibido', 'Pagado', 'En preparación', 'Enviado', 'Entregado']

export default async function MisPedidosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('orders')
      .select(`
        id, status, total_amount, shipping_cost, shipping_address, province, created_at,
        order_items ( id, quantity, unit_price, products ( name, image_url ) )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  if (profile?.role === 'admin') redirect('/admin')

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Mi cuenta'
  const initials = profile?.first_name
    ? (profile.first_name[0] + (profile.last_name?.[0] ?? '')).toUpperCase()
    : user.email?.slice(0, 2).toUpperCase() ?? 'U'

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">

      {/* Header de perfil */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0">
            {initials}
          </div>
          <div className="space-y-0.5">
            <p className="text-xl font-bold leading-tight">{fullName}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {profile?.phone && (
              <p className="text-sm text-muted-foreground">{profile.phone}</p>
            )}
            {profile?.address && (
              <p className="text-sm text-muted-foreground">{profile.address}</p>
            )}
          </div>
        </div>
        <form action={logout}>
          <Button variant="outline" size="sm" className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </Button>
        </form>
      </div>

      {/* Mis pedidos */}
      <div className="flex items-center gap-2 mb-5">
        <ShoppingBag className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">Mis pedidos</h2>
        {orders && orders.length > 0 && (
          <span className="ml-auto text-sm text-muted-foreground">{orders.length} pedido{orders.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {(!orders || orders.length === 0) ? (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border bg-secondary/50">
          <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-muted-foreground">Todavía no realizaste ningún pedido</p>
          <p className="text-sm text-muted-foreground mt-1 mb-5">Explorá el catálogo y encontrá lo que buscás</p>
          <Link href="/productos">
            <Button>Ver catálogo</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const step = STATUS_STEP[order.status] ?? 0
            const isCancelled = order.status === 'cancelled'
            const subtotal = Number(order.total_amount) - Number(order.shipping_cost ?? 0)

            return (
              <div key={order.id} className="rounded-2xl border border-border bg-background overflow-hidden">

                {/* Header de la orden */}
                <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-border bg-secondary/40">
                  <div>
                    <p className="text-xs text-muted-foreground">Pedido</p>
                    <p className="font-mono font-bold text-sm">#{order.id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs text-muted-foreground">Fecha</p>
                    <p className="text-sm font-medium">
                      {new Date(order.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    <p className="font-bold text-base">${Number(order.total_amount).toLocaleString('es-AR')}</p>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[order.status] ?? 'bg-muted text-muted-foreground'}`}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </div>
                </div>

                {/* Barra de progreso */}
                {!isCancelled && (
                  <div className="px-5 py-3 border-b border-border">
                    <div className="flex items-center gap-0">
                      {STEPS.map((label, i) => {
                        const done = step > i
                        const current = step === i + 1
                        return (
                          <div key={label} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full flex items-center">
                              {i > 0 && (
                                <div className={`flex-1 h-0.5 ${done || current ? 'bg-primary' : 'bg-border'}`} />
                              )}
                              <div className={`w-3 h-3 rounded-full shrink-0 ${
                                done ? 'bg-primary' : current ? 'bg-primary ring-2 ring-primary/30' : 'bg-border'
                              }`} />
                              {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 ${done ? 'bg-primary' : 'bg-border'}`} />
                              )}
                            </div>
                            <span className={`text-[10px] text-center leading-tight hidden sm:block ${
                              current ? 'text-primary font-semibold' : done ? 'text-muted-foreground' : 'text-border'
                            }`}>
                              {label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="divide-y divide-border">
                  {(order.order_items ?? []).map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary shrink-0 overflow-hidden">
                        {item.products?.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.products.image_url} alt={item.products?.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.products?.name ?? 'Producto eliminado'}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity} × ${Number(item.unit_price).toLocaleString('es-AR')}</p>
                      </div>
                      <p className="text-sm font-semibold shrink-0">
                        ${(item.quantity * item.unit_price).toLocaleString('es-AR')}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Footer: desglose + dirección */}
                <div className="px-5 py-3 bg-secondary/30 border-t border-border space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Envío{order.province ? ` · ${order.province}` : ''}</span>
                    <span>
                      {Number(order.shipping_cost) === 0 ? 'Gratis' : `$${Number(order.shipping_cost).toLocaleString('es-AR')}`}
                    </span>
                  </div>
                  {order.shipping_address && (
                    <div className="flex items-start gap-1.5 pt-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">{order.shipping_address}</p>
                    </div>
                  )}
                </div>

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
