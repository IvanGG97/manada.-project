'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function register(formData: FormData) {
  const supabase = await createClient()

  const email    = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('firstName') as string
  const lastName  = (formData.get('lastName') as string | null)?.trim() || null
  const phone     = (formData.get('phone') as string | null)?.trim() || null
  const address   = (formData.get('address') as string | null)?.trim() || null

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName }
    }
  })

  if (error) {
    const msg = error.message.toLowerCase().includes('already registered')
      ? 'Ya existe una cuenta con ese email. Iniciá sesión.'
      : 'Error al crear la cuenta. Intentá de nuevo.'
    redirect('/register?error=' + encodeURIComponent(msg))
  }

  if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
    redirect('/register?error=' + encodeURIComponent('Ya existe una cuenta con ese email. Iniciá sesión.'))
  }

  // Guardar los campos extra en profiles usando service role (no depende de la sesión)
  if (data.user) {
    const admin = createAdminClient()
    await admin.from('profiles').upsert({
      id: data.user.id,
      first_name: firstName,
      last_name: lastName,
      phone,
      address,
    })
  }

  if (!data.session) {
    redirect('/login?success=' + encodeURIComponent('Te enviamos un correo de verificación. Revisá tu bandeja de entrada antes de ingresar.'))
  }

  revalidatePath('/', 'layout')
  redirect('/profile')
}
