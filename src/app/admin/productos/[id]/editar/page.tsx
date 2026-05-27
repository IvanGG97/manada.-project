import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProductForm } from '@/components/admin/ProductForm'
import { updateProduct } from '../../actions'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function EditarProductoPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const supabase = await createClient()

  const [{ data: product }, { data: categories }, { data: images }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('categories').select('id, name').order('name'),
    supabase
      .from('product_images')
      .select('id, url, storage_path')
      .eq('product_id', id)
      .order('position'),
  ])

  if (!product) notFound()

  const updateProductWithId = updateProduct.bind(null, id)

  return (
    <div>
      <Link
        href="/admin/productos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a productos
      </Link>
      <h1 className="text-2xl font-bold mb-6">Editar producto</h1>
      <div className="bg-background rounded-lg border p-6">
        <ProductForm
          action={updateProductWithId}
          categories={categories ?? []}
          submitLabel="Guardar cambios"
          productId={id}
          existingImages={images ?? []}
          defaultValues={{
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price,
            stock: product.stock,
            stock_minimo: product.stock_minimo ?? 0,
            category_id: product.category_id,
            is_active: product.is_active,
            is_featured: product.is_featured,
          }}
        />
      </div>
    </div>
  )
}
