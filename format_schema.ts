import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function main() {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql') && !f.startsWith('10_'));
  
  const expectedTables: Record<string, any[]> = {};
  
  for (const file of files) {
    const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
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
             const type = parts[1];
             const isNullable = !col.toUpperCase().includes('NOT NULL');
             cols.push({ column_name: colName, data_type: type, is_nullable: isNullable ? 'YES' : 'NO' });
          }
      }
      expectedTables[tableName] = cols;
    }
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseAnonKey}`);
  const data = await res.json();
  const schemas = data.definitions || data.components?.schemas || {};
  
  for (const [tableName, expectedCols] of Object.entries(expectedTables)) {
      console.log(`\n--- TABLE: ${tableName} ---`);
      const liveSchema = schemas[tableName];
      if (!liveSchema) {
          console.log(`MISSING TABLE ENTIRELY!`);
          continue;
      }
      
      console.log(`column_name | data_type | is_nullable`);
      console.log(`-------------------------------------`);
      const liveCols = liveSchema.properties ? Object.keys(liveSchema.properties) : [];
      const liveColSet = new Set(liveCols);
      
      for (const col of liveCols) {
         const typeInfo = liveSchema.properties[col];
         const type = typeInfo.format || typeInfo.type;
         const isNullable = liveSchema.required && liveSchema.required.includes(col) ? 'NO' : 'YES';
         console.log(`${col} | ${type} | ${isNullable}`);
      }
      
      console.log(`\nComparison to migration:`);
      const expectedColNames = expectedCols.map(c => c.column_name);
      const missing = expectedColNames.filter(c => !liveColSet.has(c));
      const extra = liveCols.filter(c => !expectedColNames.includes(c));
      
      if (missing.length > 0) console.log(`MISSING IN LIVE DB: ${missing.join(', ')}`);
      if (extra.length > 0) console.log(`EXTRA IN LIVE DB: ${extra.join(', ')}`);
      if (missing.length === 0 && extra.length === 0) console.log(`MATCH: OK (No missing/extra columns)`);
  }
}
main();
