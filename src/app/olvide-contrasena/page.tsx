import { solicitarReset } from './actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/SubmitButton'
import Link from 'next/link'
import { Mail } from 'lucide-react'

export default async function OlvideContrasenaPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const { success } = await searchParams

  if (success) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Revisá tu email</CardTitle>
            <CardDescription>{success}</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/login" className="text-sm text-primary hover:underline">
              Volver al inicio de sesión
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-md">
        <form action={solicitarReset}>
          <CardHeader>
            <CardTitle>Restablecer contraseña</CardTitle>
            <CardDescription>
              Ingresá tu email y te mandamos un enlace para crear una nueva contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input id="email" name="email" type="email" required placeholder="tu@email.com" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <SubmitButton className="w-full" loadingText="Enviando...">Enviar enlace</SubmitButton>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Volver al inicio de sesión
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
