import { createAdminClient } from '@/lib/supabase/admin'
import { createDiscountCode, deleteDiscountCode, toggleDiscountCode } from './actions'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tag, Percent, DollarSign, Infinity } from 'lucide-react'

function formatValue(type: string, value: number) {
  return type === 'percentage' ? `${value}% de descuento` : `$${value.toLocaleString('es-AR')} de descuento`
}

export default async function AdminDescuentosPage() {
  const supabase = createAdminClient()
  const { data: codes } = await supabase
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Códigos de descuento</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Formulario */}
        <div className="bg-background rounded-lg border p-6">
          <h2 className="text-base font-semibold mb-4">Nuevo código</h2>
          <form action={createDiscountCode} className="space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Código</label>
                <Input
                  name="code"
                  placeholder="Ej: VERANO25"
                  className="uppercase font-mono tracking-wider"
                  style={{ textTransform: 'uppercase' }}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tipo</label>
                <select
                  name="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Monto fijo ($)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Valor del descuento</label>
              <Input name="value" type="number" min="0" step="0.01" placeholder="Ej: 20 para 20% ó 500 para $500" required />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Descripción (opcional)</label>
              <Input name="description" placeholder="Ej: Descuento primera compra" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Mínimo de compra ($)</label>
                <Input name="min_order_amount" type="number" min="0" step="0.01" placeholder="0 = sin mínimo" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Usos máximos</label>
                <Input name="max_uses" type="number" min="1" placeholder="Vacío = ilimitado" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Fecha de vencimiento (opcional)</label>
              <Input name="expires_at" type="date" />
            </div>

            <Button type="submit" className="w-full">
              <Tag className="h-4 w-4 mr-2" />
              Crear código
            </Button>
          </form>
        </div>

        {/* Lista */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold">Códigos activos</h2>

          {(!codes || codes.length === 0) ? (
            <div className="rounded-lg border bg-background p-10 text-center text-muted-foreground text-sm">
              No hay códigos de descuento todavía.
            </div>
          ) : (
            <div className="space-y-3">
              {codes.map((code) => {
                const isExpired = code.expires_at && new Date(code.expires_at) < new Date()
                const isExhausted = code.max_uses !== null && code.uses_count >= code.max_uses
                const inactive = !code.is_active || isExpired || isExhausted
                const deleteAction = deleteDiscountCode.bind(null, code.id)
                const toggleAction = toggleDiscountCode.bind(null, code.id, code.is_active)

                return (
                  <div key={code.id} className={`rounded-lg border bg-background p-4 ${inactive ? 'opacity-60' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-1.5">

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold tracking-widest text-primary text-sm">
                            {code.code}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            inactive ? 'bg-muted text-muted-foreground' : 'bg-green-100 text-green-800'
                          }`}>
                            {isExpired ? 'Vencido' : isExhausted ? 'Agotado' : code.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>

                        <p className="text-sm font-semibold flex items-center gap-1.5">
                          {code.type === 'percentage'
                            ? <><Percent className="h-3.5 w-3.5 text-primary" />{code.value}% de descuento</>
                            : <><DollarSign className="h-3.5 w-3.5 text-primary" />${Number(code.value).toLocaleString('es-AR')} de descuento</>
                          }
                        </p>

                        {code.description && (
                          <p className="text-xs text-muted-foreground">{code.description}</p>
                        )}

                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {Number(code.min_order_amount) > 0 && (
                            <span>Mínimo: ${Number(code.min_order_amount).toLocaleString('es-AR')}</span>
                          )}
                          <span className="flex items-center gap-1">
                            Usos: {code.uses_count} /&nbsp;
                            {code.max_uses === null
                              ? <Infinity className="h-3 w-3" />
                              : code.max_uses
                            }
                          </span>
                          {code.expires_at && (
                            <span>Vence: {new Date(code.expires_at).toLocaleDateString('es-AR')}</span>
                          )}
                        </div>

                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        <form action={toggleAction}>
                          <Button type="submit" variant="outline" size="sm" className="w-full text-xs">
                            {code.is_active ? 'Desactivar' : 'Activar'}
                          </Button>
                        </form>
                        <ConfirmDialog
                          title="Eliminar código"
                          description={`¿Eliminar el código "${code.code}"? No se podrá deshacer.`}
                          action={deleteAction}
                          confirmLabel="Eliminar"
                          variant="destructive"
                        >
                          <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">
                            Eliminar
                          </Button>
                        </ConfirmDialog>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
