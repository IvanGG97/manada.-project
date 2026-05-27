'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { X, Upload, ImageIcon } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { deleteProductImage } from '@/app/admin/productos/actions'

export interface ExistingImage {
  id: string
  url: string
  storage_path: string
}

interface ImageManagerProps {
  productId?: string
  existingImages?: ExistingImage[]
}

function DeleteImageButton({
  imageId,
  storagePath,
  productId,
}: {
  imageId: string
  storagePath: string
  productId: string
}) {
  const action = deleteProductImage.bind(null, imageId, storagePath, productId)
  return (
    <ConfirmDialog
      title="Eliminar imagen"
      description="¿Seguro que querés eliminar esta imagen? No se puede deshacer."
      action={action}
      confirmLabel="Eliminar"
      variant="destructive"
    >
      <button
        type="button"
        className="absolute top-1 right-1 flex items-center justify-center h-5 w-5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
      >
        <X className="h-3 w-3" />
      </button>
    </ConfirmDialog>
  )
}

export function ImageManager({ productId, existingImages = [] }: ImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<{ file: File; objectUrl: string }[]>([])
  const [dragging, setDragging] = useState(false)

  function syncInput(files: File[]) {
    if (!inputRef.current) return
    const dt = new DataTransfer()
    files.forEach((f) => dt.items.add(f))
    inputRef.current.files = dt.files
  }

  function addFiles(incoming: FileList | null) {
    if (!incoming) return
    const next = [
      ...previews,
      ...Array.from(incoming).map((file) => ({
        file,
        objectUrl: URL.createObjectURL(file),
      })),
    ]
    setPreviews(next)
    syncInput(next.map((p) => p.file))
  }

  function removePreview(index: number) {
    const next = previews.filter((_, i) => i !== index)
    URL.revokeObjectURL(previews[index].objectUrl)
    setPreviews(next)
    syncInput(next.map((p) => p.file))
  }

  const hasImages = existingImages.length > 0 || previews.length > 0

  return (
    <div className="space-y-3">
      {/* Grid de imágenes existentes (en base de datos) */}
      {existingImages.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {existingImages.map((img, i) => (
            <div key={img.id} className="relative aspect-square group rounded-md overflow-hidden border bg-muted">
              <Image src={img.url} alt={`Imagen ${i + 1}`} fill className="object-cover" sizes="100px" />
              {i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-black/50 text-white py-0.5">
                  Principal
                </span>
              )}
              {productId && (
                <DeleteImageButton imageId={img.id} storagePath={img.storage_path} productId={productId} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Previews locales (nuevas, aún no subidas) */}
      {previews.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {previews.map((p, i) => (
            <div key={i} className="relative aspect-square group rounded-md overflow-hidden border-2 border-dashed border-primary/40 bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.objectUrl} alt="" className="w-full h-full object-cover" />
              <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-primary/70 text-white py-0.5">
                Por subir
              </span>
              <button
                type="button"
                onClick={() => removePreview(i)}
                className="absolute top-1 right-1 flex items-center justify-center h-5 w-5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Zona de drop */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          addFiles(e.dataTransfer.files)
        }}
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
          dragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/40'
        }`}
      >
        {hasImages ? (
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        ) : (
          <Upload className="h-8 w-8 text-muted-foreground" />
        )}
        <div className="text-center">
          <p className="text-sm font-medium">
            {hasImages ? 'Agregar más imágenes' : 'Arrastrá imágenes o hacé click'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WebP · máx. 5 MB por imagen</p>
        </div>
        <input
          ref={inputRef}
          name="images"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>
    </div>
  )
}
