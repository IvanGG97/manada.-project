'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const returnTo = formData.get('returnTo') as string | null

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    const msg = error.message.toLowerCase().includes('email not confirmed')
      ? 'Verificá tu email antes de ingresar. Revisá tu bandeja de entrada.'
      : 'Email o contraseña incorrectos.'
    const params = new URLSearchParams({ error: msg })
    if (returnTo) params.set('returnTo', returnTo)
    redirect(`/login?${params}`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  revalidatePath('/', 'layout')

  if (returnTo && returnTo.startsWith('/')) {
    redirect(returnTo)
  }

  redirect(profile?.role === 'admin' ? '/admin' : '/profile')
}