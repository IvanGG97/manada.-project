import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createCategory, deleteCategory } from './actions'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Trash2 } from 'lucide-react'

export default async function AdminCategoriasPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*, products(id)')
    .order('name')

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Categorías</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario nueva categoría */}
        <div className="bg-background rounded-lg border p-6">
          <h2 className="text-base font-semibold mb-4">Nueva categoría</h2>
          <form action={createCategory} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nombre *</label>
              <Input name="name" required placeholder="Ej: Indumentaria" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Descripción</label>
              <Input name="description" placeholder="Opcional" />
            </div>
            <Button type="submit">Crear categoría</Button>
          </form>
        </div>

        {/* Lista de categorías */}
        <div className="bg-background rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Nombre</th>
                <th className="text-left p-3 font-medium">Descripción</th>
                <th className="text-center p-3 font-medium">Productos</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {categories?.map((cat) => {
                const productCount = Array.isArray(cat.products) ? cat.products.length : 0
                const canDelete = productCount === 0
                const deleteAction = deleteCategory.bind(null, cat.id)

                return (
                  <tr key={cat.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{cat.name}</td>
                    <td className="p-3 text-muted-foreground text-sm">{cat.description ?? '—'}</td>
                    <td className="p-3 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        productCount > 0
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {productCount}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {canDelete ? (
                        <ConfirmDialog
                          title="Eliminar categoría"
                          description={`¿Seguro que querés eliminar "${cat.name}"? Esta acción no se puede deshacer.`}
                          action={deleteAction}
                          confirmLabel="Eliminar"
                          variant="destructive"
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </ConfirmDialog>
                      ) : (
                        <span
                          title="Reasigná o eliminá los productos antes de borrar esta categoría"
                          className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground/30 cursor-not-allowed"
                        >
                          <Trash2 className="h-4 w-4" />
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
              {(!categories || categories.length === 0) && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">

                    No hay categorías todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
