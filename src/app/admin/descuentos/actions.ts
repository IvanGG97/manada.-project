'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createDiscountCode(formData: FormData) {
  const supabase = createAdminClient()

  const code = (formData.get('code') as string).trim().toUpperCase()
  const description = (formData.get('description') as string).trim() || null
  const type = formData.get('type') as string
  const value = parseFloat(formData.get('value') as string)
  const minRaw = formData.get('min_order_amount') as string
  const maxUsesRaw = formData.get('max_uses') as string
  const expiresRaw = formData.get('expires_at') as string

  const { error } = await supabase.from('discount_codes').insert({
    code,
    description,
    type,
    value,
    min_order_amount: minRaw ? parseFloat(minRaw) : 0,
    max_uses: maxUsesRaw ? parseInt(maxUsesRaw) : null,
    expires_at: expiresRaw ? new Date(expiresRaw).toISOString() : null,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/admin/descuentos')
  redirect('/admin/descuentos?success=Código creado correctamente')
}

export async function deleteDiscountCode(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('discount_codes').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/descuentos')
  redirect('/admin/descuentos?success=Código eliminado')
}

export async function toggleDiscountCode(id: string, current: boolean) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('discount_codes')
    .update({ is_active: !current })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/descuentos')
}
