'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

function parseProductForm(formData: FormData) {
  const name = formData.get('name') as string
  const slug = (formData.get('slug') as string) || generateSlug(name)
  return {
    name,
    slug,
    description: (formData.get('description') as string) || null,
    price: parseFloat(formData.get('price') as string),
    stock: parseInt(formData.get('stock') as string),
    stock_minimo: parseInt(formData.get('stock_minimo') as string) || 0,
    category_id: (formData.get('category_id') as string) || null,
    is_active: formData.get('is_active') === 'on',
    is_featured: formData.get('is_featured') === 'on',
  }
}

function revalidateProductPaths() {
  revalidatePath('/admin/productos')
  revalidatePath('/productos')
  revalidatePath('/')
}

async function uploadImages(files: File[], productId: string): Promise<string[]> {
  const admin = createAdminClient()
  const urls: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (file.size === 0) continue

    const ext = file.name.split('.').pop() ?? 'jpg'
    const storagePath = `${productId}/${Date.now()}-${i}.${ext}`

    const { data: upload, error } = await admin.storage
      .from('product-images')
      .upload(storagePath, file, { contentType: file.type })

    if (error || !upload) continue

    const { data: { publicUrl } } = admin.storage
      .from('product-images')
      .getPublicUrl(upload.path)

    const { count } = await admin
      .from('product_images')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', productId)

    await admin.from('product_images').insert({
      product_id: productId,
      url: publicUrl,
      storage_path: upload.path,
      position: (count ?? 0) + i,
    })

    urls.push(publicUrl)
  }

  return urls
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  const data = parseProductForm(formData)

  const { data: product, error } = await supabase
    .from('products')
    .insert({ ...data, image_url: null })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  const files = (formData.getAll('images') as File[]).filter((f) => f.size > 0)
  if (files.length > 0) {
    const urls = await uploadImages(files, product.id)
    if (urls.length > 0) {
      await createAdminClient()
        .from('products')
        .update({ image_url: urls[0] })
        .eq('id', product.id)
    }
  }

  revalidateProductPaths()
  redirect('/admin/productos?success=Producto creado correctamente')
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient()
  const data = parseProductForm(formData)

  const { error } = await supabase
    .from('products')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)

  const files = (formData.getAll('images') as File[]).filter((f) => f.size > 0)
  if (files.length > 0) {
    const urls = await uploadImages(files, id)

    // Si el producto no tiene imagen principal todavía, asignar la primera subida
    if (urls.length > 0) {
      const admin = createAdminClient()
      const { data: product } = await admin
        .from('products')
        .select('image_url')
        .eq('id', id)
        .single()

      if (!product?.image_url) {
        await admin.from('products').update({ image_url: urls[0] }).eq('id', id)
      }
    }
  }

  revalidateProductPaths()
  redirect('/admin/productos?success=Producto actualizado correctamente')
}

export async function deleteProductImage(imageId: string, storagePath: string, productId: string) {
  const admin = createAdminClient()

  await admin.storage.from('product-images').remove([storagePath])
  await admin.from('product_images').delete().eq('id', imageId)

  const { data: remaining } = await admin
    .from('product_images')
    .select('url')
    .eq('product_id', productId)
    .order('position')
    .limit(1)

  await admin
    .from('products')
    .update({ image_url: remaining?.[0]?.url ?? null })
    .eq('id', productId)

  revalidateProductPaths()
  revalidatePath(`/admin/productos/${productId}/editar`)
}

export async function toggleProductActive(id: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .update({ is_active: !isActive, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidateProductPaths()
  redirect(`/admin/productos?success=Producto ${isActive ? 'desactivado' : 'activado'} correctamente`)
}
