/**
 * بيانات تجريبية للتطوير المحلي فقط — لا تُستخدم في الموقع المنشور.
 *
 * Development-only sample data. Nothing here is real, and nothing here is
 * exported to pages: the read functions in `src/data/domains` fall back to it
 * only when NODE_ENV is 'development'.
 */

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

export const mockOrders: Order[] = [
  {
    id: 'ord-1',
    userId: 'student-1',
    items: [{ productId: 'prod-1', quantity: 1, unitPrice: 350, customizationData: { childName: 'علي' } }, { productId: 'addon-1', quantity: 1, unitPrice: 45 }],
    
    totalAmount: 395,
    status: 'paid',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'ord-2',
    userId: 'student-2',
    items: [{ productId: 'prod-2', quantity: 1, unitPrice: 50 }],
    
    totalAmount: 120,
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];
