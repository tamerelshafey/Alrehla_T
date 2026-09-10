const fs = require('fs');

let content = fs.readFileSync('src/data/mock.ts', 'utf8');

// Ensure imports for payout types
if (!content.includes('InstructorPayout,')) {
  content = content.replace('Publisher,', 'Publisher,\n  InstructorPayout,\n  PublisherPayout,');
}

const payoutsCode = `
export const mockInstructorPayouts: InstructorPayout[] = [
  { id: 'ip-1', instructorId: 'inst-1', period: 'أكتوبر 2023', amount: 4500, status: 'paid' },
  { id: 'ip-2', instructorId: 'inst-1', period: 'نوفمبر 2023', amount: 5200, status: 'pending' },
];

export const mockPublisherPayouts: PublisherPayout[] = [
  { id: 'pp-1', publisherId: 'pub-1', period: 'الربع الثالث 2023', amount: 12500, status: 'paid' },
  { id: 'pp-2', publisherId: 'pub-1', period: 'الربع الرابع 2023', amount: 14200, status: 'pending' },
];

export const getInstructorPayouts = async (): Promise<InstructorPayout[]> => mockInstructorPayouts;
export const getPublisherPayouts = async (): Promise<PublisherPayout[]> => mockPublisherPayouts;
`;

if (!content.includes('getInstructorPayouts')) {
  content = content + payoutsCode;
  fs.writeFileSync('src/data/mock.ts', content, 'utf8');
}
console.log('Mock payouts updated.');
