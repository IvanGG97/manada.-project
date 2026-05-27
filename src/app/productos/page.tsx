import { getProducts, getCategories } from '@/lib/supabase/api'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { ProductSearch } from '@/components/ProductSearch'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Catálogo',
  description: 'Explorá todos nuestros productos de temporada. Envíos a todo el país.',
  openGraph: {
    title: 'Catálogo — MaNaDa',
    description: 'Explorá todos nuestros productos de temporada.',
  },
}

export default async function ProductosPage(props: {
  searchParams?: Promise<{ categoria?: string; q?: string }>
}) {
  const searchParams = await props.searchParams
  const categoriaId = searchParams?.categoria
  const searchQuery = searchParams?.q?.trim()

  const products = await getProducts({ categoryId: categoriaId, search: searchQuery })
  const categories = await getCategories()

  const pageTitle = searchQuery
    ? `Resultados para "${searchQuery}"`
    : categoriaId
      ? categories.find(c => c.id === categoriaId)?.name || 'Catálogo'
      : 'Todos los Productos'

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">

      {/* Pills de categorías — horizontal scroll en mobile, sidebar en desktop */}
      <div className="flex md:hidden gap-2 overflow-x-auto pb-3 mb-6 -mx-4 px-4 scrollbar-none">
        <Link
          href="/productos"
          className={`shrink-0 text-sm py-1.5 px-4 rounded-full border transition-colors whitespace-nowrap ${!categoriaId && !searchQuery ? 'bg-primary text-primary-foreground border-primary font-medium' : 'bg-background border-border hover:bg-muted'}`}
        >
          Todos
        </Link>
        {categories.map(category => (
          <Link
            key={category.id}
            href={`/productos?categoria=${category.id}`}
            className={`shrink-0 text-sm py-1.5 px-4 rounded-full border transition-colors whitespace-nowrap ${categoriaId === category.id ? 'bg-primary text-primary-foreground border-primary font-medium' : 'bg-background border-border hover:bg-muted'}`}
          >
            {category.name}
          </Link>
        ))}
      </div>

      <div className="flex gap-8">

        {/* Sidebar de categorías — solo desktop */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-24">
            <h2 className="text-xl font-bold mb-4">Categorías</h2>
            <div className="space-y-1 flex flex-col">
              <Link
                href="/productos"
                className={`text-sm py-2 px-3 rounded-md transition-colors ${!categoriaId && !searchQuery ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
              >
                Todos los productos
              </Link>
              {categories.map(category => (
                <Link
                  key={category.id}
                  href={`/productos?categoria=${category.id}`}
                  className={`text-sm py-2 px-3 rounded-md transition-colors ${categoriaId === category.id ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Listado de Productos */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">{pageTitle}</h1>
            <Suspense>
              <ProductSearch />
            </Suspense>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 bg-muted rounded-lg border border-dashed">
              <p className="text-muted-foreground text-lg">
                {searchQuery
                  ? `No encontramos productos para "${searchQuery}".`
                  : 'No se encontraron productos en esta categoría.'
                }
              </p>
              {searchQuery && (
                <Link href="/productos" className="mt-4 inline-block text-sm text-primary hover:underline">
                  Ver todos los productos
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {products.map(product => (
                <Link key={product.id} href={`/productos/${product.slug}`} className="group block">
                  <div className="rounded-xl border border-border bg-background overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                    <div className="aspect-square bg-muted relative overflow-hidden">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/50">
                          Sin imagen
                        </div>
                      )}
                    </div>
                    <div className="p-3 md:p-4 flex-1">
                      {product.categories && (
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
                          {product.categories.name}
                        </span>
                      )}
                      <h3 className="font-semibold text-sm md:text-base line-clamp-2 leading-tight mb-1.5">{product.name}</h3>
                      <p className="font-bold text-base md:text-lg">${product.price.toLocaleString('es-AR')}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
