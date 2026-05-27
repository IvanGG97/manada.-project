import { createClient } from '@/lib/supabase/server'
import { createCompra } from './actions'
import { CompraForm } from '@/components/admin/CompraForm'
import { FilterBar } from '@/components/admin/FilterBar'
import { Pagination } from '@/components/admin/Pagination'
import { Suspense } from 'react'

const PER_PAGE = 20

const METODO_LABEL: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  financiada: 'Financiada',
}

const METODO_COLOR: Record<string, string> = {
  efectivo: 'bg-green-100 text-green-800',
  transferencia: 'bg-blue-100 text-blue-800',
  financiada: 'bg-orange-100 text-orange-800',
}

const today = new Date().toISOString().split('T')[0]

export default async function AdminComprasPage(props: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await props.searchParams
  const page = Math.max(1, parseInt(sp.page ?? '1', 10))
  const supabase = await createClient()

  let comprasQuery = supabase
    .from('compras')
    .select('*, products(name)', { count: 'exact' })
    .order('fecha', { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)

  if (sp.desde) comprasQuery = comprasQuery.gte('fecha', sp.desde)
  if (sp.hasta) comprasQuery = comprasQuery.lte('fecha', sp.hasta + 'T23:59:59')
  if (sp.metodo) comprasQuery = comprasQuery.eq('metodo_pago', sp.metodo)
  if (sp.proveedor) comprasQuery = comprasQuery.ilike('proveedor', `%${sp.proveedor}%`)

  const [{ data: compras, count }, { data: products }] = await Promise.all([
    comprasQuery,
    supabase.from('products').select('id, name, stock').order('name'),
  ])

  // Total for filtered results (all pages)
  let totalQuery = supabase.from('compras').select('monto, metodo_pago')
  if (sp.desde) totalQuery = totalQuery.gte('fecha', sp.desde)
  if (sp.hasta) totalQuery = totalQuery.lte('fecha', sp.hasta + 'T23:59:59')
  if (sp.metodo) totalQuery = totalQuery.eq('metodo_pago', sp.metodo)
  if (sp.proveedor) totalQuery = totalQuery.ilike('proveedor', `%${sp.proveedor}%`)
  const { data: allCompras } = await totalQuery
  const total = allCompras?.reduce((sum, c) => sum + Number(c.monto), 0) ?? 0
  const deuda = allCompras?.filter(c => c.metodo_pago === 'financiada').reduce((sum, c) => sum + Number(c.monto), 0) ?? 0

  const { page: _p, ...filterParams } = sp

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Compras a proveedores</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="bg-background rounded-lg border p-6">
          <h2 className="text-base font-semibold mb-4">Registrar compra</h2>
          <CompraForm action={createCompra} products={products ?? []} today={today} />
        </div>

        {/* Historial */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base font-semibold">Historial</h2>
            <div className="flex gap-4 text-sm">
              <span className="font-bold text-red-700">Total: ${total.toLocaleString('es-AR')}</span>
              {deuda > 0 && (
                <span className="font-bold text-orange-600">Deuda: ${deuda.toLocaleString('es-AR')}</span>
              )}
            </div>
          </div>

          <Suspense>
            <FilterBar
              fields={[
                { key: 'proveedor', type: 'text', label: 'Proveedor', placeholder: 'Buscar...' },
                {
                  key: 'metodo', type: 'select', label: 'Método',
                  options: [
                    { value: 'efectivo', label: 'Efectivo' },
                    { value: 'transferencia', label: 'Transferencia' },
                    { value: 'financiada', label: 'Financiada' },
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
                  <th className="text-left p-3 font-medium">Descripción</th>
                  <th className="text-left p-3 font-medium">Método</th>
                  <th className="text-right p-3 font-medium">Monto</th>
                </tr>
              </thead>
              <tbody>
                {compras?.map((c) => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3 text-muted-foreground whitespace-nowrap text-xs">
                      {new Date(c.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </td>
                    <td className="p-3">
                      <p className="font-medium">{c.descripcion}</p>
                      {c.products?.name && (
                        <p className="text-xs text-green-600">
                          📦 {c.products.name} × {c.cantidad}
                        </p>
                      )}
                      {c.proveedor && <p className="text-xs text-muted-foreground">{c.proveedor}</p>}
                      {c.notas && <p className="text-xs text-muted-foreground italic">{c.notas}</p>}
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${METODO_COLOR[c.metodo_pago] ?? 'bg-muted'}`}>
                        {METODO_LABEL[c.metodo_pago] ?? c.metodo_pago}
                      </span>
                    </td>
                    <td className={`p-3 text-right font-semibold ${c.metodo_pago === 'financiada' ? 'text-orange-600' : 'text-red-700'}`}>
                      -${Number(c.monto).toLocaleString('es-AR')}
                    </td>
                  </tr>
                ))}
                {(!compras || compras.length === 0) && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      {Object.keys(filterParams).length > 0 ? 'No hay compras con esos filtros.' : 'No hay compras registradas todavía.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination page={page} total={count ?? 0} perPage={PER_PAGE} searchParams={filterParams} />
        </div>
      </div>
    </div>
  )
}
