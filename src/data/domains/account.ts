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
import { mockAllUsers, mockCurrentUser } from '../fixtures/auth';
import { createClient } from '@/lib/supabase/server';

export async function getNotifications(): Promise<NotificationItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('id, title, message, is_read, created_at')
    .eq('recipient_profile_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    message: row.message ?? '',
    isRead: row.is_read,
    createdAt: row.created_at,
  }));
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

export const getParticipantName = async (dependentId?: string, independentId?: string): Promise<string> => {
  const supabase = await createClient();

  if (independentId) {
    const { data } = await supabase.from('user_profiles')
      .select('full_name')
      .eq('id', independentId)
      .single();
    if (data?.full_name) return data.full_name;
  }
  
  if (dependentId) {
    const { data } = await supabase.from('child_profiles')
      .select('full_name')
      .eq('id', dependentId)
      .single();
    if (data?.full_name) return data.full_name;
  }

  return 'مشارك غير معروف';
};
