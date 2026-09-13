import { Review } from '@/types';

export * from './domains/products';
export * from './domains/writing';
export * from './domains/orders';
export * from './domains/subscriptions';
export * from './domains/account';
export * from './domains/admin';
export * from './domains/content';
export * from './domains/auth';

export const getReviewsByInstructor = async (instructorId: string): Promise<Review[]> => {
  // No reviews source yet — the `reviews` table exists but has no real rows
  // and no review-submission flow is built. Return empty until it is.
  return [];
};
