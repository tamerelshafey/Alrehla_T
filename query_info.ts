import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  db: { schema: 'information_schema' }
});

async function main() {
  const { data, error } = await supabase
    .from('columns')
    .select('column_name, data_type, is_nullable, column_default')
    .eq('table_name', 'creative_writing_packages')
    .order('ordinal_position');
  console.log("COLUMNS:");
  console.log(JSON.stringify({ data, error }, null, 2));

  const { data: d2, error: e2 } = await supabase
    .from('tables')
    .select('table_schema, table_name')
    .or('table_name.ilike.%writing_package%,table_name.ilike.%creative%package%');
  console.log("TABLES:");
  console.log(JSON.stringify({ data: d2, error: e2 }, null, 2));
}
main();
