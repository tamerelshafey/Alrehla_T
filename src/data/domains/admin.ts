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



export const getInstructorPayouts = async (): Promise<InstructorPayout[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('instructor_payouts')
    .select('*')
    .order('created_at', { ascending: false });

  if ((error || !data || data.length === 0)) {
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
  const { data, error } = await supabase.from('publisher_payouts')
    .select('*')
    .order('created_at', { ascending: false });

  if ((error || !data || data.length === 0)) {
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


import { createClient } from '@/lib/supabase/server';

export const getAllSupportTickets = async (): Promise<SupportTicket[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if ((error || !data || data.length === 0)) {
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


export const getJoinRequests = async (): Promise<JoinRequest[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('join_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if ((error || !data || data.length === 0)) {
    return [];
  }

  return data.map((r: any) => ({
    id: r.id,
    applicantName: r.applicant_name,
    requestedRole: r.requested_role,
    status: r.status,
    createdAt: r.created_at,
    email: r.email ?? undefined,
    phone: r.phone ?? undefined,
    portfolioUrl: r.portfolio_url ?? undefined,
    message: r.message ?? undefined,
  }));
};


export const getSupportSessionRequests = async (): Promise<SupportSessionRequest[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('support_session_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if ((error || !data || data.length === 0)) {
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

export async function getAuditLogs(): Promise<AuditLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('audit_logs')
    .select('id, actor_profile_id, action, entity_type, entity_id, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    actorProfileId: row.actor_profile_id ?? undefined,
    action: row.action,
    entityType: row.entity_type ?? '',
    entityId: row.entity_id ?? undefined,
    metadata: (row.metadata as Record<string, unknown> | null) ?? undefined,
    createdAt: row.created_at,
  }));
}


/**
 * Writes a real audit entry. This used to push onto an in-memory array, which
 * meant every recorded action was lost the moment the server restarted — the
 * audit log was, in effect, not an audit log.
 */
export async function logAuditAction(
  data: Omit<import('@/types').AuditLog, 'id' | 'createdAt'>
) {
  const supabase = await createClient();
  const { error } = await supabase.from('audit_logs').insert({
    actor_profile_id: data.actorProfileId ?? null,
    action: data.action,
    entity_type: data.entityType ?? null,
    entity_id: data.entityId ?? null,
    metadata: (data.metadata as never) ?? null,
  });
  if (error) console.error('Error writing audit log', error);
}


export const getPublisherPricingSettings = async (): Promise<PricingFormulaSettings> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('pricing_formula_settings')
    .select('*')
    .eq('id', 'publisher-default')
    .single();

  if (error || !data) {
    return { id: 'publisher-default', platformMultiplier: 1, fixedAdminFee: 0, updatedAt: new Date().toISOString() };
  }

  return {
    id: data.id,
    platformMultiplier: data.platform_multiplier,
    fixedAdminFee: data.fixed_admin_fee,
    updatedAt: data.updated_at
  };
};

export type WithdrawalRequestRow = {
  id: string;
  instructorId: string;
  instructorName: string;
  amount: number;
  method: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
};

/**
 * Instructor withdrawal requests — row-level security limits this to admins
 * and to the instructor's own rows.
 */
export async function getWithdrawalRequests(): Promise<WithdrawalRequestRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('withdrawal_requests')
    .select('id, instructor_id, amount, method, status, admin_notes, created_at, instructors(display_name)')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => {
    const joined = row.instructors as unknown as { display_name: string } | null;
    return {
      id: row.id,
      instructorId: row.instructor_id,
      instructorName: joined?.display_name ?? 'مدرب',
      amount: row.amount,
      method: row.method,
      status: row.status,
      adminNotes: row.admin_notes,
      createdAt: row.created_at,
    };
  });
}
