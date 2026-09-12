const fs = require('fs');

let code = fs.readFileSync('src/types/index.ts', 'utf8');
code = code.replace(
`export interface Session {
  id: string;
  courseSubscriptionId: string;
  instructorId?: string;
  sessionNumber: number;
  scheduledAt: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}`,
`export interface Session {
  id: string;
  courseSubscriptionId: string;
  instructorId?: string;
  sessionNumber: number;
  scheduledAt: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export type SessionWithDetails = Session & {
  userId: string;
  participantType: 'self' | 'child';
  childId?: string;
  packageId: string;
};`);
fs.writeFileSync('src/types/index.ts', code);
