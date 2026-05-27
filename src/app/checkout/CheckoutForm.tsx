'use client'

import { useCartStore } from '@/store/cart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPreference, validateDiscount, DiscountResult } from './actions'
import { ARGENTINA_PROVINCES } from '@/lib/provinces'
import { Truck, CheckCircle, Tag, X, Loader2 } from 'lucide-react'

type ShippingZone = {
  id: string
  name: string
  provinces: string[]
  price: number
  free_shipping_threshold: number | null
}

function calcShipping(province: string, subtotal: number, zones: ShippingZone[]): number | null {
  const zone = zones.find((z) => z.provinces.includes(province))
  if (!zone) return null
  if (zone.free_shipping_threshold !== null && subtotal >= zone.free_shipping_threshold) return 0
  return zone.price
}

export function CheckoutForm({ zones }: { zones: ShippingZone[] }) {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [province, setProvince] = useState('')
  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<Extract<DiscountResult, { valid: true }> | null>(null)
  const { items, getTotal } = useCartStore()
  const router = useRouter()

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null
  if (items.length === 0) { router.push('/cart'); return null }

  const subtotal = getTotal()
  const shippingCost = province ? calcShipping(province, subtotal, zones) : null
  const zone = province ? zones.find((z) => z.provinces.includes(province)) ?? null : null
  const isFreeShipping = shippingCost === 0
  const discountAmount = appliedDiscount?.discountAmount ?? 0
  const total = subtotal - discountAmount + (shippingCost ?? 0)

  async function applyDiscount() {
    if (!couponInput.trim()) return
    setCouponLoading(true)
    setCouponError('')
    const result = await validateDiscount(couponInput, subtotal)
    if (result.valid) {
      setAppliedDiscount(result)
      setCouponInput('')
    } else {
      setCouponError(result.error)
    }
    setCouponLoading(false)
  }

  function removeDiscount() {
    setAppliedDiscount(null)
    setCouponError('')
  }

  async function handleSubmit(formData: FormData) {
    if (!province) { setError('Seleccioná una provincia'); return }
    if (shippingCost === null) { setError('No tenemos envío a esa provincia todavía'); return }
    setLoading(true)
    setError('')
    formData.set('province', province)
    formData.set('shippingCost', String(shippingCost))
    formData.set('discountCode', appliedDiscount?.code ?? '')
    formData.set('discountAmount', String(discountAmount))
    try {
      const response = await createPreference(formData, items)
      if (response.initPoint) window.location.href = response.initPoint
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado')
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Finalizar compra</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Datos de envío */}
        <Card>
          <CardHeader><CardTitle>Datos de envío</CardTitle></CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Provincia</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="">Seleccioná tu provincia...</option>
                  {ARGENTINA_PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {province && (
                <div className={`flex items-start gap-2.5 rounded-lg p-3 text-sm ${
                  shippingCost === null ? 'bg-red-50 border border-red-200 text-red-700'
                  : isFreeShipping ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-secondary border border-border'
                }`}>
                  {shippingCost === null ? (
                    <><Truck className="h-4 w-4 shrink-0 mt-0.5" /><span>No tenemos envíos a esa provincia todavía. Contactanos.</span></>
                  ) : isFreeShipping ? (
                    <><CheckCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>¡Envío gratis para tu pedido!</span></>
                  ) : (
                    <><Truck className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <span>Envío a <strong>{zone?.name}</strong>: <strong>${shippingCost.toLocaleString('es-AR')}</strong></span>
                      {zone?.free_shipping_threshold && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Envío gratis comprando desde ${zone.free_shipping_threshold.toLocaleString('es-AR')}
                        </p>
                      )}
                    </div></>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Dirección completa</label>
                <Input name="shippingAddress" placeholder="Calle, Número, Localidad" required />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Teléfono de contacto</label>
                <Input name="phone" type="tel" placeholder="Código de área + número" required />
              </div>

              {error && <p className="text-destructive text-sm font-medium">{error}</p>}

              <Button
                type="submit"
                size="lg"
                className="w-full mt-2"
                disabled={loading || (shippingCost === null && province !== '')}
              >
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Procesando...</> : 'Pagar con Mercado Pago'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resumen */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Resumen del pedido</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.quantity}× {item.name}</span>
                    <span className="font-medium">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                  </div>
                ))}

                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toLocaleString('es-AR')}</span>
                  </div>

                  {appliedDiscount && (
                    <div className="flex justify-between text-sm text-green-700 font-medium">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5" />
                        {appliedDiscount.code}
                      </span>
                      <span>−${discountAmount.toLocaleString('es-AR')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envío</span>
                    <span className={isFreeShipping ? 'text-green-600 font-medium' : ''}>
                      {shippingCost === null
                        ? <span className="text-muted-foreground italic">—</span>
                        : isFreeShipping ? 'Gratis'
                        : `$${shippingCost.toLocaleString('es-AR')}`
                      }
                    </span>
                  </div>

                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>${Math.max(0, total).toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cupón de descuento */}
          <Card>
            <CardContent className="pt-5">
              {appliedDiscount ? (
                <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 px-4 py-3">
                  <div className="flex items-center gap-2 text-green-800">
                    <Tag className="h-4 w-4" />
                    <div>
                      <p className="text-sm font-bold">{appliedDiscount.code}</p>
                      <p className="text-xs">
                        {appliedDiscount.type === 'percentage'
                          ? `${appliedDiscount.value}% de descuento`
                          : `$${appliedDiscount.value.toLocaleString('es-AR')} de descuento`}
                      </p>
                    </div>
                  </div>
                  <button onClick={removeDiscount} className="text-green-700 hover:text-green-900 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1.5">
                    <Tag className="h-4 w-4 text-primary" />
                    ¿Tenés un código de descuento?
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                      placeholder="Ej: VERANO25"
                      className="font-mono tracking-wider uppercase"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyDiscount())}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={applyDiscount}
                      disabled={couponLoading || !couponInput.trim()}
                    >
                      {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aplicar'}
                    </Button>
                  </div>
                  {couponError && <p className="text-destructive text-xs font-medium">{couponError}</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
