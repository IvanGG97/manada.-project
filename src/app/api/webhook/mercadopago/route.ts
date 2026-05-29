import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createAdminClient } from '@/lib/supabase/admin'

const MP_STATUS_MAP: Record<string, string> = {
  approved: 'paid',
  rejected: 'cancelled',
  cancelled: 'cancelled',
  refunded: 'cancelled',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.type !== 'payment' || !body.data?.id) {
      return NextResponse.json({ received: true })
    }

    const paymentId = Number(body.data.id)
    if (isNaN(paymentId)) {
      return NextResponse.json({ error: 'Invalid payment id' }, { status: 400 })
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    })

    const paymentClient = new Payment(client)
    const payment = await paymentClient.get({ id: paymentId })

    const orderId = payment.external_reference
    if (!orderId) {
      return NextResponse.json({ error: 'No external_reference in payment' }, { status: 400 })
    }

    const newStatus = MP_STATUS_MAP[payment.status ?? ''] ?? 'pending'
    const supabase = createAdminClient()

    // Leer el estado actual ANTES de actualizar (para idempotencia)
    const { data: currentOrder } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single()

    const { error } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        payment_id: String(payment.id),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
    }

    // Solo ejecutar efectos secundarios si el estado CAMBIA a paid
    // (evita descontar stock o registrar ventas si el webhook llega duplicado)
    const transicionandoAPagado = newStatus === 'paid' && currentOrder?.status !== 'paid'

    if (transicionandoAPagado) {
      // 1. Descontar stock atómicamente
      // La función SQL usa GREATEST(0, stock - cantidad) para nunca ir a negativo
      // y desactiva el producto automáticamente si el stock llega a 0
      const { error: stockError } = await supabase.rpc('deduct_order_stock', {
        p_order_id: orderId,
      })
      if (stockError) {
        console.error('Error descontando stock:', stockError)
      }

      // 2. Registrar en ventas_presenciales (idempotente por notas)
      const ventaRef = `mp_order:${orderId}`
      const { count } = await supabase
        .from('ventas_presenciales')
        .select('id', { count: 'exact', head: true })
        .eq('notas', ventaRef)

      if (!count || count === 0) {
        const { data: order } = await supabase
          .from('orders')
          .select('total_amount, created_at')
          .eq('id', orderId)
          .single()

        if (order) {
          await supabase.from('ventas_presenciales').insert({
            descripcion: `Venta online #${orderId.slice(-8).toUpperCase()}`,
            monto: order.total_amount,
            metodo_pago: 'mercadopago',
            fecha: order.created_at,
            notas: ventaRef,
          })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
