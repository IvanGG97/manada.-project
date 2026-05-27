'use server'

import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { CartItem } from '@/store/cart'

export type DiscountResult =
  | { valid: true; code: string; type: 'percentage' | 'fixed'; value: number; discountAmount: number; description: string | null }
  | { valid: false; error: string }

export async function validateDiscount(code: string, subtotal: number): Promise<DiscountResult> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .eq('is_active', true)
    .single()

  if (!data) return { valid: false, error: 'Código de descuento inválido' }

  if (data.expires_at && new Date(data.expires_at) < new Date())
    return { valid: false, error: 'Este código ya venció' }

  if (data.max_uses !== null && data.uses_count >= data.max_uses)
    return { valid: false, error: 'Este código ya alcanzó el límite de usos' }

  if (Number(data.min_order_amount) > 0 && subtotal < Number(data.min_order_amount))
    return { valid: false, error: `Monto mínimo para este código: $${Number(data.min_order_amount).toLocaleString('es-AR')}` }

  const discountAmount = data.type === 'percentage'
    ? Math.round(subtotal * data.value / 100)
    : Math.min(Number(data.value), subtotal)

  return { valid: true, code: data.code, type: data.type, value: data.value, discountAmount, description: data.description }
}

export async function createPreference(formData: FormData, cartItems: CartItem[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Debes iniciar sesión para comprar')
  }

  const shippingAddress = formData.get('shippingAddress') as string
  const phone = formData.get('phone') as string
  const province = formData.get('province') as string
  const shippingCost = parseFloat(formData.get('shippingCost') as string) || 0
  const discountCode = (formData.get('discountCode') as string) || null
  const discountAmount = parseFloat(formData.get('discountAmount') as string) || 0

  if (!shippingAddress || !phone || !province) {
    throw new Error('Faltan datos de envío')
  }

  // 1. Calculate total
  const productsTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const totalAmount = Math.max(0, productsTotal - discountAmount + shippingCost)

  // 2. Create Order in Supabase
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      total_amount: totalAmount,
      shipping_address: shippingAddress,
      shipping_cost: shippingCost,
      province,
      discount_code: discountCode,
      discount_amount: discountAmount,
      status: 'pending'
    })
    .select()
    .single()

  if (orderError || !order) {
    console.error('Error creating order:', orderError)
    throw new Error('Error al crear la orden')
  }

  // 3. Create Order Items
  const orderItemsData = cartItems.map(item => ({
    order_id: order.id,
    product_id: item.id,
    quantity: item.quantity,
    unit_price: item.price
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsData)

  if (itemsError) {
    console.error('Error creating order items:', itemsError)
    throw new Error('Error al guardar los items de la orden')
  }

  // 4. Update user profile with phone/address if needed
  await supabase.from('profiles').update({
    phone: phone,
    address: shippingAddress
  }).eq('id', user.id)

  // 5. Increment discount code usage
  if (discountCode) {
    const admin = createAdminClient()
    await admin.rpc('increment_discount_uses', { p_code: discountCode })
  }

  // 6. Send order confirmation email (non-blocking)
  try {
    const { resend, FROM_EMAIL } = await import('@/lib/resend')
    const { OrderConfirmationEmail } = await import('@/emails/OrderConfirmation')
    const { data: profile } = await supabase.from('profiles').select('first_name').eq('id', user.id).single()
    const productsSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email!,
      subject: `✅ Pedido confirmado #${order.id.slice(-8).toUpperCase()} — MaNaDa`,
      react: OrderConfirmationEmail({
        orderId: order.id,
        firstName: profile?.first_name ?? null,
        items: cartItems.map(i => ({ name: i.name, quantity: i.quantity, unit_price: i.price })),
        subtotal: productsSubtotal,
        discountCode,
        discountAmount,
        shippingCost,
        total: totalAmount,
        shippingAddress,
        province,
      }),
    })
  } catch (emailError) {
    console.error('Error sending confirmation email:', emailError)
  }

  // 7. Initialize Mercado Pago
  const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! })
  const preference = new Preference(client)

  // 6. Generate MP Preference
  let appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  // Asegurarnos de que la URL tenga el protocolo correcto
  if (!appUrl.startsWith('http://') && !appUrl.startsWith('https://')) {
    appUrl = `https://${appUrl}`
  }
  // Quitar la barra diagonal final si la tiene para evitar URLs como https://dominio.com//checkout
  if (appUrl.endsWith('/')) {
    appUrl = appUrl.slice(0, -1)
  }

  try {
    const payload = {
      body: {
        // MP no soporta precios negativos, si hay descuento enviamos resumen único
        items: discountAmount > 0 ? [{
          id: 'compra',
          title: 'Compra en MaNaDa',
          quantity: 1,
          unit_price: totalAmount,
          currency_id: 'ARS',
        }] : [
          ...cartItems.map(item => ({
            id: String(item.id),
            title: item.name,
            quantity: Number(item.quantity),
            unit_price: Number(item.price),
            currency_id: 'ARS',
            picture_url: item.image_url || undefined,
          })),
          ...(shippingCost > 0 ? [{
            id: 'envio',
            title: `Envío a ${province}`,
            quantity: 1,
            unit_price: shippingCost,
            currency_id: 'ARS',
          }] : []),
        ],
        payer: {
          email: user.email,
        },
        back_urls: {
          success: `${appUrl}/checkout/success`,
          failure: `${appUrl}/checkout/failure`,
          pending: `${appUrl}/checkout/pending`,
        },
        notification_url: appUrl.includes('localhost')
          ? undefined
          : `${appUrl}/api/webhook/mercadopago`,
        auto_return: appUrl.includes('localhost') ? undefined : 'approved',
        external_reference: String(order.id),
        statement_descriptor: 'MANADA ECOMMERCE',
      }
    };
    console.log("MP Preference Payload:", JSON.stringify(payload, null, 2));
    const response = await preference.create(payload)

    return { initPoint: response.init_point }
  } catch (error: any) {
    console.error('MercadoPago Error General:', error?.message || error)
    if (error?.cause) console.error('Detalle de Validación MP:', JSON.stringify(error.cause, null, 2))
    throw new Error('Error al inicializar el pago con Mercado Pago')
  }
}