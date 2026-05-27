'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { X, Upload, ImageIcon, Loader2 } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { deleteProductImage } from '@/app/admin/productos/actions'
import imageCompression from 'browser-image-compression'

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.4,
  maxWidthOrHeight: 1200,
  useWebWorker: false, // false = más compatible (funciona en LAN, HTTP, cualquier device)
}

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
        className="absolute top-1 right-1 flex items-center justify-center h-5 w-5 rounded-full bg-black/60 text-white transition-opacity hover:bg-black/80 opacity-100 md:opacity-0 md:group-hover:opacity-100"
      >
        <X className="h-3 w-3" />
      </button>
    </ConfirmDialog>
  )
}

async function compressFile(file: File): Promise<File> {
  try {
    return await imageCompression(file, COMPRESSION_OPTIONS)
  } catch {
    return file // si la compresión falla, usar el archivo original
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function ImageManager({ productId, existingImages = [] }: ImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<{ file: File; dataUrl: string }[]>([])
  const [dragging, setDragging] = useState(false)
  const [compressing, setCompressing] = useState(false)

  function syncInput(files: File[]) {
    if (!inputRef.current) return
    try {
      const dt = new DataTransfer()
      files.forEach((f) => dt.items.add(f))
      inputRef.current.files = dt.files
    } catch {
      // DataTransfer no soportado; los archivos del input nativo se mantienen
    }
  }

  async function addFiles(incoming: FileList | null) {
    if (!incoming || incoming.length === 0) return
    setCompressing(true)
    try {
      const loaded = await Promise.all(
        Array.from(incoming).map(async (file) => {
          const compressed = await compressFile(file)
          const dataUrl = await readAsDataUrl(compressed)
          return { file: compressed, dataUrl }
        })
      )
      setPreviews((prev) => {
        const next = [...prev, ...loaded]
        syncInput(next.map((p) => p.file))
        return next
      })
    } catch {
      // error inesperado — no bloquear la UI
    } finally {
      setCompressing(false)
      // limpiar el input para permitir seleccionar el mismo archivo de nuevo
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function removePreview(index: number) {
    setPreviews((prev) => {
      const next = prev.filter((_, i) => i !== index)
      syncInput(next.map((p) => p.file))
      return next
    })
  }

  const hasImages = existingImages.length > 0 || previews.length > 0

  return (
    <div className="space-y-3">

      {/* Imágenes guardadas en base de datos */}
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

      {/* Previews de nuevas imágenes (pendientes de subir) */}
      {previews.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {previews.map((p, i) => (
            <div key={i} className="relative aspect-square group rounded-md overflow-hidden border-2 border-dashed border-primary/40 bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.dataUrl} alt="" className="w-full h-full object-cover" />
              <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-primary/70 text-white py-0.5">
                Por subir
              </span>
              <button
                type="button"
                onClick={() => removePreview(i)}
                className="absolute top-1 right-1 flex items-center justify-center h-5 w-5 rounded-full bg-black/60 text-white transition-opacity hover:bg-black/80 opacity-100 md:opacity-0 md:group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Zona de carga */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => !compressing && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !compressing && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 transition-colors ${
          compressing
            ? 'border-primary/40 bg-primary/5 cursor-wait'
            : dragging
            ? 'border-primary bg-primary/5 cursor-pointer'
            : 'border-border hover:border-primary/50 hover:bg-muted/40 cursor-pointer'
        }`}
      >
        {compressing ? (
          <>
            <Loader2 className="h-7 w-7 text-primary animate-spin" />
            <p className="text-sm font-medium text-primary">Comprimiendo imágenes...</p>
          </>
        ) : (
          <>
            {hasImages
              ? <ImageIcon className="h-6 w-6 text-muted-foreground" />
              : <Upload className="h-8 w-8 text-muted-foreground" />
            }
            <div className="text-center">
              <p className="text-sm font-medium">
                {hasImages ? 'Agregar más imágenes' : 'Arrastrá imágenes o hacé click'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WebP · se comprimen automáticamente</p>
            </div>
          </>
        )}
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
