import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { toggleProductActive } from './actions'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FilterBar } from '@/components/admin/FilterBar'
import { Suspense } from 'react'
import { Plus, Pencil, AlertTriangle } from 'lucide-react'

function ProductFilters({ categories }: { categories: { id: string; name: string }[] }) {
  return (
    <FilterBar
      fields={[
        { key: 'nombre', type: 'text', label: 'Nombre', placeholder: 'Buscar producto...' },
        {
          key: 'categoria', type: 'select', label: 'Categoría',
          options: categories.map((c) => ({ value: c.id, label: c.name })),
        },
        {
          key: 'estado', type: 'select', label: 'Estado',
          options: [
            { value: 'activo', label: 'Activos' },
            { value: 'inactivo', label: 'Inactivos' },
            { value: 'sin-stock', label: 'Sin stock' },
            { value: 'stock-bajo', label: 'Stock bajo' },
          ],
        },
      ]}
    />
  )
}

export default async function AdminProductosPage(props: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await props.searchParams
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })

  if (sp.nombre) query = query.ilike('name', `%${sp.nombre}%`)
  if (sp.categoria) query = query.eq('category_id', sp.categoria)
  if (sp.estado === 'activo') query = query.eq('is_active', true)
  else if (sp.estado === 'inactivo') query = query.eq('is_active', false)
  else if (sp.estado === 'sin-stock') query = query.eq('stock', 0).eq('is_active', true)

  const [{ data: products }, { data: categories }] = await Promise.all([
    query,
    supabase.from('categories').select('id, name').order('name'),
  ])

  const filtered = sp.estado === 'stock-bajo'
    ? (products ?? []).filter((p) => (p.stock_minimo ?? 0) > 0 && p.stock < (p.stock_minimo ?? 0))
    : (products ?? [])

  const lowStockProducts = (products ?? []).filter(
    (p) => (p.stock_minimo ?? 0) > 0 && p.stock < (p.stock_minimo ?? 0)
  )

  return (
    <div>
      {lowStockProducts.length > 0 && !sp.estado && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {lowStockProducts.length} producto{lowStockProducts.length !== 1 ? 's' : ''} con stock bajo
              </p>
              <ul className="mt-1.5 space-y-0.5">
                {lowStockProducts.map((p) => (
                  <li key={p.id} className="text-xs text-amber-700">
                    <span className="font-medium">{p.name}</span>
                    {' — '}stock: <span className="font-bold">{p.stock}</span> / mínimo: {p.stock_minimo}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Link href="/admin/productos/nuevo">
          <Button className="gap-2"><Plus className="h-4 w-4" />Nuevo producto</Button>
        </Link>
      </div>

      <Suspense>
        <ProductFilters categories={categories ?? []} />
      </Suspense>

      <div className="bg-background rounded-lg border overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Producto</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Categoría</th>
              <th className="text-right p-3 font-medium">Precio</th>
              <th className="text-right p-3 font-medium">Stock</th>
              <th className="text-center p-3 font-medium hidden sm:table-cell">Estado</th>
              <th className="text-right p-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => {
              const toggleAction = toggleProductActive.bind(null, product.id, product.is_active)
              const isLowStock = (product.stock_minimo ?? 0) > 0 && product.stock < (product.stock_minimo ?? 0)
              return (
                <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded bg-muted overflow-hidden shrink-0">
                        {product.image_url ? (
                          <Image src={product.image_url} alt={product.name} fill className="object-cover" sizes="40px" />
                        ) : (
                          <div className="w-full h-full bg-secondary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium leading-tight truncate max-w-[140px] md:max-w-none">{product.name}</p>
                        <p className="text-xs text-muted-foreground md:hidden">{product.categories?.name ?? ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{product.categories?.name ?? '—'}</td>
                  <td className="p-3 text-right font-medium">${product.price.toLocaleString('es-AR')}</td>
                  <td className="p-3 text-right">
                    <span className={`font-medium ${product.stock === 0 ? 'text-destructive' : isLowStock ? 'text-amber-600' : ''}`}>
                      {product.stock}
                    </span>
                    {isLowStock && <span className="text-xs text-amber-500 ml-1">↓{product.stock_minimo}</span>}
                  </td>
                  <td className="p-3 hidden sm:table-cell">
                    <div className="flex justify-center gap-1.5 flex-wrap">
                      {product.is_active
                        ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">Activo</span>
                        : <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Inactivo</span>
                      }
                      {product.is_featured && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">Destacado</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/productos/${product.id}/editar`}>
                        <Button variant="outline" size="sm" className="gap-1.5 hidden sm:flex">
                          <Pencil className="h-3.5 w-3.5" />Editar
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 sm:hidden">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <ConfirmDialog
                        title={product.is_active ? 'Desactivar producto' : 'Activar producto'}
                        description={product.is_active
                          ? `"${product.name}" dejará de mostrarse en la tienda.`
                          : `"${product.name}" volverá a mostrarse en la tienda.`}
                        action={toggleAction}
                        confirmLabel={product.is_active ? 'Desactivar' : 'Activar'}
                        variant={product.is_active ? 'destructive' : 'default'}
                      >
                        <Button type="button" variant="ghost" size="sm"
                          className={product.is_active ? 'text-muted-foreground text-xs' : 'text-green-600 text-xs'}>
                          {product.is_active ? 'Desactivar' : 'Activar'}
                        </Button>
                      </ConfirmDialog>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  {Object.keys(sp).length > 0
                    ? 'No se encontraron productos con esos filtros.'
                    : <>No hay productos. <Link href="/admin/productos/nuevo" className="text-primary hover:underline">Creá el primero.</Link></>
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
