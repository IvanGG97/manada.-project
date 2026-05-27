import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  TrendingUp, TrendingDown, ShoppingBag, AlertTriangle,
  Package, Plus, Truck, ReceiptText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

function fmt(n: number) {
  return `$${n.toLocaleString('es-AR')}`
}

function StatCard({
  icon: Icon, label, value, sub, href, color = 'default',
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  href?: string
  color?: 'green' | 'red' | 'orange' | 'blue' | 'default'
}) {
  const colorMap = {
    green:   'border-green-200  bg-green-50   text-green-700',
    red:     'border-red-200    bg-red-50     text-red-700',
    orange:  'border-amber-200  bg-amber-50   text-amber-700',
    blue:    'border-blue-200   bg-blue-50    text-blue-700',
    default: 'border-border     bg-background text-foreground',
  }
  const card = (
    <div className={`rounded-xl border p-5 ${colorMap[color]} ${href ? 'hover:shadow-md transition-shadow' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</span>
        <Icon className="h-4 w-4 opacity-60" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  )
  return href ? <Link href={href}>{card}</Link> : card
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    ventasMes,
    ordersMes,
    comprasMes,
    ordenesPendientes,
    stockData,
    ultimasOrdenes,
    ultimasVentas,
  ] = await Promise.all([
    supabase.from('ventas_presenciales').select('monto').gte('fecha', firstOfMonth),
    supabase.from('orders').select('total_amount').eq('status', 'paid').gte('created_at', firstOfMonth),
    supabase.from('compras').select('monto').gte('fecha', firstOfMonth),
    supabase.from('orders').select('id', { count: 'exact', head: true }).in('status', ['pending', 'paid', 'preparing']),
    supabase.from('products').select('stock, stock_minimo, is_active'),
    supabase.from('orders').select('id, created_at, total_amount, status, profiles(first_name)').order('created_at', { ascending: false }).limit(6),
    supabase.from('ventas_presenciales').select('id, fecha, descripcion, monto, metodo_pago').order('fecha', { ascending: false }).limit(6),
  ])

  const ingresosMes =
    (ventasMes.data ?? []).reduce((s, v) => s + Number(v.monto), 0) +
    (ordersMes.data ?? []).reduce((s, o) => s + Number(o.total_amount), 0)

  const egresosMes = (comprasMes.data ?? []).reduce((s, c) => s + Number(c.monto), 0)

  const activeProducts = stockData.data?.filter((p) => p.is_active) ?? []
  const sinStock = activeProducts.filter((p) => p.stock === 0).length
  const stockBajo = activeProducts.filter((p) => (p.stock_minimo ?? 0) > 0 && p.stock < (p.stock_minimo ?? 0)).length

  const STATUS_LABEL: Record<string, string> = {
    pending: 'Pendiente', paid: 'Pagado', preparing: 'En preparación',
    shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado',
  }
  const STATUS_COLOR: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800', paid: 'bg-green-100 text-green-800',
    preparing: 'bg-blue-100 text-blue-800', shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {now.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Métricas del mes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Ingresos del mes"
          value={fmt(ingresosMes)}
          sub="Ventas presenciales + MercadoPago"
          color="green"
          href="/admin/caja"
        />
        <StatCard
          icon={TrendingDown}
          label="Egresos del mes"
          value={fmt(egresosMes)}
          sub="Compras a proveedores"
          color={egresosMes > ingresosMes ? 'red' : 'default'}
          href="/admin/caja"
        />
        <StatCard
          icon={ShoppingBag}
          label="Órdenes activas"
          value={ordenesPendientes.count ?? 0}
          sub="Pendientes, pagadas o en preparación"
          color={(ordenesPendientes.count ?? 0) > 0 ? 'blue' : 'default'}
          href="/admin/ordenes"
        />
        <StatCard
          icon={AlertTriangle}
          label="Alertas de stock"
          value={sinStock + stockBajo}
          sub={`${sinStock} sin stock · ${stockBajo} bajo mínimo`}
          color={sinStock + stockBajo > 0 ? 'orange' : 'default'}
          href="/admin/productos"
        />
      </div>

      {/* Acciones rápidas */}
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/ventas">
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-3.5 w-3.5" />Nueva venta
          </Button>
        </Link>
        <Link href="/admin/compras">
          <Button variant="outline" size="sm" className="gap-2">
            <Truck className="h-3.5 w-3.5" />Registrar compra
          </Button>
        </Link>
        <Link href="/admin/productos/nuevo">
          <Button variant="outline" size="sm" className="gap-2">
            <Package className="h-3.5 w-3.5" />Nuevo producto
          </Button>
        </Link>
        <Link href="/admin/caja">
          <Button variant="outline" size="sm" className="gap-2">
            <ReceiptText className="h-3.5 w-3.5" />Ver caja
          </Button>
        </Link>
      </div>

      {/* Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Últimas órdenes</h2>
            <Link href="/admin/ordenes" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Ver todas →</Link>
          </div>
          <div className="rounded-lg border bg-background overflow-hidden">
            {(ultimasOrdenes.data ?? []).length === 0 ? (
              <p className="p-6 text-sm text-center text-muted-foreground">No hay órdenes todavía.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {(ultimasOrdenes.data ?? []).map((order) => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs font-semibold">#{order.id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground">{(order.profiles as any)?.first_name ?? 'Cliente'}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status] ?? 'bg-muted'}`}>
                          {STATUS_LABEL[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{fmt(Number(order.total_amount))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Últimas ventas presenciales</h2>
            <Link href="/admin/ventas" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Ver todas →</Link>
          </div>
          <div className="rounded-lg border bg-background overflow-hidden">
            {(ultimasVentas.data ?? []).length === 0 ? (
              <p className="p-6 text-sm text-center text-muted-foreground">No hay ventas registradas.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {(ultimasVentas.data ?? []).map((v) => (
                    <tr key={v.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium leading-tight">{v.descripcion}</p>
                        <p className="text-xs text-muted-foreground capitalize">{v.metodo_pago}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(v.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-green-700">+{fmt(Number(v.monto))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Inventario */}
      <div>
        <h2 className="text-base font-semibold mb-3">Inventario</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border bg-background p-4 text-center">
            <p className="text-2xl font-bold">{activeProducts.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Productos activos</p>
          </div>
          <Link href="/admin/productos?estado=sin-stock" className={`rounded-lg border p-4 text-center ${sinStock > 0 ? 'border-red-200 bg-red-50' : 'bg-background'}`}>
            <p className={`text-2xl font-bold ${sinStock > 0 ? 'text-red-700' : ''}`}>{sinStock}</p>
            <p className={`text-xs mt-1 ${sinStock > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>Sin stock</p>
          </Link>
          <Link href="/admin/productos?estado=stock-bajo" className={`rounded-lg border p-4 text-center ${stockBajo > 0 ? 'border-amber-200 bg-amber-50' : 'bg-background'}`}>
            <p className={`text-2xl font-bold ${stockBajo > 0 ? 'text-amber-700' : ''}`}>{stockBajo}</p>
            <p className={`text-xs mt-1 ${stockBajo > 0 ? 'text-amber-600' : 'text-muted-foreground'}`}>Stock bajo mínimo</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
