'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ProductCombobox, type ComboboxProduct } from './ProductCombobox'
import { PackageMinus } from 'lucide-react'

interface VentaFormProps {
  action: (formData: FormData) => Promise<void>
  products: ComboboxProduct[]
  today: string
}

export function VentaForm({ action, products, today }: VentaFormProps) {
  const [selectedProduct, setSelectedProduct] = useState<ComboboxProduct | null>(null)
  const [cantidad, setCantidad] = useState(1)

  function handleSelect(product: ComboboxProduct | null) {
    setSelectedProduct(product)
    setCantidad(1)
  }

  const sinStock = selectedProduct && selectedProduct.stock === 0
  const stockInsuficiente = selectedProduct && cantidad > selectedProduct.stock

  return (
    <form action={action} className="space-y-4">
      {/* Selector de producto */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Producto del catálogo</label>
        <ProductCombobox
          products={products}
          onSelect={handleSelect}
          placeholder="Buscar producto por nombre..."
        />
        {selectedProduct && (
          <div className={`flex items-center gap-1.5 text-xs mt-1 ${sinStock ? 'text-red-600' : 'text-muted-foreground'}`}>
            <PackageMinus className="h-3.5 w-3.5" />
            {sinStock
              ? 'Este producto no tiene stock disponible'
              : `Stock actual: ${selectedProduct.stock} unidades`}
          </div>
        )}
      </div>

      {/* Cantidad (solo si hay producto) */}
      {selectedProduct && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Cantidad vendida *</label>
          <Input
            name="cantidad"
            type="number"
            min="1"
            max={selectedProduct.stock}
            value={cantidad}
            onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
            required
          />
          {stockInsuficiente && (
            <p className="text-xs text-red-600">
              La cantidad supera el stock disponible ({selectedProduct.stock})
            </p>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Descripción *</label>
        <Input
          name="descripcion"
          required
          placeholder={selectedProduct ? selectedProduct.name : 'Ej: Remera + pantalón'}
          defaultValue=""
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
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Fecha *</label>
        <Input name="fecha" type="date" defaultValue={today} required />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Notas</label>
        <Input name="notas" placeholder="Opcional" />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!!sinStock || !!stockInsuficiente}
      >
        Registrar venta
        {selectedProduct && ` (descuenta ${cantidad} del stock)`}
      </Button>
    </form>
  )
}
