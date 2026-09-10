const fs = require('fs');

const path = 'src/app/dashboard/admin/layout.tsx';
let content = fs.readFileSync(path, 'utf8');

const newLink = `
    { label: 'إعدادات تسعير الكتابة', href: '/dashboard/admin/settings/creative-writing-pricing', icon: Settings, permission: 'canManageCatalog' },
    { label: 'إعدادات تسعير الناشرين', href: '/dashboard/admin/settings/publisher-pricing', icon: Settings, permission: 'canManagePublishers' },`;

content = content.replace(
  "{ label: 'إعدادات تسعير الكتابة', href: '/dashboard/admin/settings/creative-writing-pricing', icon: Settings, permission: 'canManageCatalog' },",
  newLink
);

fs.writeFileSync(path, content);
