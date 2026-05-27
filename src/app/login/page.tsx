import { login } from './actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ returnTo?: string; error?: string }> }) {
  const { returnTo, error } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <form action={login}>
          {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresá a tu cuenta para realizar compras y ver tus pedidos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
              <Input id="password" name="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full">Ingresar</Button>
            <p className="text-sm text-center text-muted-foreground">
              ¿No tenés cuenta?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Registrate acá
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
