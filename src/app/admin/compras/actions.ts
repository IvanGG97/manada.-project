'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createCompra(formData: FormData) {
  const supabase = await createClient()

  const productId = (formData.get('product_id') as string) || null
  const cantidad = productId ? (parseInt(formData.get('cantidad') as string) || 1) : null
  const fechaStr = formData.get('fecha') as string

  const { error } = await supabase.from('compras').insert({
    proveedor: (formData.get('proveedor') as string) || null,
    descripcion: formData.get('descripcion') as string,
    monto: parseFloat(formData.get('monto') as string),
    metodo_pago: formData.get('metodo_pago') as string,
    notas: (formData.get('notas') as string) || null,
    fecha: fechaStr ? new Date(fechaStr).toISOString() : new Date().toISOString(),
    product_id: productId,
    cantidad,
  })

  if (error) throw new Error(error.message)

  // Incrementar stock si hay producto vinculado
  if (productId && cantidad) {
    const admin = createAdminClient()
    const { data: product } = await admin
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single()

    if (product) {
      await admin
        .from('products')
        .update({ stock: product.stock + cantidad, updated_at: new Date().toISOString() })
        .eq('id', productId)
    }
  }

  revalidatePath('/admin/compras')
  revalidatePath('/admin/caja')
  revalidatePath('/admin/productos')
  revalidatePath('/productos')
  redirect('/admin/compras?success=Compra registrada y stock actualizado')
}
