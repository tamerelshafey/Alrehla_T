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

export const mockBoxSubscriptions: BoxSubscription[] = [
  { id: 'sub-1', customerName: 'أحمد محمود', planName: 'اشتراك 3 أشهر', status: 'active', nextShipmentDate: '2023-11-01T00:00:00Z' },
  { id: 'sub-2', customerName: 'سارة خالد', planName: 'اشتراك 6 أشهر', status: 'paused', nextShipmentDate: '2023-11-15T00:00:00Z' },
  { id: 'sub-3', customerName: 'علياء حسين', planName: 'اشتراك سنوي', status: 'active', nextShipmentDate: '2023-11-05T00:00:00Z' },
];
