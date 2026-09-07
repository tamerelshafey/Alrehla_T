const fs = require('fs');

let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

// Add import
if (!content.includes('next/headers')) {
  content = content.replace("import { ShoppingCart, User } from 'lucide-react';", "import { ShoppingCart, User } from 'lucide-react';\nimport { cookies } from 'next/headers';");
}

// Convert to async function
content = content.replace("export default function Header() {", "export default async function Header() {\n  const cookieStore = await cookies();\n  const mockRole = cookieStore.get('mockRole')?.value || 'visitor';\n  const isLoggedIn = mockRole !== 'visitor';");

// Update link
content = content.replace('href="/sign-in"', 'href={isLoggedIn ? "/account" : "/sign-in"}');

fs.writeFileSync('src/components/layout/Header.tsx', content, 'utf8');
console.log('Header updated.');
