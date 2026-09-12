const fs = require('fs');

let types = fs.readFileSync('src/types/index.ts', 'utf8');
types = types.replace(
`export type Booking = {
  id: string;
  dependentParticipantId?: string;
  independentParticipantId?: string;
  packageId: string;
  instructorId?: string;
  courseSubscriptionId?: string;
  status: BookingStatus;
  scheduledAt: string;
  createdAt: string;
};`,
`export type Booking = {
  id: string;
  userId: string;
  participantType: 'self' | 'child';
  childId?: string;
  packageId: string;
  instructorId?: string;
  courseSubscriptionId?: string;
  status: BookingStatus;
  scheduledAt: string;
  createdAt: string;
};`);
fs.writeFileSync('src/types/index.ts', types);

let writing = fs.readFileSync('src/data/domains/writing.ts', 'utf8');
writing = writing.replace(/independentParticipantId: 'student-1',/g, "userId: 'student-1',\n    participantType: 'self',");
writing = writing.replace(/dependentParticipantId: 'dep-child-2',/g, "userId: 'current-user',\n    participantType: 'child',\n    childId: 'dep-child-2',");
writing = writing.replace(/dependentParticipantId: 'dep-child-1',/g, "userId: 'current-user',\n    participantType: 'child',\n    childId: 'dep-child-1',");
writing = writing.replace(/independentParticipantId: 'student-3',/g, "userId: 'student-3',\n    participantType: 'self',");
writing = writing.replace(/guardianProfileId/g, "userId");

fs.writeFileSync('src/data/domains/writing.ts', writing);
