import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  db: { schema: 'information_schema' }
});

async function main() {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql') && f !== '10_fix_missing_timestamp_columns.sql');
  
  const expectedTables: Record<string, string[]> = {};
  
  for (const file of files) {
    const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    // Extract table names
    const tableMatches = content.matchAll(/CREATE TABLE IF NOT EXISTS\s+([a-zA-Z_]+)\s*\(([\s\S]*?)\);/gi);
    for (const match of tableMatches) {
      const tableName = match[1];
      const tableBody = match[2];
      
      const columnMatches = tableBody.split(',\n').map(line => line.trim()).filter(line => line.length > 0 && !line.toUpperCase().startsWith('PRIMARY') && !line.toUpperCase().startsWith('FOREIGN') && !line.toUpperCase().startsWith('UNIQUE') && !line.toUpperCase().startsWith('CONSTRAINT'));
      
      const cols = [];
      for (const col of columnMatches) {
          const parts = col.split(/\s+/);
          if (parts.length >= 2) {
             const colName = parts[0];
             cols.push(colName);
          }
      }
      expectedTables[tableName] = cols;
    }
  }

  const { data: dbColumns, error } = await supabase
    .from('columns')
    .select('table_name, column_name, data_type, is_nullable, column_default')
    .in('table_name', Object.keys(expectedTables))
    .order('table_name')
    .order('ordinal_position');
    
  if (error) {
    console.error(error);
    return;
  }
  
  const liveTables: Record<string, any[]> = {};
  for (const row of dbColumns) {
    if (!liveTables[row.table_name]) liveTables[row.table_name] = [];
    liveTables[row.table_name].push(row);
  }

  for (const [tableName, cols] of Object.entries(expectedTables)) {
      console.log(`\n--- TABLE: ${tableName} ---`);
      const liveCols = liveTables[tableName] || [];
      const liveColNames = liveCols.map(c => c.column_name);
      
      console.log(`Migration Columns: ${cols.join(', ')}`);
      console.log(`Live Columns:      ${liveColNames.join(', ')}`);
      
      const missing = cols.filter(c => !liveColNames.includes(c));
      const extra = liveColNames.filter(c => !cols.includes(c));
      
      if (missing.length > 0) console.log(`MISSING: ${missing.join(', ')}`);
      if (extra.length > 0) console.log(`EXTRA: ${extra.join(', ')}`);
      
      if (missing.length === 0 && extra.length === 0) {
          console.log("MATCH: OK");
      }
  }
}
main();
