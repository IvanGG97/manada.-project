type Props = {
  orderId: string
  firstName: string | null
  shippingAddress: string
  province: string
}

export function OrderShippedEmail({ orderId, firstName, shippingAddress, province }: Props) {
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
                    Tu pedido está en camino
                  </p>
                  <h1 style={{ margin: '8px 0 0', color: '#ffffff', fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>
                    MaNaDa
                  </h1>
                </td>
              </tr>

              {/* Ícono camión */}
              <tr>
                <td style={{ paddingTop: 32, textAlign: 'center' }}>
                  <div style={{ fontSize: 56 }}>🚚</div>
                </td>
              </tr>

              {/* Cuerpo */}
              <tr>
                <td style={{ padding: '16px 40px 0', textAlign: 'center' }}>
                  <h2 style={{ margin: 0, fontSize: 22, color: '#5A1A30', fontWeight: 700 }}>
                    ¡{firstName ? `${firstName}, tu` : 'Tu'} pedido salió! 🎉
                  </h2>
                  <p style={{ margin: '12px 0 0', fontSize: 14, color: '#8B3352', lineHeight: 1.7 }}>
                    Tu pedido <strong>#{orderNum}</strong> fue despachado y está en camino a tu domicilio.
                    Pronto lo vas a tener en tus manos.
                  </p>
                </td>
              </tr>

              {/* Dirección */}
              <tr>
                <td style={{ padding: '24px 40px 0' }}>
                  <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: '#FDF0F3', borderRadius: 10, padding: 16, border: '1px solid #E8A0B8' }}>
                    <tr>
                      <td style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#8B3352', textTransform: 'uppercase', letterSpacing: 1 }}>
                          📍 Enviando a
                        </p>
                        <p style={{ margin: '6px 0 0', fontSize: 14, color: '#5A1A30', fontWeight: 600 }}>{shippingAddress}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 13, color: '#8B3352' }}>{province}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              {/* Mensaje */}
              <tr>
                <td style={{ padding: '20px 40px 0', textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: 13, color: '#8B3352', lineHeight: 1.7 }}>
                    Los tiempos de entrega varían según la zona. Si tenés alguna consulta sobre tu envío, no dudes en contactarnos.
                  </p>
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
