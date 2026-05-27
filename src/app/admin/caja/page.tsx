import { createClient } from '@/lib/supabase/server'
import { Banknote, ArrowUpCircle, Smartphone, AlertTriangle } from 'lucide-react'
import { FilterBar } from '@/components/admin/FilterBar'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { Input } from '@/components/ui/input'
import { crearMovimientoCaja } from './actions'
import { Suspense } from 'react'

const METODO_LABEL: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  financiada: 'Financiada',
  mercadopago: 'MercadoPago',
}

function StatCard({
  icon: Icon,
  label,
  amount,
  subtitle,
  color,
}: {
  icon: React.ElementType
  label: string
  amount: number
  subtitle?: string
  color: 'green' | 'blue' | 'red' | 'orange'
}) {
  const colors = {
    green:  'bg-green-50  border-green-200  text-green-700',
    blue:   'bg-blue-50   border-blue-200   text-blue-700',
    red:    'bg-red-50    border-red-200    text-red-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
  }
  return (
    <div className={`rounded-lg border p-5 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold">${amount.toLocaleString('es-AR')}</p>
      {subtitle && <p className="text-xs mt-1 opacity-70">{subtitle}</p>}
    </div>
  )
}

export default async function AdminCajaPage(props: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await props.searchParams
  const supabase = await createClient()

  let ventasQuery = supabase.from('ventas_presenciales').select('*').order('fecha', { ascending: false })
  let comprasQuery = supabase.from('compras').select('*').order('fecha', { ascending: false })

  if (sp.desde) {
    ventasQuery = ventasQuery.gte('fecha', sp.desde)
    comprasQuery = comprasQuery.gte('fecha', sp.desde)
  }
  if (sp.hasta) {
    ventasQuery = ventasQuery.lte('fecha', sp.hasta + 'T23:59:59')
    comprasQuery = comprasQuery.lte('fecha', sp.hasta + 'T23:59:59')
  }
  if (sp.metodo) {
    ventasQuery = ventasQuery.eq('metodo_pago', sp.metodo)
    comprasQuery = comprasQuery.eq('metodo_pago', sp.metodo)
  }

  const [ventasResult, comprasResult, ordersResult] = await Promise.all([
    ventasQuery,
    comprasQuery,
    supabase.from('orders').select('total_amount, created_at').eq('status', 'paid').order('created_at', { ascending: false }),
  ])

  const ventas = ventasResult.data ?? []
  const compras = comprasResult.data ?? []
  const orders = ordersResult.data ?? []

  // Efectivo
  const efectivoIngreso = ventas
    .filter(v => v.metodo_pago === 'efectivo')
    .reduce((sum, v) => sum + Number(v.monto), 0)
  const efectivoEgreso = compras
    .filter(c => c.metodo_pago === 'efectivo')
    .reduce((sum, c) => sum + Number(c.monto), 0)
  const saldoEfectivo = efectivoIngreso - efectivoEgreso

  // Transferencia
  const transferenciaIngreso = ventas
    .filter(v => v.metodo_pago === 'transferencia')
    .reduce((sum, v) => sum + Number(v.monto), 0)
  const transferenciaEgreso = compras
    .filter(c => c.metodo_pago === 'transferencia')
    .reduce((sum, c) => sum + Number(c.monto), 0)
  const saldoTransferencia = transferenciaIngreso - transferenciaEgreso

  // MercadoPago (referencia)
  const totalMP = orders.reduce((sum, o) => sum + Number(o.total_amount), 0)

  // Deuda proveedores
  const deudaProveedores = compras
    .filter(c => c.metodo_pago === 'financiada')
    .reduce((sum, c) => sum + Number(c.monto), 0)

  // Movimientos unificados
  type Movement = {
    id: string
    fecha: string
    tipo: 'venta' | 'compra'
    descripcion: string
    detalle: string | null
    metodo_pago: string
    monto: number
  }

  const movements: Movement[] = [
    ...ventas.map(v => ({
      id: v.id,
      fecha: v.fecha,
      tipo: 'venta' as const,
      descripcion: v.descripcion,
      detalle: v.notas ?? null,
      metodo_pago: v.metodo_pago,
      monto: Number(v.monto),
    })),
    ...compras.map(c => ({
      id: c.id,
      fecha: c.fecha,
      tipo: 'compra' as const,
      descripcion: c.descripcion,
      detalle: [c.proveedor, c.notas].filter(Boolean).join(' · ') || null,
      metodo_pago: c.metodo_pago,
      monto: Number(c.monto),
    })),
  ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  const filteredMovements = sp.tipo
    ? movements.filter((m) => m.tipo === sp.tipo)
    : movements

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Caja</h1>

      {/* Movimiento manual */}
      <div className="bg-background rounded-lg border p-5 mb-6">
        <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">Movimiento manual de caja</h2>
        <form action={crearMovimientoCaja} className="flex flex-wrap gap-3 items-end">
          <div className="flex rounded-md border overflow-hidden text-sm shrink-0">
            <label className="flex items-center gap-2 px-3 py-2 cursor-pointer has-[:checked]:bg-green-50 has-[:checked]:text-green-800 transition-colors">
              <input type="radio" name="tipo" value="ingreso" defaultChecked className="sr-only" />
              <span>+ Ingreso</span>
            </label>
            <label className="flex items-center gap-2 px-3 py-2 cursor-pointer border-l has-[:checked]:bg-red-50 has-[:checked]:text-red-800 transition-colors">
              <input type="radio" name="tipo" value="egreso" className="sr-only" />
              <span>− Egreso</span>
            </label>
          </div>

          <div className="flex-1 min-w-40">
            <Input name="descripcion" placeholder="Descripción" required />
          </div>

          <div className="w-36">
            <Input name="monto" type="number" min="0.01" step="0.01" placeholder="Monto $" required />
          </div>

          <div>
            <select
              name="metodo_pago"
              defaultValue="efectivo"
              className="h-9 px-3 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>

          <SubmitButton loadingText="Registrando...">Registrar</SubmitButton>
        </form>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Banknote}
          label="Efectivo en caja"
          amount={saldoEfectivo}
          subtitle={`Ingresos $${efectivoIngreso.toLocaleString('es-AR')} · Egresos $${efectivoEgreso.toLocaleString('es-AR')}`}
          color={saldoEfectivo >= 0 ? 'green' : 'red'}
        />
        <StatCard
          icon={ArrowUpCircle}
          label="Saldo transferencias"
          amount={saldoTransferencia}
          subtitle={`Ingresos $${transferenciaIngreso.toLocaleString('es-AR')} · Egresos $${transferenciaEgreso.toLocaleString('es-AR')}`}
          color={saldoTransferencia >= 0 ? 'blue' : 'red'}
        />
        <StatCard
          icon={Smartphone}
          label="Ventas MercadoPago"
          amount={totalMP}
          subtitle={`${orders.length} orden${orders.length !== 1 ? 'es' : ''} cobrada${orders.length !== 1 ? 's' : ''}`}
          color="blue"
        />
        <StatCard
          icon={AlertTriangle}
          label="Deuda proveedores"
          amount={deudaProveedores}
          subtitle="Compras financiadas pendientes"
          color={deudaProveedores > 0 ? 'orange' : 'green'}
        />
      </div>

      {/* Movimientos */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold">Todos los movimientos</h2>
      </div>

      <Suspense>
        <FilterBar
          fields={[
            {
              key: 'tipo', type: 'select', label: 'Tipo',
              options: [
                { value: 'venta', label: 'Ventas' },
                { value: 'compra', label: 'Compras' },
              ],
            },
            {
              key: 'metodo', type: 'select', label: 'Método',
              options: [
                { value: 'efectivo', label: 'Efectivo' },
                { value: 'transferencia', label: 'Transferencia' },
                { value: 'financiada', label: 'Financiada' },
                { value: 'mercadopago', label: 'MercadoPago' },
              ],
            },
            { key: 'desde', type: 'date', label: 'Desde' },
            { key: 'hasta', type: 'date', label: 'Hasta' },
          ]}
        />
      </Suspense>

      <div className="bg-background rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Fecha</th>
              <th className="text-left p-3 font-medium">Tipo</th>
              <th className="text-left p-3 font-medium">Descripción</th>
              <th className="text-left p-3 font-medium">Método</th>
              <th className="text-right p-3 font-medium">Monto</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovements.map((m) => (
              <tr key={m.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="p-3 text-muted-foreground whitespace-nowrap text-xs">
                  {new Date(m.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                </td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    m.tipo === 'venta'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {m.tipo === 'venta' ? 'Venta' : 'Compra'}
                  </span>
                </td>
                <td className="p-3">
                  <p className="font-medium">{m.descripcion}</p>
                  {m.detalle && <p className="text-xs text-muted-foreground">{m.detalle}</p>}
                </td>
                <td className="p-3">
                  <span className="text-xs text-muted-foreground">
                    {METODO_LABEL[m.metodo_pago] ?? m.metodo_pago}
                  </span>
                </td>
                <td className={`p-3 text-right font-semibold ${
                  m.tipo === 'venta' ? 'text-green-700' :
                  m.metodo_pago === 'financiada' ? 'text-orange-600' : 'text-red-700'
                }`}>
                  {m.tipo === 'venta' ? '+' : '-'}${m.monto.toLocaleString('es-AR')}
                </td>
              </tr>
            ))}
            {filteredMovements.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  {Object.keys(sp).length > 0 ? 'No hay movimientos con esos filtros.' : 'No hay movimientos registrados todavía.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
