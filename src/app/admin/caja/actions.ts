'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function crearMovimientoCaja(formData: FormData) {
  const supabase = await createClient()
  const tipo = formData.get('tipo') as 'ingreso' | 'egreso'
  const descripcion = formData.get('descripcion') as string
  const monto = parseFloat(formData.get('monto') as string)
  const metodo_pago = formData.get('metodo_pago') as string

  if (!descripcion || isNaN(monto) || monto <= 0) {
    redirect('/admin/caja?error=Completá todos los campos correctamente')
  }

  if (tipo === 'ingreso') {
    const { error } = await supabase.from('ventas_presenciales').insert({
      descripcion,
      monto,
      metodo_pago,
      fecha: new Date().toISOString(),
      notas: 'ajuste_caja',
    })
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('compras').insert({
      descripcion,
      monto,
      metodo_pago,
      fecha: new Date().toISOString(),
      notas: 'ajuste_caja',
    })
    if (error) throw new Error(error.message)
  }

  revalidatePath('/admin/caja')
  redirect(`/admin/caja?success=${tipo === 'ingreso' ? 'Ingreso' : 'Egreso'} registrado correctamente`)
}
