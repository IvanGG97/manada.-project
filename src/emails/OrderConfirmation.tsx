type Item = { name: string; quantity: number; unit_price: number }

type Props = {
  orderId: string
  firstName: string | null
  items: Item[]
  subtotal: number
  discountCode?: string | null
  discountAmount?: number
  shippingCost: number
  total: number
  shippingAddress: string
  province: string
}

export function OrderConfirmationEmail({
  orderId,
  firstName,
  items,
  subtotal,
  discountCode,
  discountAmount = 0,
  shippingCost,
  total,
  shippingAddress,
  province,
}: Props) {
  const orderNum = orderId.slice(-8).toUpperCase()

  return (
    <html lang="es">
      <head><meta charSet="utf-8" /></head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#FDF0F3', fontFamily: 'Arial, sans-serif' }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: '#FDF0F3', padding: '32px 16px' }}>
          <tr><td align="center">
            <table width="100%" style={{ maxWidth: 560, backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', border: '1px solid #E8A0B8' }}>

              {/* Header */}
              <tr>
                <td style={{ background: 'linear-gradient(135deg, #C45E7A, #8B3352)', padding: '32px 40px', textAlign: 'center' }}>
                  <p style={{ margin: 0, color: '#FDE8EF', fontSize: 13, letterSpacing: 4, textTransform: 'uppercase', fontWeight: 600 }}>
                    Tu pedido fue confirmado
                  </p>
                  <h1 style={{ margin: '8px 0 0', color: '#ffffff', fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>
                    MaNaDa
                  </h1>
                </td>
              </tr>

              {/* Saludo */}
              <tr>
                <td style={{ padding: '32px 40px 0' }}>
                  <h2 style={{ margin: 0, fontSize: 20, color: '#5A1A30', fontWeight: 700 }}>
                    ¡Gracias{firstName ? `, ${firstName}` : ''}! 🎉
                  </h2>
                  <p style={{ margin: '8px 0 0', fontSize: 14, color: '#8B3352', lineHeight: 1.6 }}>
                    Recibimos tu pedido y ya lo estamos procesando. Te avisaremos cuando salga a camino.
                  </p>
                  <p style={{ margin: '16px 0 0', display: 'inline-block', backgroundColor: '#F6D0DB', color: '#5A1A30', fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 20, letterSpacing: 1 }}>
                    Pedido #{orderNum}
                  </p>
                </td>
              </tr>

              {/* Productos */}
              <tr>
                <td style={{ padding: '24px 40px 0' }}>
                  <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#8B3352', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Productos
                  </p>
                  <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: 'collapse' }}>
                    {items.map((item, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #F6D0DB' }}>
                        <td style={{ padding: '10px 0', fontSize: 14, color: '#5A1A30' }}>
                          {item.quantity}× {item.name}
                        </td>
                        <td style={{ padding: '10px 0', fontSize: 14, color: '#5A1A30', textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          ${(item.quantity * item.unit_price).toLocaleString('es-AR')}
                        </td>
                      </tr>
                    ))}
                  </table>
                </td>
              </tr>

              {/* Totales */}
              <tr>
                <td style={{ padding: '16px 40px 0' }}>
                  <table width="100%" cellPadding={0} cellSpacing={0}>
                    <tr>
                      <td style={{ fontSize: 13, color: '#8B3352', padding: '4px 0' }}>Subtotal</td>
                      <td style={{ fontSize: 13, color: '#5A1A30', textAlign: 'right', padding: '4px 0' }}>
                        ${subtotal.toLocaleString('es-AR')}
                      </td>
                    </tr>
                    {discountAmount > 0 && (
                      <tr>
                        <td style={{ fontSize: 13, color: '#16a34a', padding: '4px 0' }}>
                          Descuento {discountCode && `(${discountCode})`}
                        </td>
                        <td style={{ fontSize: 13, color: '#16a34a', textAlign: 'right', fontWeight: 600, padding: '4px 0' }}>
                          −${discountAmount.toLocaleString('es-AR')}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ fontSize: 13, color: '#8B3352', padding: '4px 0' }}>Envío</td>
                      <td style={{ fontSize: 13, color: '#5A1A30', textAlign: 'right', padding: '4px 0' }}>
                        {shippingCost === 0 ? 'Gratis' : `$${shippingCost.toLocaleString('es-AR')}`}
                      </td>
                    </tr>
                    <tr style={{ borderTop: '2px solid #E8A0B8' }}>
                      <td style={{ fontSize: 16, fontWeight: 700, color: '#5A1A30', paddingTop: 10 }}>Total</td>
                      <td style={{ fontSize: 16, fontWeight: 700, color: '#C45E7A', textAlign: 'right', paddingTop: 10 }}>
                        ${total.toLocaleString('es-AR')}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              {/* Envío */}
              <tr>
                <td style={{ padding: '24px 40px 0' }}>
                  <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: '#FDF0F3', borderRadius: 10, padding: 16, border: '1px solid #E8A0B8' }}>
                    <tr>
                      <td>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#8B3352', textTransform: 'uppercase', letterSpacing: 1 }}>
                          📦 Dirección de envío
                        </p>
                        <p style={{ margin: '6px 0 0', fontSize: 14, color: '#5A1A30' }}>{shippingAddress}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 13, color: '#8B3352' }}>{province}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              {/* Footer */}
              <tr>
                <td style={{ padding: '32px 40px', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: 12, color: '#8B3352' }}>
                    ¿Tenés alguna pregunta? Respondé este email y te ayudamos.
                  </p>
                  <p style={{ margin: '8px 0 0', fontSize: 11, color: '#E8A0B8' }}>
                    MaNaDa · Artículos de temporada
                  </p>
                </td>
              </tr>

            </table>
          </td></tr>
        </table>
      </body>
    </html>
  )
}
