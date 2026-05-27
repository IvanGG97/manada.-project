import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  total: number
  perPage: number
  searchParams: Record<string, string>
}

export function Pagination({ page, total, perPage, searchParams }: PaginationProps) {
  const totalPages = Math.ceil(total / perPage)
  if (totalPages <= 1) return null

  function buildHref(p: number) {
    const params = new URLSearchParams({ ...searchParams, page: String(p) })
    return `?${params.toString()}`
  }

  const from = (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)

  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <span className="text-muted-foreground text-xs">
        Mostrando {from}–{to} de {total}
      </span>
      <div className="flex items-center gap-1">
        {page > 1 ? (
          <Link
            href={buildHref(page - 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors text-xs"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Anterior
          </Link>
        ) : (
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-border text-xs opacity-40 cursor-not-allowed">
            <ChevronLeft className="h-3.5 w-3.5" />
            Anterior
          </span>
        )}

        <span className="px-3 py-1.5 text-xs font-medium">
          {page} / {totalPages}
        </span>

        {page < totalPages ? (
          <Link
            href={buildHref(page + 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors text-xs"
          >
            Siguiente
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-border text-xs opacity-40 cursor-not-allowed">
            Siguiente
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </div>
  )
}
