'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createZone(formData: FormData) {
  const supabase = createAdminClient()

  const name = (formData.get('name') as string).trim()
  const price = parseFloat(formData.get('price') as string)
  const thresholdRaw = formData.get('free_shipping_threshold') as string
  const free_shipping_threshold = thresholdRaw ? parseFloat(thresholdRaw) : null
  const provinces = formData.getAll('provinces') as string[]

  const { error } = await supabase
    .from('shipping_zones')
    .insert({ name, price, free_shipping_threshold, provinces })

  if (error) throw new Error(error.message)

  revalidatePath('/admin/envios')
  redirect('/admin/envios?success=Zona creada correctamente')
}

export async function deleteZone(id: string) {
  const supabase = createAdminClient()

  const { error } = await supabase.from('shipping_zones').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/envios')
  redirect('/admin/envios?success=Zona eliminada')
}

export async function updateZone(formData: FormData) {
  const supabase = createAdminClient()

  const id = formData.get('id') as string
  const name = (formData.get('name') as string).trim()
  const price = parseFloat(formData.get('price') as string)
  const thresholdRaw = formData.get('free_shipping_threshold') as string
  const free_shipping_threshold = thresholdRaw ? parseFloat(thresholdRaw) : null
  const provinces = formData.getAll('provinces') as string[]

  const { error } = await supabase
    .from('shipping_zones')
    .update({ name, price, free_shipping_threshold, provinces })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/envios')
  redirect('/admin/envios?success=Zona actualizada correctamente')
}
