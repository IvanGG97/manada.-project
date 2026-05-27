'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function solicitarReset(formData: FormData) {
  const email = formData.get('email') as string
  const supabase = await createClient()

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim()

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback?next=/nueva-contrasena`,
  })

  // Siempre mostramos éxito para no revelar si el email está registrado
  redirect('/olvide-contrasena?success=' + encodeURIComponent('Si existe una cuenta con ese email, te enviamos el enlace para restablecer tu contraseña. Revisá tu bandeja de entrada.'))
}
