import { createClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/ProductForm'
import { createProduct } from '../actions'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function NuevoProductoPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('id, name').order('name')

  return (
    <div>
      <Link
        href="/admin/productos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a productos
      </Link>
      <h1 className="text-2xl font-bold mb-6">Nuevo producto</h1>
      <div className="bg-background rounded-lg border p-6">
        <ProductForm
          action={createProduct}
          categories={categories ?? []}
          submitLabel="Crear producto"
        />
      </div>
    </div>
  )
}
