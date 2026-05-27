import { getProducts, getCategories } from '@/lib/supabase/api'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default async function ProductosPage(props: {
  searchParams?: Promise<{ categoria?: string }>
}) {
  const searchParams = await props.searchParams
  const categoriaId = searchParams?.categoria
  
  const products = await getProducts({ categoryId: categoriaId })
  const categories = await getCategories()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar / Filtros */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24">
            <h2 className="text-xl font-bold mb-4">Categorías</h2>
            <div className="space-y-2 flex flex-col">
              <Link 
                href="/productos"
                className={`text-sm py-2 px-3 rounded-md transition-colors ${!categoriaId ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted'}`}
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
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6">
            {categoriaId 
              ? categories.find(c => c.id === categoriaId)?.name || 'Catálogo'
              : 'Todos los Productos'
            }
          </h1>

          {products.length === 0 ? (
             <div className="text-center py-20 bg-muted rounded-lg border border-dashed">
             <p className="text-muted-foreground text-lg">No se encontraron productos en esta categoría.</p>
           </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <Card key={product.id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-muted relative">
                    {product.image_url ? (
                      <Image 
                        src={product.image_url} 
                        alt={product.name} 
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/50">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 flex-1">
                    {product.categories && (
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
                        {product.categories.name}
                      </span>
                    )}
                    <h3 className="font-semibold text-lg line-clamp-2 leading-tight mb-2">{product.name}</h3>
                    <p className="font-bold text-xl">${product.price}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Link href={`/productos/${product.slug}`} className="w-full">
                      <Button className="w-full">Ver detalle</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}