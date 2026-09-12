const fs = require('fs');
let code = fs.readFileSync('src/data/domains/writing.ts', 'utf8');

code = code.replace(
`  {
    id: 'sub-2',
    packageId: 'pkg-2',
    userId: 'student-1',
    status: 'active',
    startedAt: '2024-06-05T00:00:00Z',
    createdAt: '2024-06-01T00:00:00Z'
  }`,
`  {
    id: 'sub-2',
    packageId: 'pkg-2',
    userId: 'student-1',
    participantType: 'self',
    status: 'active',
    startedAt: '2024-06-05T00:00:00Z',
    createdAt: '2024-06-01T00:00:00Z'
  }`);

code = code.replace(
`    id: bkg.id,
    packageId: bkg.package_id,
    instructorId: bkg.instructor_id,
    courseSubscriptionId: bkg.course_subscription_id,
    status: bkg.status as any,
    scheduledAt: bkg.scheduled_at,
    createdAt: bkg.created_at
  }));`,
`    id: bkg.id,
    packageId: bkg.package_id,
    userId: bkg.user_id,
    participantType: 'self',
    instructorId: bkg.instructor_id,
    courseSubscriptionId: bkg.course_subscription_id,
    status: bkg.status as any,
    scheduledAt: bkg.scheduled_at,
    createdAt: bkg.created_at
  }));`);

fs.writeFileSync('src/data/domains/writing.ts', code);
