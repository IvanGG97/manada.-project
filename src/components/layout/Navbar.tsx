import Link from 'next/link'
import Image from 'next/image'
import { User, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
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
      <nav className="hidden md:block border-b bg-background sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2.5 shrink-0">
              <Image
                src="/Logo.jpeg"
                alt="MaNaDa"
                width={36}
                height={36}
                className="rounded-lg object-cover"
              />
              <span className="text-xl font-bold tracking-tight">MaNaDa</span>
            </Link>
            <span className="text-xs font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-wider">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            {firstName && (
              <span className="text-sm text-muted-foreground">{firstName}</span>
            )}
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Panel
              </Button>
            </Link>
            <ThemeToggle />
            <form action={logout}>
              <Button variant="outline" size="sm" type="submit">Cerrar sesión</Button>
            </form>
          </div>
        </div>
      </nav>
    )
  }

  const categories = await getCategories()

  return (
    <nav className="border-b bg-background sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-2">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image
            src="/Logo.jpeg"
            alt="MaNaDa"
            width={38}
            height={38}
            className="rounded-xl object-cover"
          />
          <span className="text-xl font-bold tracking-tight hidden sm:block">MaNaDa</span>
        </Link>

        {/* Desktop links + hamburger mobile (NavMenu es ahora un único div) */}
        <NavMenu categories={categories} />

        {/* Acciones del usuario */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link href={user ? '/profile' : '/login'} className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" aria-label="Perfil">
              <User className="h-5 w-5" />
            </Button>
            {firstName && (
              <span className="text-sm font-medium hidden sm:block">{firstName}</span>
            )}
          </Link>
          <CartIcon />
        </div>

      </div>
    </nav>
  )
}
