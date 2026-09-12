const fs = require('fs');
const path = require('path');

const dir = 'supabase/migrations';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Make CREATE TABLE safe
    content = content.replace(/CREATE TABLE\s+(?!IF NOT EXISTS)/gi, 'CREATE TABLE IF NOT EXISTS ');

    // Make CREATE TYPE safe - already wrapped in some files, but let's check
    // Wait, some files might have it outside DO $$ BEGIN.
    // If there's `CREATE TYPE ... AS ENUM`, we wrap it if it's not already wrapped.
    // Actually, it's safer to just do a global replace for all CREATE POLICY.
    
    // Replace CREATE POLICY
    // We use a regex that matches `CREATE POLICY "name" ON table ... ;`
    const policyRegex = /CREATE\s+POLICY\s+(["'][^"']+["'])\s+ON\s+([^\s]+)([\s\S]*?);/gi;
    
    content = content.replace(policyRegex, (match, pName, pTable, pRest) => {
        // If it's already wrapped in DO $$ BEGIN (like we see in some projects), skip.
        // But since we just matched the plain CREATE POLICY, let's wrap it safely.
        return `DO $$
BEGIN
    ${match}
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;`;
    });

    // Write back
    fs.writeFileSync(filePath, content);
}

console.log('Done rewriting migrations');
