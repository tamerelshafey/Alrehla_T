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

export const mockInstructorPayouts: InstructorPayout[] = [
  { id: 'ip-1', instructorId: 'inst-1', period: 'أكتوبر 2023', amount: 4500, status: 'paid' },
  { id: 'ip-2', instructorId: 'inst-1', period: 'نوفمبر 2023', amount: 5200, status: 'pending' },
];

export const mockPublisherPayouts: PublisherPayout[] = [
  { id: 'pp-1', publisherId: 'pub-1', period: 'الربع الثالث 2023', amount: 12500, status: 'paid' },
  { id: 'pp-2', publisherId: 'pub-1', period: 'الربع الرابع 2023', amount: 14200, status: 'pending' },
];

export const mockAllSupportTickets: SupportTicket[] = [
  { id: 'tkt-1', requesterName: 'أحمد محمود', subject: 'مشكلة في الدفع', category: 'billing', status: 'open', createdAt: '2023-10-25T00:00:00Z' },
  { id: 'tkt-2', requesterName: 'سارة خالد', subject: 'استفسار عن باقة', category: 'general', status: 'answered', createdAt: '2023-10-26T00:00:00Z' },
  { id: 'tkt-3', requesterName: 'محمد طارق', subject: 'تأخر الشحنة', category: 'shipping', status: 'closed', createdAt: '2023-10-20T00:00:00Z' },
];

export const mockJoinRequests: JoinRequest[] = [
  { id: 'req-1', applicantName: 'منى سعيد', requestedRole: 'instructor', status: 'approved', createdAt: '2023-10-21T00:00:00Z' },
  { id: 'req-2', applicantName: 'دار النشر الحديثة', requestedRole: 'publisher', status: 'pending', createdAt: '2023-10-25T00:00:00Z' },
  { id: 'req-3', applicantName: 'عماد كمال', requestedRole: 'instructor', status: 'rejected', createdAt: '2023-10-22T00:00:00Z' },
];

export const mockSupportSessionRequests: SupportSessionRequest[] = [
  { id: 'ssr-1', contactName: 'أحمد محمود', contactPhone: '01000000000', message: 'تقييم مستوى الكتابة', status: 'pending', createdAt: '2023-10-26T00:00:00Z' },
  { id: 'ssr-2', contactName: 'سارة خالد', contactPhone: '01111111111', message: 'جلسة توجيه استثنائية', status: 'contacted', createdAt: '2023-10-25T00:00:00Z' },
];

export const mockWithdrawalRequests: import('@/types').WithdrawalRequest[] = [];

export const mockPublisherPricingSettings: PricingFormulaSettings[] = [
  { id: 'publisher-default', platformMultiplier: 1.1, fixedAdminFee: 20, updatedAt: new Date().toISOString() }
];
