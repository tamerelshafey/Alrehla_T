import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL!}/rest/v1/?apikey=${process.env.SUPABASE_SERVICE_ROLE_KEY!}`);
  const data = await res.json();
  const paths = data.paths;
  const rpcs = Object.keys(paths).filter(p => p.startsWith('/rpc/'));
  console.log("RPCs available:", rpcs);
}
main();
