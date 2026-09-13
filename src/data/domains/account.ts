import { 
  WritingPackage, Instructor, PersonalizedProduct, AddonProduct, SubscriptionTier, 
  Testimonial, CreativeService, BlogPost, UserProfile, Booking, Order, 
  Publisher, InstructorPayout, PublisherPayout, SessionMessage, SessionAttachment, 
  StudyMaterial, InstructorStudent, BoxSubscription, SupportTicket, 
  JoinRequest, SupportSessionRequest, AuditLog, ServiceOrder, CourseSubscription, 
  SupportTicketMessage, NotificationItem, UserRole,
  PublisherOrder, InstructorPricingOption, PricingFormulaSettings, 
  InstructorCompensationProfile, InstructorCertification, ChildProfile
} from '@/types';
import { cookies } from 'next/headers';
import { mockAllUsers, mockCurrentUser } from './auth';
import { createClient } from '@/lib/supabase/server';

export const mockNotifications = [
  { id: 'notif-1', title: 'تم تأكيد طلبك', message: 'طلبك لمشروع إنها لك قيد التنفيذ الآن.', isRead: false, createdAt: '2023-10-27T10:00:00Z' },
  { id: 'notif-2', title: 'موعد جلستك القادمة', message: 'نذكرك بموعد الجلسة غداً الساعة ٤ عصراً.', isRead: true, createdAt: '2023-10-25T14:30:00Z' },
  { id: 'notif-3', title: 'تحديث في صندوق الرحلة', message: 'صندوق هذا الشهر جاهز للشحن!', isRead: false, createdAt: '2023-10-26T09:15:00Z' },
];

export const getNotifications = async () => mockNotifications;

export const mockTickets = [
  { id: 'tkt-1', subject: 'استفسار عن باقات الكتابة', category: 'الاستفسارات العامة', status: 'answered' as const, createdAt: '2023-10-24T11:20:00Z' },
  { id: 'tkt-2', subject: 'تأخر شحنة صندوق الرحلة', category: 'الطلبات والشحن', status: 'open' as const, createdAt: '2023-10-26T16:45:00Z' },
];

export const getMyTickets = async () => mockTickets;

export const mockSupportTicketMessages: SupportTicketMessage[] = [
  {
    id: 'msg-1',
    ticketId: 'ticket-1',
    senderName: 'يوسف العتيبي',
    message: 'أواجه مشكلة في تحميل الملفات للمهمة.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'msg-2',
    ticketId: 'ticket-1',
    senderName: 'الدعم الفني',
    message: 'مرحباً يوسف، يرجى التأكد من أن حجم الملف لا يتجاوز 5 ميغابايت.',
    createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
  }
];

export const getMessagesForTicket = async (ticketId: string) =>
  Promise.resolve(mockSupportTicketMessages.filter((m) => m.ticketId === ticketId));

export const getParticipantName = async (dependentId?: string, independentId?: string): Promise<string> => {
  const supabase = await createClient();

  if (independentId) {
    const { data } = await (supabase as any).from('user_profiles')
      .select('full_name')
      .eq('id', independentId)
      .single();
    if (data?.full_name) return data.full_name;
  }
  
  if (dependentId) {
    const { data } = await (supabase as any).from('child_profiles')
      .select('full_name')
      .eq('id', dependentId)
      .single();
    if (data?.full_name) return data.full_name;
  }

  return 'مشارك غير معروف';
};
