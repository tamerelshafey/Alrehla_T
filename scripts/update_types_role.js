const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf8');

// Update UserRole
content = content.replace(
  "export type UserRole =\n  | 'visitor'\n  | 'student'\n  | 'instructor'\n  | 'general_supervisor'\n  | 'super_admin';",
  "export type UserRole =\n  | 'visitor'\n  | 'student'\n  | 'instructor'\n  | 'publisher'\n  | 'general_supervisor'\n  | 'super_admin';"
);

// If it was written linearly:
content = content.replace(
  "export type UserRole = 'visitor' | 'student' | 'instructor' | 'general_supervisor' | 'super_admin';",
  "export type UserRole = 'visitor' | 'student' | 'instructor' | 'publisher' | 'general_supervisor' | 'super_admin';"
);

const payoutTypes = `

// حالة الدفع
export type PayoutStatus = 'pending' | 'paid';

// مستحقات المدرب
export interface InstructorPayout {
  id: string;
  instructorId: string;
  period: string;
  amount: number;
  status: PayoutStatus;
}

// مستحقات الناشر
export interface PublisherPayout {
  id: string;
  publisherId: string;
  period: string;
  amount: number;
  status: PayoutStatus;
}
`;

content = content + payoutTypes;
fs.writeFileSync('src/types/index.ts', content, 'utf8');
console.log('Types updated.');
