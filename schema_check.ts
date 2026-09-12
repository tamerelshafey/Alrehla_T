import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function main() {
  const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseAnonKey}`);
  const data = await res.json();
  const schemas = data.definitions || data.components?.schemas || {};
  console.log("Personalized Products:", JSON.stringify(schemas.personalized_products, null, 2));
}
main();
