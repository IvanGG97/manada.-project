'use client'

import { useState, useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from './button'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  title: string
  description: string
  action: (formData: FormData) => Promise<void>
  children: React.ReactNode
  confirmLabel?: string
  variant?: 'destructive' | 'default'
}

export function ConfirmDialog({
  title,
  description,
  action,
  children,
  confirmLabel = 'Confirmar',
  variant = 'default',
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  function handleConfirm() {
    setOpen(false)
    formRef.current?.requestSubmit()
  }

  return (
    <>
      <form ref={formRef} action={action} className="hidden" />
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>{children}</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
            <div className="flex flex-col items-center text-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${variant === 'destructive' ? 'bg-red-100' : 'bg-muted'}`}>
                <AlertTriangle className={`h-6 w-6 ${variant === 'destructive' ? 'text-red-600' : 'text-foreground'}`} />
              </div>
              <Dialog.Title className="text-base font-semibold">
                {title}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-muted-foreground">
                {description}
              </Dialog.Description>
            </div>

            <div className="mt-6 flex gap-3">
              <Dialog.Close asChild>
                <Button variant="outline" className="flex-1">
                  Cancelar
                </Button>
              </Dialog.Close>
              <Button
                onClick={handleConfirm}
                className={`flex-1 ${variant === 'destructive' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
              >
                {confirmLabel}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
