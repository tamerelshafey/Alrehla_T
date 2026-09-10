import {
  WritingPackage, Instructor, PersonalizedProduct, AddonProduct, SubscriptionTier, 
  Testimonial, CreativeService, BlogPost, UserProfile, Booking, Order, 
  Publisher, InstructorPayout, PublisherPayout, SessionMessage, SessionAttachment, 
  StudyMaterial, InstructorStudent, BoxSubscription, SupportTicket, 
  JoinRequest, SupportSessionRequest, AuditLog, ServiceOrder, CourseSubscription, 
  SupportTicketMessage, FamilyMember, NotificationItem, UserRole,
  PublisherOrder,
  InstructorPricingOption, PricingFormulaSettings, InstructorCompensationProfile, InstructorCertification
} from '@/types';
import { cookies } from 'next/headers';

// Import from auth if needed
import { mockAllUsers, mockCurrentUser } from './auth';

export const mockOrders: Order[] = [
  {
    id: 'ord-1',
    userId: 'student-1',
    items: [{ productId: 'prod-1', quantity: 1, unitPrice: 350, customizationData: { childName: 'علي' } }, { productId: 'addon-1', quantity: 1, unitPrice: 45 }],
    independentParticipantId: 'student-1',
    totalAmount: 395,
    status: 'paid',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'ord-2',
    userId: 'student-2',
    items: [{ productId: 'prod-2', quantity: 1, unitPrice: 50 }],
    dependentParticipantId: 'dep-child-2',
    totalAmount: 120,
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export const getOrders = async (): Promise<Order[]> => {
  return Promise.resolve(mockOrders);
};

