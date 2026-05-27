import { createAdminClient } from '@/lib/supabase/admin'
import { updateZone } from '../../actions'
import { Button } from '@/components/ui/button'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { Input } from '@/components/ui/input'
import { ARGENTINA_PROVINCES } from '@/lib/provinces'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditarZonaPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const supabase = createAdminClient()

  const { data: zone } = await supabase.from('shipping_zones').select('*').eq('id', id).single()
  if (!zone) notFound()

  const assignedProvinces = zone.provinces as string[]

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/envios">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Editar zona</h1>
      </div>

      <div className="bg-background rounded-lg border p-6">
        <form action={updateZone} className="space-y-4">
          <input type="hidden" name="id" value={zone.id} />

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nombre de la zona</label>
            <Input name="name" defaultValue={zone.name} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Precio de envío ($)</label>
              <Input name="price" type="number" min="0" step="0.01" defaultValue={zone.price} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Envío gratis desde ($)</label>
              <Input
                name="free_shipping_threshold"
                type="number"
                min="0"
                step="0.01"
                defaultValue={zone.free_shipping_threshold ?? ''}
                placeholder="Opcional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Provincias incluidas</label>
            <div className="border border-border rounded-lg p-3 grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto">
              {ARGENTINA_PROVINCES.map((prov) => (
                <label key={prov} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary py-0.5">
                  <input
                    type="checkbox"
                    name="provinces"
                    value={prov}
                    defaultChecked={assignedProvinces.includes(prov)}
                    className="accent-primary"
                  />
                  <span>{prov}</span>
                </label>
              ))}
            </div>
          </div>

          <SubmitButton className="w-full" loadingText="Guardando...">Guardar cambios</SubmitButton>
        </form>
      </div>
    </div>
  )
}
