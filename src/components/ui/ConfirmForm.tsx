'use client'

interface ConfirmFormProps {
  message: string
  action: (formData: FormData) => Promise<void>
  children: React.ReactNode
  className?: string
}

export function ConfirmForm({ message, action, children, className }: ConfirmFormProps) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(e) => {
        if (!window.confirm(message)) e.preventDefault()
      }}
    >
      {children}
    </form>
  )
}
