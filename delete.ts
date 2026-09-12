import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  await supabase.from('personalized_products').delete().eq('owner_type', 'publisher');
  const { count: prodCount } = await supabase.from('personalized_products').select('*', { count: 'exact' });
  console.log('personalized_products count:', prodCount);
}
main();
