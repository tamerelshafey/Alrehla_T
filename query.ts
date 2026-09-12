import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const { count: pkgCount } = await supabase.from('creative_writing_packages').select('*', { count: 'exact' });
  const { count: prodCount } = await supabase.from('personalized_products').select('*', { count: 'exact' });
  console.log('creative_writing_packages count:', pkgCount);
  console.log('personalized_products count:', prodCount);

  const { data: pkgs } = await supabase.from('creative_writing_packages').select('slug, name, price').order('price', { ascending: true });
  console.log('packages:', pkgs);

  const { data: prods } = await supabase.from('personalized_products').select('slug, name, price');
  console.log('products:', prods);
}

main();
