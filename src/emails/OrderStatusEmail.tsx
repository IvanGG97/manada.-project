type Props = {
  orderId: string
  firstName: string | null
  status: 'preparing' | 'delivered' | 'cancelled'
}

const STATUS_CONFIG = {
  preparing: {
    icon: '📦',
    heading: '¡Estamos preparando tu pedido!',
    body: 'Recibimos tu pago y ya estamos armando tu pedido con mucho cuidado. Te avisaremos cuando esté listo para el envío.',
    bannerText: 'Tu pedido está en preparación',
  },
  delivered: {
    icon: '✅',
    heading: '¡Tu pedido fue entregado!',
    body: 'Esperamos que todo haya llegado en perfectas condiciones. ¡Gracias por comprar en MaNaDa!',
    bannerText: 'Pedido entregado',
  },
  cancelled: {
    icon: '❌',
    heading: 'Tu pedido fue cancelado',
    body: 'Tu pedido fue cancelado. Si tenés alguna consulta sobre tu compra, no dudes en contactarnos.',
    bannerText: 'Pedido cancelado',
  },
}

export function OrderStatusEmail({ orderId, firstName, status }: Props) {
  const orderNum = orderId.slice(-8).toUpperCase()
  const cfg = STATUS_CONFIG[status]

  return (
    <html lang="es">
      <head><meta charSet="utf-8" /></head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#FDF0F3', fontFamily: 'Arial, sans-serif' }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: '#FDF0F3', padding: '32px 16px' }}>
          <tr><td align="center">
            <table width="100%" style={{ maxWidth: 560, backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', border: '1px solid #E8A0B8' }}>

              <tr>
                <td style={{ background: 'linear-gradient(135deg, #C45E7A, #8B3352)', padding: '32px 40px', textAlign: 'center' }}>
                  <p style={{ margin: 0, color: '#FDE8EF', fontSize: 13, letterSpacing: 4, textTransform: 'uppercase', fontWeight: 600 }}>
                    {cfg.bannerText}
                  </p>
                  <h1 style={{ margin: '8px 0 0', color: '#ffffff', fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>
                    MaNaDa
                  </h1>
                </td>
              </tr>

              <tr>
                <td style={{ paddingTop: 32, textAlign: 'center' }}>
                  <div style={{ fontSize: 56 }}>{cfg.icon}</div>
                </td>
              </tr>

              <tr>
                <td style={{ padding: '16px 40px 0', textAlign: 'center' }}>
                  <h2 style={{ margin: 0, fontSize: 22, color: '#5A1A30', fontWeight: 700 }}>
                    {firstName ? `${firstName}, ` : ''}{cfg.heading}
                  </h2>
                  <p style={{ margin: '12px 0 0', fontSize: 14, color: '#8B3352', lineHeight: 1.7 }}>
                    Tu pedido <strong>#{orderNum}</strong>. {cfg.body}
                  </p>
                </td>
              </tr>

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
