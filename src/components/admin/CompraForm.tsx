'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ProductCombobox, type ComboboxProduct } from './ProductCombobox'
import { PackagePlus } from 'lucide-react'

interface CompraFormProps {
  action: (formData: FormData) => Promise<void>
  products: ComboboxProduct[]
  today: string
}

export function CompraForm({ action, products, today }: CompraFormProps) {
  const [selectedProduct, setSelectedProduct] = useState<ComboboxProduct | null>(null)
  const [cantidad, setCantidad] = useState(1)

  function handleSelect(product: ComboboxProduct | null) {
    setSelectedProduct(product)
    setCantidad(1)
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Proveedor</label>
        <Input name="proveedor" placeholder="Ej: Textil Norte (opcional)" />
      </div>

      {/* Selector de producto */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Producto del catálogo</label>
        <ProductCombobox
          products={products}
          onSelect={handleSelect}
          placeholder="Buscar producto por nombre..."
        />
        {selectedProduct ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <PackagePlus className="h-3.5 w-3.5 text-green-600" />
            El stock pasará de {selectedProduct.stock} a{' '}
            <span className="font-semibold text-green-600">
              {selectedProduct.stock + cantidad}
            </span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mt-1">
            Si el producto no existe todavía en el catálogo, dejá vacío y crealo después.
          </p>
        )}
      </div>

      {/* Cantidad (solo si hay producto vinculado) */}
      {selectedProduct && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Cantidad comprada *</label>
          <Input
            name="cantidad"
            type="number"
            min="1"
            value={cantidad}
            onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
            required
          />
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Descripción *</label>
        <Input
          name="descripcion"
          required
          placeholder={selectedProduct ? selectedProduct.name : 'Ej: 50 remeras blancas talle M'}
          key={selectedProduct?.id ?? 'none'}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Monto (ARS) *</label>
          <Input name="monto" type="number" step="0.01" min="0" required placeholder="0.00" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Método de pago *</label>
          <select
            name="metodo_pago"
            defaultValue="efectivo"
            className="w-full h-9 px-3 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="financiada">Financiada</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Fecha *</label>
        <Input name="fecha" type="date" defaultValue={today} required />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Notas</label>
        <Input name="notas" placeholder="Ej: pago en 30 días (opcional)" />
      </div>

      <Button type="submit" className="w-full">
        Registrar compra
        {selectedProduct && ` (suma ${cantidad} al stock)`}
      </Button>
    </form>
  )
}
