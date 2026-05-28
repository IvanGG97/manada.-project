import Link from 'next/link'
import Image from 'next/image'
import { User, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { getCategories } from '@/lib/supabase/api'
import { CartIcon } from '@/components/cart/CartIcon'
import { NavMenu } from './NavMenu'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { logout } from '@/app/profile/actions'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  let firstName: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, first_name')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
    firstName = profile?.first_name ?? null
  }

  if (isAdmin) {
    return (
      <>
        {/* Desktop: barra admin completa */}
        <nav className="hidden md:block border-b bg-background sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-2.5 shrink-0">
                <Image src="/Logo.jpeg" alt="MaNaDa" width={36} height={36} className="rounded-lg object-cover" />
                <span className="text-xl font-bold tracking-tight">MaNaDa</span>
              </Link>
              <span className="text-xs font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-wider">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-3">
              {firstName && <span className="text-sm text-muted-foreground">{firstName}</span>}
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Panel
                </Button>
              </Link>
              <ThemeToggle />
              <form action={logout}>
                <SubmitButton variant="outline" size="sm" loadingText="Saliendo...">Cerrar sesión</SubmitButton>
              </form>
            </div>
          </div>
        </nav>

        {/* Mobile: barra admin simplificada para vista de tienda */}
        <nav className="md:hidden border-b bg-primary text-primary-foreground sticky top-0 z-10">
          <div className="h-12 px-4 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-1.5 text-sm font-semibold">
              <LayoutDashboard className="h-4 w-4" />
              Volver al admin
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-70">Vista tienda</span>
              <ThemeToggle />
            </div>
          </div>
        </nav>
      </>
    )
  }

  const categories = await getCategories()

  return (
    <nav className="border-b bg-background sticky top-0 z-10 shadow-sm">

      {/* ── Mobile: solo logo + theme toggle ── */}
      <div className="md:hidden h-14 px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/Logo.jpeg"
            alt="MaNaDa"
            width={32}
            height={32}
            className="rounded-lg object-cover"
          />
          <span className="font-bold text-base tracking-tight">MaNaDa</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* ── Desktop: barra completa ── */}
      <div className="hidden md:flex h-16 container mx-auto px-4 items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image
            src="/Logo.jpeg"
            alt="MaNaDa"
            width={38}
            height={38}
            className="rounded-xl object-cover"
          />
          <span className="text-xl font-bold tracking-tight">MaNaDa</span>
        </Link>

        <NavMenu categories={categories} />

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link href={user ? '/mi-cuenta/pedidos' : '/login'} className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" aria-label="Perfil">
              <User className="h-5 w-5" />
            </Button>
            {firstName && (
              <span className="text-sm font-medium">{firstName}</span>
            )}
          </Link>
          <CartIcon />
        </div>
      </div>

    </nav>
  )
}
