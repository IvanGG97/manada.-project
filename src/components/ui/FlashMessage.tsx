'use client'

import { useEffect } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
import { toast } from 'sonner'

export function FlashMessage() {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const success = searchParams.get('success')
  const error = searchParams.get('error')

  useEffect(() => {
    if (!success && !error) return

    if (success) toast.success(success)
    if (error) toast.error(error)

    const params = new URLSearchParams(searchParams.toString())
    params.delete('success')
    params.delete('error')
    const newSearch = params.toString()
    window.history.replaceState({}, '', pathname + (newSearch ? `?${newSearch}` : ''))
  }, [success, error, pathname, searchParams])

  return null
}
