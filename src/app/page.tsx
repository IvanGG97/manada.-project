import { createClient } from '@/lib/supabase/server'
import { getCategories } from '@/lib/supabase/api'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, Truck, CreditCard, Package, Sparkles } from 'lucide-react'

type Product = {
  id: string
  name: string
  slug: string
  price: number
  image_url: string | null
  categories: { name: string; slug: string } | null
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/productos/${product.slug}`} className="group block">
      <div className="rounded-2xl border border-border bg-background overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="aspect-square relative bg-secondary overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              Sin imagen
            </div>
          )}
        </div>
        <div className="p-4">
          {product.categories && (
            <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-1 block">
              {product.categories.name}
            </span>
          )}
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-2 text-foreground">
            {product.name}
          </h3>
          <p className="font-bold text-base text-foreground">
            ${product.price.toLocaleString('es-AR')}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default async function Home() {
  const supabase = await createClient()

  const [categories, featuredResult, newArrivalsResult] = await Promise.all([
    getCategories(),
    supabase
      .from('products')
      .select('id, name, slug, price, image_url, categories(name, slug)')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('products')
      .select('id, name, slug, price, image_url, categories(name, slug)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const featured = (featuredResult.data ?? []) as unknown as Product[]
  const newArrivals = (newArrivalsResult.data ?? []) as unknown as Product[]

  return (
    <div className="flex flex-col">

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden py-24 px-4 text-center"
        style={{ background: 'linear-gradient(135deg, #C45E7A 0%, #8B3352 100%)' }}
      >
        {/* Círculos decorativos */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #FDF0F3, transparent)' }} />
        <div className="absolute -bottom-16 -right-10 w-56 h-56 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #FDF0F3, transparent)' }} />

        <div className="relative container mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest bg-white/20 text-white px-3 py-1 rounded-full mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Nueva temporada
          </span>
          <div className="flex justify-center mb-5">
            <Image
              src="/Logo.jpeg"
              alt="MaNaDa"
              width={120}
              height={120}
              className="rounded-3xl shadow-2xl"
            />
          </div>
          <p className="text-lg md:text-xl text-white/85 mb-10 max-w-xl mx-auto leading-relaxed">
            Artículos de temporada, maquillaje e indumentaria. Tendencias que llegan directo a tu puerta.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/productos">
              <Button
                size="lg"
                className="font-semibold px-8 bg-white text-primary hover:bg-white/90 shadow-lg"
              >
                Ver catálogo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            {featured.length > 0 && (
              <Link href="#tendencias">
                <Button
                  size="lg"
                  variant="ghost"
                  className="font-semibold px-8 text-white hover:bg-white/15 border border-white/30"
                >
                  Ver tendencias
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── CATEGORÍAS ── */}
      {categories.length > 0 && (
        <section className="py-10 px-4 bg-secondary">
          <div className="container mx-auto">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground text-center mb-5">
              Explorá por categoría
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/productos">
                <span className="inline-block px-5 py-2 rounded-full border border-border bg-background text-sm font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                  Todos
                </span>
              </Link>
              {categories.map((cat) => (
                <Link key={cat.id} href={`/productos?categoria=${cat.id}`}>
                  <span className="inline-block px-5 py-2 rounded-full border border-border bg-background text-sm font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TENDENCIAS (destacados) ── */}
      {featured.length > 0 && (
        <section id="tendencias" className="py-16 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  Lo más elegido
                </span>
                <h2 className="text-3xl font-bold tracking-tight">Tendencias</h2>
              </div>
              <Link href="/productos" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                Ver todo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
            <div className="mt-6 text-center sm:hidden">
              <Link href="/productos">
                <Button variant="outline" className="gap-2">
                  Ver todos los productos <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── TRUST STRIP ── */}
      <section className="py-12 px-4 bg-secondary border-y border-border">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Envíos a todo el país</p>
                <p className="text-xs text-muted-foreground mt-0.5">Recibís en la puerta de tu casa</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Pagos seguros</p>
                <p className="text-xs text-muted-foreground mt-0.5">Mercado Pago · Efectivo · Transferencia</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Stock actualizado</p>
                <p className="text-xs text-muted-foreground mt-0.5">Lo que ves, está disponible</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NOVEDADES ── */}
      {newArrivals.length > 0 && (
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1 block">
                  Recién llegado
                </span>
                <h2 className="text-3xl font-bold tracking-tight">Novedades</h2>
              </div>
              <Link href="/productos" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                Ver todo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA FINAL ── */}
      <section className="py-16 px-4 text-center bg-secondary border-t border-border">
        <div className="container mx-auto max-w-lg">
          <h2 className="text-2xl font-bold mb-3">¿No encontrás lo que buscás?</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Explorá el catálogo completo o contactanos directamente.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/productos">
              <Button size="lg" className="font-semibold px-8">
                Ver catálogo completo
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
