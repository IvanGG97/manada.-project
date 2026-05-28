import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { CheckoutForm } from './CheckoutForm'

export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
  const adminSupabase = createAdminClient()
  const supabase = await createClient()

  const [{ data: zones }, { data: { user } }] = await Promise.all([
    adminSupabase.from('shipping_zones').select('*').order('price', { ascending: true }),
    supabase.auth.getUser(),
  ])

  let profileDefaults = { address: '', phone: '' }
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('address, phone')
      .eq('id', user.id)
      .single()
    profileDefaults = {
      address: profile?.address ?? '',
      phone: profile?.phone ?? '',
    }
  }

  return <CheckoutForm zones={zones ?? []} profileDefaults={profileDefaults} />
}
