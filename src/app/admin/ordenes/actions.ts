'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const NON_REVERTIBLE = new Set(['paid', 'preparing', 'shipped', 'delivered'])

export async function updateOrderStatus(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const status = formData.get('status') as string

  const { data: current } = await supabase
    .from('orders')
    .select('status')
    .eq('id', id)
    .single()

  if (current && NON_REVERTIBLE.has(current.status) && status === 'pending') {
    redirect('/admin/ordenes?error=No se puede volver a pendiente una vez que el pago fue confirmado')
  }

  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)

  // Enviar email de envío cuando el estado cambia a "shipped"
  if (status === 'shipped') {
    try {
      const admin = createAdminClient()
      const { data: order } = await admin
        .from('orders')
        .select('id, shipping_address, province, user_id, profiles(first_name)')
        .eq('id', id)
        .single()

      if (order) {
        const { data: authUser } = await admin.auth.admin.getUserById(order.user_id)
        const email = authUser?.user?.email
        if (email) {
          const { resend, FROM_EMAIL } = await import('@/lib/resend')
          const { OrderShippedEmail } = await import('@/emails/OrderShipped')
          const { renderToStaticMarkup } = await import('react-dom/server')
          const { createElement } = await import('react')
          const profile = order.profiles as unknown as { first_name: string | null } | null
          const html = renderToStaticMarkup(
            createElement(OrderShippedEmail, {
              orderId: order.id,
              firstName: profile?.first_name ?? null,
              shippingAddress: order.shipping_address ?? '',
              province: order.province ?? '',
            })
          )
          await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: `🚚 Tu pedido #${order.id.slice(-8).toUpperCase()} está en camino — MaNaDa`,
            html,
          })
        }
      }
    } catch (emailError) {
      console.error('Error sending shipped email:', emailError)
    }
  }

  revalidatePath('/admin/ordenes')
  redirect('/admin/ordenes?success=Estado de la orden actualizado')
}
