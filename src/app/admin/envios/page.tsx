import { createAdminClient } from '@/lib/supabase/admin'
import { createZone, deleteZone } from './actions'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { Input } from '@/components/ui/input'
import { ARGENTINA_PROVINCES } from '@/lib/provinces'
import { Pencil, Truck } from 'lucide-react'
import Link from 'next/link'

export default async function AdminEnviosPage() {
  const supabase = createAdminClient()
  const { data: zones } = await supabase
    .from('shipping_zones')
    .select('*')
    .order('price', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Zonas de envío</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Formulario nueva zona */}
        <div className="bg-background rounded-lg border p-6">
          <h2 className="text-base font-semibold mb-4">Nueva zona</h2>
          <form action={createZone} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nombre de la zona</label>
              <Input name="name" placeholder="Ej: GBA, Interior, Local" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Precio de envío ($)</label>
                <Input name="price" type="number" min="0" step="0.01" placeholder="0" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Envío gratis desde ($)</label>
                <Input name="free_shipping_threshold" type="number" min="0" step="0.01" placeholder="Opcional" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Provincias incluidas</label>
              <div className="border border-border rounded-lg p-3 grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto">
                {ARGENTINA_PROVINCES.map((prov) => (
                  <label key={prov} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary py-0.5">
                    <input type="checkbox" name="provinces" value={prov} className="accent-primary" />
                    <span>{prov}</span>
                  </label>
                ))}
              </div>
            </div>

            <SubmitButton className="w-full" loadingText="Creando...">
              <Truck className="h-4 w-4 mr-2" />
              Crear zona
            </SubmitButton>
          </form>
        </div>

        {/* Lista de zonas */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold">Zonas configuradas</h2>

          {(!zones || zones.length === 0) ? (
            <div className="rounded-lg border bg-background p-10 text-center text-muted-foreground text-sm">
              No hay zonas configuradas todavía.
            </div>
          ) : (
            <div className="space-y-3">
              {zones.map((zone) => {
                const deleteAction = deleteZone.bind(null, zone.id)
                return (
                  <div key={zone.id} className="rounded-lg border bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{zone.name}</p>
                          <span className="text-sm font-bold text-primary">
                            ${Number(zone.price).toLocaleString('es-AR')}
                          </span>
                          {zone.free_shipping_threshold && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                              Gratis desde ${Number(zone.free_shipping_threshold).toLocaleString('es-AR')}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(zone.provinces as string[]).map((p) => (
                            <span key={p} className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                              {p}
                            </span>
                          ))}
                          {zone.provinces.length === 0 && (
                            <span className="text-xs text-muted-foreground italic">Sin provincias asignadas</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/admin/envios/${zone.id}/editar`}>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Pencil className="h-3.5 w-3.5" />Editar
                          </Button>
                        </Link>
                        <ConfirmDialog
                          title="Eliminar zona"
                          description={`¿Eliminar la zona "${zone.name}"? Esta acción no se puede deshacer.`}
                          action={deleteAction}
                          confirmLabel="Eliminar"
                          variant="destructive"
                        >
                          <Button variant="ghost" size="sm" className="text-muted-foreground">
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
