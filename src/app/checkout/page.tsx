import { createAdminClient } from '@/lib/supabase/admin'
import { CheckoutForm } from './CheckoutForm'

export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
  const supabase = createAdminClient()
  const { data: zones } = await supabase
    .from('shipping_zones')
    .select('*')
    .order('price', { ascending: true })

  return <CheckoutForm zones={zones ?? []} />
}
