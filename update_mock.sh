cat << 'INNER_EOF' > /tmp/mock_update.js
const fs = require('fs');
let code = fs.readFileSync('src/data/mock.ts', 'utf8');

const replacement = `export const getCurrentUser = async (): Promise<UserProfile> => {
  const cookieStore = await cookies();
  const mockRoleCookie = cookieStore.get('mockRole');
  const role = (mockRoleCookie?.value as UserRole) || 'visitor';

  let permissions: import('../types').AdminPermission[] = [];
  if (role === 'super_admin') {
    permissions = [
      'canManageUsers', 'canManageInstructors', 'canManagePublishers', 
      'canManageCatalog', 'canManageSubscriptions', 'canManageOrders', 
      'canManageBookings', 'canManageSupport', 'canManageContent', 
      'canManageFinance', 'canViewAuditLogs'
    ];
  } else if (role === 'general_supervisor') {
    permissions = [
      'canManageUsers', 'canManageInstructors', 'canManagePublishers', 
      'canManageCatalog', 'canManageSubscriptions', 'canManageOrders', 
      'canManageBookings', 'canManageSupport', 'canManageContent'
    ];
  }

  return Promise.resolve({
    id: 'current-user',
    fullName: role === 'visitor' ? 'زائر تجريبي' : \`مستخدم تجريبي (\${role})\`,
    email: \`\${role}@example.com\`,
    role: role,
    createdAt: '2023-01-01T00:00:00Z',
    ...(permissions.length > 0 ? { permissions } : {})
  });
};`;

code = code.replace(/export const getCurrentUser = async \(\): Promise<UserProfile> => \{[\s\S]*?\};\n/, replacement + '\n');
fs.writeFileSync('src/data/mock.ts', code);
INNER_EOF
node /tmp/mock_update.js
