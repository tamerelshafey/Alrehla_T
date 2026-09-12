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

export const mockInstructorPayouts: InstructorPayout[] = [
  { id: 'ip-1', instructorId: 'inst-1', period: 'أكتوبر 2023', amount: 4500, status: 'paid' },
  { id: 'ip-2', instructorId: 'inst-1', period: 'نوفمبر 2023', amount: 5200, status: 'pending' },
];

export const mockPublisherPayouts: PublisherPayout[] = [
  { id: 'pp-1', publisherId: 'pub-1', period: 'الربع الثالث 2023', amount: 12500, status: 'paid' },
  { id: 'pp-2', publisherId: 'pub-1', period: 'الربع الرابع 2023', amount: 14200, status: 'pending' },
];

export const getInstructorPayouts = async (): Promise<InstructorPayout[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('instructor_payouts')
    .select('*')
    .order('created_at', { ascending: false });

  if ((error || !data || data.length === 0)) {
    if (process.env.NODE_ENV === 'development') {
      return mockInstructorPayouts;
    }
    return [];
  }

  return data.map((p: any) => ({
    id: p.id,
    instructorId: p.instructor_id,
    period: p.period,
    amount: p.amount,
    status: p.status
  }));
};

export const getPublisherPayouts = async (): Promise<PublisherPayout[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('publisher_payouts')
    .select('*')
    .order('created_at', { ascending: false });

  if ((error || !data || data.length === 0)) {
    if (process.env.NODE_ENV === 'development') {
      return mockPublisherPayouts;
    }
    return [];
  }

  return data.map((p: any) => ({
    id: p.id,
    publisherId: p.publisher_id,
    period: p.period,
    amount: p.amount,
    status: p.status
  }));
};

export const mockAllSupportTickets: SupportTicket[] = [
  { id: 'tkt-1', requesterName: 'أحمد محمود', subject: 'مشكلة في الدفع', category: 'billing', status: 'open', createdAt: '2023-10-25T00:00:00Z' },
  { id: 'tkt-2', requesterName: 'سارة خالد', subject: 'استفسار عن باقة', category: 'general', status: 'answered', createdAt: '2023-10-26T00:00:00Z' },
  { id: 'tkt-3', requesterName: 'محمد طارق', subject: 'تأخر الشحنة', category: 'shipping', status: 'closed', createdAt: '2023-10-20T00:00:00Z' },
];

import { createClient } from '@/lib/supabase/server';

export const getAllSupportTickets = async (): Promise<SupportTicket[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if ((error || !data || data.length === 0)) {
    if (process.env.NODE_ENV === 'development') {
      return mockAllSupportTickets;
    }
    return [];
  }

  return data.map((t: any) => ({
    id: t.id,
    requesterName: t.requester_name,
    subject: t.subject,
    category: t.category,
    status: t.status,
    createdAt: t.created_at
  }));
};

export const mockJoinRequests: JoinRequest[] = [
  { id: 'req-1', applicantName: 'منى سعيد', requestedRole: 'instructor', status: 'approved', createdAt: '2023-10-21T00:00:00Z' },
  { id: 'req-2', applicantName: 'دار النشر الحديثة', requestedRole: 'publisher', status: 'pending', createdAt: '2023-10-25T00:00:00Z' },
  { id: 'req-3', applicantName: 'عماد كمال', requestedRole: 'instructor', status: 'rejected', createdAt: '2023-10-22T00:00:00Z' },
];

export const getJoinRequests = async (): Promise<JoinRequest[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('join_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if ((error || !data || data.length === 0)) {
    if (process.env.NODE_ENV === 'development') {
      return mockJoinRequests;
    }
    return [];
  }

  return data.map((r: any) => ({
    id: r.id,
    applicantName: r.applicant_name,
    requestedRole: r.requested_role,
    status: r.status,
    createdAt: r.created_at
  }));
};

export const mockSupportSessionRequests: SupportSessionRequest[] = [
  { id: 'ssr-1', contactName: 'أحمد محمود', contactPhone: '01000000000', message: 'تقييم مستوى الكتابة', status: 'pending', createdAt: '2023-10-26T00:00:00Z' },
  { id: 'ssr-2', contactName: 'سارة خالد', contactPhone: '01111111111', message: 'جلسة توجيه استثنائية', status: 'contacted', createdAt: '2023-10-25T00:00:00Z' },
];

export const getSupportSessionRequests = async (): Promise<SupportSessionRequest[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('support_session_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if ((error || !data || data.length === 0)) {
    if (process.env.NODE_ENV === 'development') {
      return mockSupportSessionRequests;
    }
    return [];
  }

  return data.map((r: any) => ({
    id: r.id,
    contactName: r.contact_name,
    contactPhone: r.contact_phone,
    message: r.message,
    status: r.status,
    createdAt: r.created_at
  }));
};

export const mockAuditLogs: AuditLog[] = [
  { id: 'log-1', action: 'تسجيل دخول ناجح', actorName: 'محمد طارق (مدير)', createdAt: '2023-10-27T08:00:00Z', entityType: 'User' },
  { id: 'log-2', action: 'تعديل صلاحيات مستخدم', actorName: 'نور مصطفى (مشرف)', createdAt: '2023-10-27T09:15:00Z', entityType: 'User' },
  { id: 'log-3', action: 'إيقاف حساب مدرب', actorName: 'محمد طارق (مدير)', createdAt: '2023-10-26T14:30:00Z', entityType: 'Instructor' },
  { id: 'log-4', action: 'الموافقة على طلب انضمام', actorName: 'نور مصطفى (مشرف)', createdAt: '2023-10-26T11:20:00Z', entityType: 'JoinRequest' },
  { id: 'log-5', action: 'تصدير تقرير مالي', actorName: 'محمد طارق (مدير)', createdAt: '2023-10-25T16:45:00Z', entityType: 'Report' },
];

export const getAuditLogs = async (): Promise<AuditLog[]> => mockAuditLogs;




export const mockWithdrawalRequests: import('@/types').WithdrawalRequest[] = [];

export const logAuditAction = async (data: Omit<import('@/types').AuditLog, 'id' | 'createdAt'>) => {
  mockAuditLogs.unshift({
    id: `log-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...data,
  });
};

export const mockPublisherPricingSettings: PricingFormulaSettings[] = [
  { id: 'publisher-default', platformMultiplier: 1.1, fixedAdminFee: 20, updatedAt: new Date().toISOString() }
];

export const getPublisherPricingSettings = async (): Promise<PricingFormulaSettings> => mockPublisherPricingSettings[0];
