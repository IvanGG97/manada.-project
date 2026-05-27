import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'

export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { ProductGallery } from '@/components/ProductGallery'

export default async function ProductDetailPage(props: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await props.params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

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
    <div className="container mx-auto px-4 py-8">
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
