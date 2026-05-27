import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { FlashMessage } from '@/components/ui/FlashMessage'
import { Suspense } from 'react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  // Calcular productos con stock bajo
  const { data: stockData } = await supabase
    .from('products')
    .select('stock, stock_minimo')
    .gt('stock_minimo', 0)

  const lowStockCount = stockData?.filter((p) => p.stock < (p.stock_minimo ?? 0)).length ?? 0

  return (
    <div className="flex flex-1 overflow-hidden">
      <AdminSidebar lowStockCount={lowStockCount} />
      <main className="flex-1 overflow-y-auto bg-muted/30 p-8">
        {children}
      </main>
      <Suspense>
        <FlashMessage />
      </Suspense>
    </div>
  )
}
