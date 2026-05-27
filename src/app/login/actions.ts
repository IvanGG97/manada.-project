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
    const params = returnTo ? `?error=Credenciales invalidas&returnTo=${encodeURIComponent(returnTo)}` : '?error=Credenciales invalidas'
    redirect(`/login${params}`)
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