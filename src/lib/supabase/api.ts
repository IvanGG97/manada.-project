import { createClient } from './server'

export async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase.from('categories').select('*').order('name')
  return data || []
}

export async function getProducts(options?: { featured?: boolean; categoryId?: string; search?: string }) {
  const supabase = await createClient()
  let query = supabase.from('products').select(`
    *,
    categories (
      name,
      slug
    )
  `).eq('is_active', true).order('created_at', { ascending: false })

  if (options?.featured) {
    query = query.eq('is_featured', true)
  }
  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId)
  }
  if (options?.search) {
    query = query.ilike('name', `%${options.search}%`)
  }

  const { data } = await query
  return data || []
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('products').select(`
    *,
    categories (
      name,
      slug
    )
  `).eq('slug', slug).single()
  return data
}
