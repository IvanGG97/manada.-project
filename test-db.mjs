import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  console.log('Fetching products...');
  const { data: products, error: pError } = await supabase.from('products').select('*');
  if (pError) console.error('Products error:', pError);
  console.log('Products count:', products?.length);
  if (products?.length > 0) {
      console.log('First product:', products[0]);
  }

  console.log('Fetching categories...');
  const { data: cats, error: cError } = await supabase.from('categories').select('*');
  if (cError) console.error('Categories error:', cError);
  console.log('Categories count:', cats?.length);
}

test();