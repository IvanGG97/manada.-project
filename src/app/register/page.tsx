import { register } from './actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <form action={register}>
          <CardHeader>
            <CardTitle>Crear Cuenta</CardTitle>
            <CardDescription>
              Completá tus datos para registrarte en la tienda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium">Nombre</label>
              <Input id="firstName" name="firstName" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
              <Input id="password" name="password" type="password" required minLength={6} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full">Registrarse</Button>
            <p className="text-sm text-center text-muted-foreground">
              ¿Ya tenés cuenta?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Iniciá sesión acá
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}