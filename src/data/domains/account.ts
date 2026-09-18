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
import { createClient } from '@/lib/supabase/server';

export async function getNotifications(): Promise<NotificationItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('id, title, message, is_read, link, created_at')
    .eq('recipient_profile_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    message: row.message ?? '',
    isRead: row.is_read,
    link: row.link ?? undefined,
    createdAt: row.created_at,
  }));
}

/** How many unread notifications the signed-in user has, for the header bell. */
export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_profile_id', user.id)
    .eq('is_read', false);

  return count ?? 0;
}

export async function getMyTickets(): Promise<SupportTicket[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('support_tickets')
    .select('id, subject, category, status, requester_name, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    subject: row.subject,
    category: row.category,
    status: row.status as SupportTicket['status'],
    requesterName: row.requester_name,
    createdAt: row.created_at,
  }));
}

export async function getMessagesForTicket(ticketId: string): Promise<SupportTicketMessage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('support_ticket_messages')
    .select('id, ticket_id, sender_profile_id, message, created_at')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    ticketId: row.ticket_id,
    senderName: row.sender_profile_id,
    message: row.message,
    createdAt: row.created_at,
  }));
}

/**
 * اسم المشارك في الحجز.
 *
 * ── ترتيب البحث اتعكس ───────────────────────────────────────
 *
 * كانت بتبص على صاحب الحساب **الأول**. ولأن `user_id` موجود في كل
 * اشتراك (هو صاحب الحساب اللي دفع)، فحجز لابن أو بنت كان بيرجع **اسم
 * ولي الأمر** بدل اسم المتدرب. المدرب يشوف اسم الأب في قايمة طلابه.
 *
 * دلوقتي: لو فيه `dependentId` يبقى المشارك هو الطفل — بنبص عليه
 * الأول. وصاحب الحساب بديل، مش أولوية.
 *
 * ── ورسالة أوضح لما مفيش اسم ────────────────────────────────
 *
 * «مشارك غير معروف» كانت بتخفي السبب. لما الاسم ما يرجعش، السبب
 * غالبًا إن صلاحيات القاعدة مانعة القارئ من الجدول — مش إن الاسم
 * مش موجود. الرسالة بقت بتفرّق بين الحالتين.
 */
export const getParticipantName = async (
  dependentId?: string,
  independentId?: string,
): Promise<string> => {
  const supabase = await createClient();

  // 1) الطفل أولًا: وجوده معناه إن الحجز ليه هو، مش لصاحب الحساب.
  if (dependentId) {
    const { data } = await supabase
      .from('child_profiles')
      .select('full_name')
      .eq('id', dependentId)
      .maybeSingle();
    if (data?.full_name) return data.full_name;
  }

  // 2) صاحب الحساب — لما الحجز لنفسه.
  if (independentId && independentId !== 'unknown') {
    const { data } = await supabase
      .from('user_profiles')
      .select('full_name')
      .eq('id', independentId)
      .maybeSingle();
    if (data?.full_name) return data.full_name;
  }

  // مفيش معرّف أصلًا = الاشتراك نفسه ما وصلش (صلاحيات القاعدة)، مش إن
  // الاسم ناقص. التفرقة دي بتوفّر ساعة تشخيص.
  if (!dependentId && (!independentId || independentId === 'unknown')) {
    return 'بيانات المشارك غير متاحة';
  }

  return 'مشارك غير معروف';
};
