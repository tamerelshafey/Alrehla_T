import {
  WritingPackage, Instructor, PersonalizedProduct, AddonProduct, SubscriptionTier, 
  Testimonial, CreativeService, BlogPost, UserProfile, Booking, Order, PortfolioItem, 
  Publisher, InstructorPayout, PublisherPayout, SessionMessage, SessionAttachment, 
  StudyMaterial, InstructorStudent, AvailabilitySlot, BoxSubscription, SupportTicket, 
  JoinRequest, SupportSessionRequest, AuditLog, ServiceOrder, CourseSubscription, 
  SupportTicketMessage, FamilyMember, NotificationItem, UserRole,
  PublisherOrder, InstructorWeeklyAvailability, RecurringSessionSlot, SlotChangeRequest,
  InstructorPricingOption, PricingFormulaSettings, InstructorCompensationProfile, InstructorCertification
} from '@/types';
import { cookies } from 'next/headers';

// Import from auth if needed
import { mockAllUsers, mockCurrentUser } from './auth';

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

export const mockAllSupportTickets: SupportTicket[] = [
  { id: 'tkt-1', requesterName: 'أحمد محمود', subject: 'مشكلة في الدفع', category: 'billing', status: 'open', createdAt: '2023-10-25T00:00:00Z' },
  { id: 'tkt-2', requesterName: 'سارة خالد', subject: 'استفسار عن باقة', category: 'general', status: 'answered', createdAt: '2023-10-26T00:00:00Z' },
  { id: 'tkt-3', requesterName: 'محمد طارق', subject: 'تأخر الشحنة', category: 'shipping', status: 'closed', createdAt: '2023-10-20T00:00:00Z' },
];

export const getAllSupportTickets = async (): Promise<SupportTicket[]> => mockAllSupportTickets;

export const mockJoinRequests: JoinRequest[] = [
  { id: 'req-1', applicantName: 'منى سعيد', requestedRole: 'instructor', status: 'approved', createdAt: '2023-10-21T00:00:00Z' },
  { id: 'req-2', applicantName: 'دار النشر الحديثة', requestedRole: 'publisher', status: 'pending', createdAt: '2023-10-25T00:00:00Z' },
  { id: 'req-3', applicantName: 'عماد كمال', requestedRole: 'instructor', status: 'rejected', createdAt: '2023-10-22T00:00:00Z' },
];

export const getJoinRequests = async (): Promise<JoinRequest[]> => mockJoinRequests;

export const mockSupportSessionRequests: SupportSessionRequest[] = [
  { id: 'ssr-1', contactName: 'أحمد محمود', contactPhone: '01000000000', message: 'تقييم مستوى الكتابة', status: 'pending', createdAt: '2023-10-26T00:00:00Z' },
  { id: 'ssr-2', contactName: 'سارة خالد', contactPhone: '01111111111', message: 'جلسة توجيه استثنائية', status: 'contacted', createdAt: '2023-10-25T00:00:00Z' },
];

export const getSupportSessionRequests = async (): Promise<SupportSessionRequest[]> => mockSupportSessionRequests;

export const mockAuditLogs: AuditLog[] = [
  { id: 'log-1', action: 'تسجيل دخول ناجح', actorName: 'محمد طارق (مدير)', createdAt: '2023-10-27T08:00:00Z', entityType: 'User' },
  { id: 'log-2', action: 'تعديل صلاحيات مستخدم', actorName: 'نور مصطفى (مشرف)', createdAt: '2023-10-27T09:15:00Z', entityType: 'User' },
  { id: 'log-3', action: 'إيقاف حساب مدرب', actorName: 'محمد طارق (مدير)', createdAt: '2023-10-26T14:30:00Z', entityType: 'Instructor' },
  { id: 'log-4', action: 'الموافقة على طلب انضمام', actorName: 'نور مصطفى (مشرف)', createdAt: '2023-10-26T11:20:00Z', entityType: 'JoinRequest' },
  { id: 'log-5', action: 'تصدير تقرير مالي', actorName: 'محمد طارق (مدير)', createdAt: '2023-10-25T16:45:00Z', entityType: 'Report' },
];

export const getAuditLogs = async (): Promise<AuditLog[]> => mockAuditLogs;



