import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json([])

  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('id, name, slug, image_url, price')
    .eq('is_active', true)
    .ilike('name', `%${q}%`)
    .order('name')
    .limit(6)

  return NextResponse.json(data ?? [])
}
