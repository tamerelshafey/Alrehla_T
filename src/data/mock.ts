export * from './domains/products';
export * from './domains/writing';
export * from './domains/orders';
export * from './domains/subscriptions';
export * from './domains/account';
export * from './domains/admin';
export * from './domains/content';
export * from './domains/auth';

export const mockReviews: import('@/types').Review[] = [
  {
    id: 'rev-1',
    studentId: 'usr-student-1',
    studentName: 'أحمد محمود',
    instructorId: 'usr-inst-1',
    rating: 5,
    comment: 'شرح ممتاز جداً ومفيد للغاية. شكراً جزيلاً!',
    createdAt: '2023-11-01T10:00:00Z'
  },
  {
    id: 'rev-2',
    studentId: 'usr-student-2',
    studentName: 'سارة خالد',
    instructorId: 'usr-inst-1',
    rating: 4,
    comment: 'المدرب متميز لكن هناك مجال لتحسين جودة الصوت.',
    createdAt: '2023-11-05T14:30:00Z'
  },
  {
    id: 'rev-3',
    studentId: 'usr-student-3',
    studentName: 'عمر حسين',
    instructorId: 'usr-inst-2',
    rating: 5,
    comment: 'من أفضل المدربين على المنصة.',
    createdAt: '2023-11-10T12:15:00Z'
  }
];

export const getReviewsByInstructor = async (instructorId: string) => {
  return Promise.resolve(mockReviews.filter(r => r.instructorId === instructorId));
};
