import { login } from './actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/SubmitButton'
import Link from 'next/link'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const { returnTo } = await searchParams

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
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
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
                <Link href="/olvide-contrasena" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input id="password" name="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <SubmitButton className="w-full" loadingText="Ingresando...">Ingresar</SubmitButton>
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
