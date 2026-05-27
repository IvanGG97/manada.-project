'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function register(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('firstName') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
      }
    }
  })

  if (error) {
    const msg = error.message.toLowerCase().includes('already registered')
      ? 'Ya existe una cuenta con ese email. Iniciá sesión.'
      : 'Error al crear la cuenta. Intentá de nuevo.'
    redirect(`/register?error=${encodeURIComponent(msg)}`)
  }

  // Si no hay sesión, Supabase requiere confirmación de email
  if (!data.session) {
    redirect('/login?success=' + encodeURIComponent('Te enviamos un correo de verificación. Revisá tu bandeja de entrada antes de ingresar.'))
  }

  revalidatePath('/', 'layout')
  redirect('/profile')
}
