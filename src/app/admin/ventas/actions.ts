'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createVenta(formData: FormData) {
  const supabase = await createClient()

  const productId = (formData.get('product_id') as string) || null
  const cantidad = productId ? (parseInt(formData.get('cantidad') as string) || 1) : null
  const fechaStr = formData.get('fecha') as string

  const { error } = await supabase.from('ventas_presenciales').insert({
    descripcion: formData.get('descripcion') as string,
    monto: parseFloat(formData.get('monto') as string),
    metodo_pago: formData.get('metodo_pago') as string,
    notas: (formData.get('notas') as string) || null,
    fecha: fechaStr ? new Date(fechaStr).toISOString() : new Date().toISOString(),
    product_id: productId,
    cantidad,
  })

  if (error) throw new Error(error.message)

  // Decrementar stock si hay producto vinculado
  if (productId && cantidad) {
    const admin = createAdminClient()
    const { data: product } = await admin
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single()

    if (product) {
      const nuevoStock = Math.max(0, product.stock - cantidad)
      await admin
        .from('products')
        .update({ stock: nuevoStock, updated_at: new Date().toISOString() })
        .eq('id', productId)
    }
  }

  revalidatePath('/admin/ventas')
  revalidatePath('/admin/caja')
  revalidatePath('/admin/productos')
  revalidatePath('/productos')
  redirect('/admin/ventas?success=Venta registrada y stock actualizado')
}
