'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const description = (formData.get('description') as string) || null
  const slug = (formData.get('slug') as string) || generateSlug(name)

  const { error } = await supabase.from('categories').insert({ name, slug, description })
  if (error) throw new Error(error.message)

  revalidatePath('/admin/categorias')
  revalidatePath('/productos')
  redirect('/admin/categorias?success=Categoría creada correctamente')
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()

  const { count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)

  if (count && count > 0) {
    redirect('/admin/categorias?error=La categoría tiene productos asociados y no puede eliminarse')
  }

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) redirect('/admin/categorias?error=No se pudo eliminar la categoría')

  revalidatePath('/admin/categorias')
  revalidatePath('/productos')
  redirect('/admin/categorias?success=Categoría eliminada correctamente')
}

