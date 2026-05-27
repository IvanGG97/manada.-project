import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { ProductGallery } from '@/components/ProductGallery'

export default async function ProductDetailPage(props: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await props.params
  const supabase = await createClient()

  let isAdmin = false
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  let query = supabase
    .from('products')
    .select('*, categories(name)')
    .eq('slug', slug)

  if (!isAdmin) query = query.eq('is_active', true)

  const { data: product } = await query.single()

  if (!product) notFound()

  const { data: images } = await supabase
    .from('product_images')
    .select('id, url')
    .eq('product_id', product.id)
    .order('position')

  const allImages: string[] = images && images.length > 0
    ? images.map((i) => i.url)
    : product.image_url
    ? [product.image_url]
    : []

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {isAdmin && !product.is_active && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          <span className="font-semibold">Vista previa</span>
          <span className="text-amber-700 dark:text-amber-400">—</span>
          <span>Este producto está inactivo y no es visible para los clientes.</span>
        </div>
      )}
      <div className="mb-6">
        <Link href="/productos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          &larr; Volver al catálogo
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Galería de imágenes */}
        {allImages.length > 0 ? (
          <ProductGallery images={allImages} name={product.name} />
        ) : (
          <div className="aspect-square bg-secondary/50 rounded-xl flex items-center justify-center text-muted-foreground border">
            Imagen no disponible
          </div>
        )}

        {/* Info del producto */}
        <div className="flex flex-col">
          {product.categories && (
            <span className="text-sm font-medium text-primary uppercase tracking-wider mb-2">
              {product.categories.name}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{product.name}</h1>
          <p className="text-3xl font-bold mb-6">${product.price.toLocaleString('es-AR')}</p>

          <div className="prose prose-sm md:prose-base text-muted-foreground mb-8">
            {product.description ? (
              <p>{product.description}</p>
            ) : (
              <p className="italic">Sin descripción detallada.</p>
            )}
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium mb-2">Disponibilidad:</p>
            {product.stock > 0 ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                En stock ({product.stock} disponibles)
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Sin stock
              </span>
            )}
          </div>

          <div className="mt-auto pt-6 border-t">
            <AddToCartButton product={{
              id: product.id,
              name: product.name,
              price: product.price,
              image_url: product.image_url,
              stock: product.stock,
            }} />
          </div>
        </div>
      </div>
    </div>
  )
}
