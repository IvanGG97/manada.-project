'use client'

import { useState, useId, forwardRef, useImperativeHandle } from 'react'
import Image from 'next/image'
import { X, ImageIcon, Loader2, Camera } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { deleteProductImage } from '@/app/admin/productos/actions'
import imageCompression from 'browser-image-compression'

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.4,
  maxWidthOrHeight: 1200,
  useWebWorker: false,
}

export interface ExistingImage {
  id: string
  url: string
  storage_path: string
}

export interface ImageManagerHandle {
  getFiles: () => File[]
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
  return imageCompression(file, COMPRESSION_OPTIONS)
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const ImageManager = forwardRef<ImageManagerHandle, ImageManagerProps>(
  function ImageManager({ productId, existingImages = [] }, ref) {
    const galleryInputId = useId()
    const cameraInputId = useId()

    // Compressed files stored in state — these are what get submitted
    const [compressedFiles, setCompressedFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const [dragging, setDragging] = useState(false)
    const [compressing, setCompressing] = useState(false)

    useImperativeHandle(ref, () => ({
      getFiles: () => compressedFiles,
    }))

    async function addFiles(rawFiles: FileList | null) {
      if (!rawFiles || rawFiles.length === 0) return
      setCompressing(true)
      try {
        const results = await Promise.all(
          Array.from(rawFiles).map(async (file) => {
            const compressed = await compressFile(file)
            const dataUrl = await readAsDataUrl(compressed)
            return { compressed, dataUrl }
          })
        )
        setCompressedFiles((prev) => [...prev, ...results.map((r) => r.compressed)])
        setPreviews((prev) => [...prev, ...results.map((r) => r.dataUrl)])
      } catch (err) {
        console.error('Error compressing image:', err)
      } finally {
        setCompressing(false)
      }
    }

    function removePreview(index: number) {
      setCompressedFiles((prev) => prev.filter((_, i) => i !== index))
      setPreviews((prev) => prev.filter((_, i) => i !== index))
    }

    const hasImages = existingImages.length > 0 || previews.length > 0

    return (
      <div className="space-y-3">

        {/* Imágenes guardadas */}
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

        {/* Previews de imágenes nuevas */}
        {previews.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {previews.map((dataUrl, i) => (
              <div key={i} className="relative aspect-square group rounded-md overflow-hidden border-2 border-dashed border-primary/40 bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dataUrl} alt="" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-primary/70 text-white py-0.5">
                  Por subir
                </span>
                <button
                  type="button"
                  onClick={() => removePreview(i)}
                  className="absolute top-1 right-1 flex items-center justify-center h-5 w-5 rounded-full bg-black/60 text-white hover:bg-black/80 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          {/* Drop zone / galería — <label> para compatibilidad iOS/Android */}
          <label
            htmlFor={galleryInputId}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
            className={`flex flex-1 flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-5 transition-colors ${
              compressing
                ? 'border-primary/40 bg-primary/5 cursor-wait'
                : dragging
                ? 'border-primary bg-primary/5 cursor-pointer'
                : 'border-border hover:border-primary/50 hover:bg-muted/40 cursor-pointer'
            }`}
          >
            {compressing ? (
              <>
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
                <p className="text-sm font-medium text-primary">Comprimiendo...</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {hasImages ? 'Agregar más' : 'Elegir imágenes'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                    JPG, PNG, WebP · se comprimen a &lt;400 KB automáticamente
                  </p>
                </div>
              </>
            )}
          </label>

          {/* Botón cámara — solo mobile */}
          <label
            htmlFor={cameraInputId}
            className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed rounded-lg px-4 py-5 border-border hover:border-primary/50 hover:bg-muted/40 cursor-pointer transition-colors sm:hidden shrink-0"
          >
            <Camera className="h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Cámara</span>
          </label>
        </div>

        {/* Estos inputs NO tienen name — los archivos NO van por el form normal */}
        <input
          id={galleryInputId}
          type="file"
          multiple
          accept="image/*"
          className="sr-only"
          onChange={(e) => addFiles(e.target.files)}
        />
        <input
          id={cameraInputId}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>
    )
  }
)
