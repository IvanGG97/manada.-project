'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ProductGalleryProps {
  images: string[]
  name: string
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0)

  return (
    <div className="flex flex-col gap-3">
      {/* Imagen principal */}
      <div className="aspect-square relative rounded-xl overflow-hidden border bg-muted">
        <Image
          key={images[selected]}
          src={images[selected]}
          alt={name}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
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
  )
}
