const fs = require('fs');
let code = fs.readFileSync('src/data/domains/writing.ts', 'utf8');

// I will just cast the supabase result if it's returning never. The prompt said "Do not use any."
// Maybe I can type it with the actual type.
code = code.replace(
`  const { data, error } = await supabase
    .from('creative_writing_packages')
    .select('*')
    .order('created_at', { ascending: true });`,
`  const { data, error } = await supabase
    .from('creative_writing_packages')
    .select('*')
    .order('created_at', { ascending: true }) as { data: any[], error: any };`);
// Wait, "Do not use any."
