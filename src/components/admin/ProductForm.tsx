'use client'

import { useRef, useTransition, useState } from 'react'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { ImageManager, type ExistingImage, type ImageManagerHandle } from './ImageManager'

interface Category { id: string; name: string }

interface ProductFormProps {
  action: (formData: FormData) => Promise<void>
  categories: Category[]
  submitLabel: string
  productId?: string
  existingImages?: ExistingImage[]
  defaultValues?: {
    name?: string
    slug?: string
    description?: string | null
    price?: number
    stock?: number
    stock_minimo?: number
    category_id?: string | null
    is_active?: boolean
    is_featured?: boolean
  }
}

export function ProductForm({ action, categories, submitLabel, productId, existingImages, defaultValues }: ProductFormProps) {
  const imageManagerRef = useRef<ImageManagerHandle>(null)
  const [isPending, startTransition] = useTransition()
  const [isCompressing, setIsCompressing] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Block submit if compression is still running
    if (imageManagerRef.current?.isCompressing()) return

    const formData = new FormData(e.currentTarget)

    // Inject compressed images — these replace any file inputs in the form
    const files = imageManagerRef.current?.getFiles() ?? []
    files.forEach((file) => formData.append('images', file))

    startTransition(async () => {
      await action(formData)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <input type="hidden" name="slug" value={defaultValues?.slug ?? ''} />

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Nombre *</label>
        <Input name="name" defaultValue={defaultValues?.name} required />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Descripción</label>
        <textarea
          name="description"
          defaultValue={defaultValues?.description ?? ''}
          rows={3}
          placeholder="Descripción del producto..."
          className="w-full px-3 py-2 text-sm border rounded-md bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Precio (ARS) *</label>
          <Input name="price" type="number" step="0.01" min="0" defaultValue={defaultValues?.price} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Stock *</label>
          <Input name="stock" type="number" min="0" defaultValue={defaultValues?.stock} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Stock mínimo</label>
          <Input
            name="stock_minimo"
            type="number"
            min="0"
            defaultValue={defaultValues?.stock_minimo ?? 0}
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground">Recibís una alerta cuando el stock baje de este número</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Categoría</label>
          <select
            name="category_id"
            defaultValue={defaultValues?.category_id ?? ''}
            className="w-full h-9 px-3 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Sin categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Imágenes</label>
        <ImageManager
          ref={imageManagerRef}
          productId={productId}
          existingImages={existingImages}
          onCompressingChange={setIsCompressing}
        />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" name="is_active" defaultChecked={defaultValues?.is_active ?? true} className="h-4 w-4" />
          Activo
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" name="is_featured" defaultChecked={defaultValues?.is_featured ?? false} className="h-4 w-4" />
          Destacado (aparece en home)
        </label>
      </div>

      <SubmitButton
        isPending={isPending || isCompressing}
        disabled={isPending || isCompressing}
        loadingText={isCompressing ? 'Comprimiendo imágenes...' : 'Guardando...'}
      >
        {submitLabel}
      </SubmitButton>
    </form>
  )
}
