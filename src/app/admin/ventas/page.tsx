import { createClient } from '@/lib/supabase/server'
import { createVenta } from './actions'
import { VentaForm } from '@/components/admin/VentaForm'
import { FilterBar } from '@/components/admin/FilterBar'
import { Suspense } from 'react'

const METODO_LABEL: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  mercadopago: 'MercadoPago',
}

const today = new Date().toISOString().split('T')[0]

export default async function AdminVentasPage(props: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await props.searchParams
  const supabase = await createClient()

  let ventasQuery = supabase
    .from('ventas_presenciales')
    .select('*, products(name)')
    .order('fecha', { ascending: false })

  if (sp.desde) ventasQuery = ventasQuery.gte('fecha', sp.desde)
  if (sp.hasta) ventasQuery = ventasQuery.lte('fecha', sp.hasta + 'T23:59:59')
  if (sp.metodo) ventasQuery = ventasQuery.eq('metodo_pago', sp.metodo)
  if (sp.descripcion) ventasQuery = ventasQuery.ilike('descripcion', `%${sp.descripcion}%`)

  const [{ data: ventas }, { data: products }] = await Promise.all([
    ventasQuery,
    supabase.from('products').select('id, name, stock').eq('is_active', true).order('name'),
  ])

  const total = ventas?.reduce((sum, v) => sum + Number(v.monto), 0) ?? 0

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ventas presenciales</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background rounded-lg border p-6">
          <h2 className="text-base font-semibold mb-4">Registrar venta</h2>
          <VentaForm action={createVenta} products={products ?? []} today={today} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Historial</h2>
            <span className="text-sm font-bold text-green-700">Total: ${total.toLocaleString('es-AR')}</span>
          </div>

          <Suspense>
            <FilterBar
              fields={[
                { key: 'descripcion', type: 'text', label: 'Descripción', placeholder: 'Buscar...' },
                {
                  key: 'metodo', type: 'select', label: 'Método',
                  options: [{ value: 'efectivo', label: 'Efectivo' }, { value: 'transferencia', label: 'Transferencia' }, { value: 'mercadopago', label: 'MercadoPago' }],
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
                  <th className="text-left p-3 font-medium">Descripción</th>
                  <th className="text-left p-3 font-medium">Método</th>
                  <th className="text-right p-3 font-medium">Monto</th>
                </tr>
              </thead>
              <tbody>
                {ventas?.map((v) => (
                  <tr key={v.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3 text-muted-foreground whitespace-nowrap text-xs">
                      {new Date(v.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </td>
                    <td className="p-3">
                      <p className="font-medium">{v.descripcion}</p>
                      {v.products?.name && <p className="text-xs text-blue-600">📦 {v.products.name} × {v.cantidad}</p>}
                      {v.notas && !v.notas.startsWith('mp_order:') && <p className="text-xs text-muted-foreground">{v.notas}</p>}
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        v.metodo_pago === 'efectivo' ? 'bg-green-100 text-green-800'
                        : v.metodo_pago === 'mercadopago' ? 'bg-sky-100 text-sky-800'
                        : 'bg-blue-100 text-blue-800'
                      }`}>
                        {METODO_LABEL[v.metodo_pago] ?? v.metodo_pago}
                      </span>
                    </td>
                    <td className="p-3 text-right font-semibold text-green-700">
                      +${Number(v.monto).toLocaleString('es-AR')}
                    </td>
                  </tr>
                ))}
                {(!ventas || ventas.length === 0) && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      {Object.keys(sp).length > 0 ? 'No hay ventas con esos filtros.' : 'No hay ventas registradas todavía.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
