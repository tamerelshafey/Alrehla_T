const fs = require('fs');
let code = fs.readFileSync('src/data/domains/writing.ts', 'utf8');

code = code.replace(
`    { id: '1', senderName: 'سارة أحمد', message: 'مرحباً، أهلاً بك في الجلسة القادمة.', createdAt: '2024-06-14T10:00:00Z' },
    { id: '2', senderName: 'ياسمين طارق', message: 'أهلاً بك أستاذة، أنا متحمسة جداً!', createdAt: '2024-06-14T10:05:00Z' }`,
`    { id: '1', sessionId, senderName: 'سارة أحمد', message: 'مرحباً، أهلاً بك في الجلسة القادمة.', createdAt: '2024-06-14T10:00:00Z' },
    { id: '2', sessionId, senderName: 'ياسمين طارق', message: 'أهلاً بك أستاذة، أنا متحمسة جداً!', createdAt: '2024-06-14T10:05:00Z' }`);

code = code.replace(
`    { id: '1', fileName: 'ملخص_الأساسيات.pdf', fileUrl: '#' },
    { id: '2', fileName: 'تدريب_الخيال.docx', fileUrl: '#' }`,
`    { id: '1', sessionId, fileName: 'ملخص_الأساسيات.pdf', fileUrl: '#' },
    { id: '2', sessionId, fileName: 'تدريب_الخيال.docx', fileUrl: '#' }`);

// Also fix CourseSubscription mocks missing fields and having old fields
code = code.replace(
`  {
    id: 'sub-1',
    packageId: 'pkg-1',
    guardianProfileId: 'current-user',
    dependentParticipantId: 'dep-child-1',
    status: 'active',
    startedAt: '2024-06-01T00:00:00Z',
    createdAt: '2024-05-25T00:00:00Z'
  },`,
`  {
    id: 'sub-1',
    packageId: 'pkg-1',
    userId: 'current-user',
    participantType: 'child',
    childId: 'dep-child-1',
    status: 'active',
    startedAt: '2024-06-01T00:00:00Z',
    createdAt: '2024-05-25T00:00:00Z'
  },`);

code = code.replace(
`  {
    id: 'sub-2',
    packageId: 'pkg-2',
    independentParticipantId: 'student-1',
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
  
fs.writeFileSync('src/data/domains/writing.ts', code);
