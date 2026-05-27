'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

interface ProductGalleryProps {
  images: string[]
  name: string
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const prev = useCallback(() => setSelected((s) => (s - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setSelected((s) => (s + 1) % images.length), [images.length])

  useEffect(() => {
    if (!lightbox) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, prev, next])

  // Bloquear scroll cuando el lightbox está abierto
  useEffect(() => {
    document.body.style.overflow = lightbox ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightbox])

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Imagen principal — clickeable para zoom */}
        <div
          className="aspect-square relative rounded-xl overflow-hidden border bg-muted cursor-zoom-in group"
          onClick={() => setLightbox(true)}
        >
          <Image
            key={images[selected]}
            src={images[selected]}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 flex items-end justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-black/50 text-white rounded-full p-1.5">
              <ZoomIn className="h-4 w-4" />
            </span>
          </div>
        </div>

        {/* Miniaturas */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => setSelected(i)}
                className={`relative h-16 w-16 shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                  i === selected ? 'border-primary' : 'border-border hover:border-muted-foreground'
                }`}
              >
                <Image src={url} alt={`${name} ${i + 1}`} fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          {/* Imagen */}
          <div
            className="relative w-full h-full max-w-4xl max-h-[90vh] m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={images[selected]}
              src={images[selected]}
              alt={name}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Cerrar */}
          <button
            className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors"
            onClick={() => setLightbox(false)}
          >
            <X className="h-5 w-5" />
          </button>

          {/* Flechas — solo si hay varias imágenes */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors"
                onClick={(e) => { e.stopPropagation(); prev() }}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors"
                onClick={(e) => { e.stopPropagation(); next() }}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              {/* Contador */}
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                {selected + 1} / {images.length}
              </span>
            </>
          )}
        </div>
      )}
    </>
  )
}
