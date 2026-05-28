'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { Button } from './button'
import type { ComponentProps } from 'react'

interface SubmitButtonProps extends ComponentProps<typeof Button> {
  loadingText?: string
  isPending?: boolean
}

export function SubmitButton({ children, loadingText, disabled, isPending, ...props }: SubmitButtonProps) {
  const { pending: formPending } = useFormStatus()
  const pending = isPending ?? formPending
  return (
    <Button type="submit" disabled={pending || disabled} {...props}>
      {pending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText}
        </span>
      ) : children}
    </Button>
  )
}
