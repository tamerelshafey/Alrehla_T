const fs = require('fs');
let code = fs.readFileSync('src/data/domains/writing.ts', 'utf8');

code = code.replace(
`  {
    id: 'csub-1',
    packageId: 'pkg-1',
    userId: 'parent-1',
    
    status: 'active',
    startedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },`,
`  {
    id: 'csub-1',
    packageId: 'pkg-1',
    userId: 'parent-1',
    participantType: 'child',
    childId: 'dep-child-1',
    status: 'active',
    startedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },`);

fs.writeFileSync('src/data/domains/writing.ts', code);
