import {
  WritingPackage, Instructor, PersonalizedProduct, AddonProduct, SubscriptionTier, 
  Testimonial, CreativeService, BlogPost, UserProfile, Booking, SessionWithDetails, Order, 
  Publisher, InstructorPayout, PublisherPayout, SessionMessage, SessionAttachment, 
  StudyMaterial, InstructorStudent, BoxSubscription, SupportTicket, 
  JoinRequest, SupportSessionRequest, AuditLog, ServiceOrder, CourseSubscription, 
  SupportTicketMessage, FamilyMember, NotificationItem, UserRole,
  PublisherOrder,
  InstructorPricingOption, PricingFormulaSettings, InstructorCompensationProfile, InstructorCertification
} from '@/types';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

// Import from auth if needed
import { mockAllUsers, mockCurrentUser } from '../fixtures/auth';
import { mockCourseSubscriptions, mockDocuments, mockInstructorCertifications, mockInstructorCompensationProfiles, mockInstructorPricingOptions, mockInstructors, mockPricingFormulaSettings, mockServiceOrders, mockSessions, mockWritingPackages } from '@/data/fixtures/writing';




export const getWritingPackages = async (): Promise<WritingPackage[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('creative_writing_packages')
    .select('*')
    .order('created_at', { ascending: true });

  if ((error || !data || data.length === 0)) {
    if (process.env.NODE_ENV === 'development') {
      return mockWritingPackages;
    }
    return [];
  }

  return data.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    ageGroup: p.age_group,
    price: p.price,
    durationText: p.duration_text,
    sessionsCount: p.sessions_count,
    sessionDuration: p.session_duration || undefined,
    targetAudience: p.target_audience,
    prerequisiteNote: p.prerequisite_note || undefined,
    prerequisitePackageId: p.prerequisite_package_id || undefined,
    shortDescription: p.short_description,
    fullDescription: p.full_description,
    isActive: p.is_active
  }));
};

export const getWritingPackageBySlug = async (
  slug: string
): Promise<WritingPackage | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('creative_writing_packages')
    .select('*')
    .eq('slug', slug)
    .single();

  // Sample data is for local development only — it must never stand in for
  // a real record on the live site.
  if (error || !data) {
    if (process.env.NODE_ENV !== 'development') return null;
    const pkg = mockWritingPackages.find((p) => p.slug === slug);
    return pkg || null;
  }

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    ageGroup: data.age_group,
    price: data.price,
    durationText: data.duration_text ?? '',
    sessionsCount: data.sessions_count ?? 0,
    sessionDuration: data.session_duration || undefined,
    targetAudience: data.target_audience ?? '',
    prerequisiteNote: data.prerequisite_note || undefined,
    prerequisitePackageId: data.prerequisite_package_id || undefined,
    shortDescription: data.short_description ?? '',
    fullDescription: data.full_description ?? '',
    isActive: data.is_active
  };
};

export const getInstructors = async (): Promise<Instructor[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('instructors')
    .select('*')
    .order('created_at', { ascending: false });

  if ((error || !data || data.length === 0)) {
    if (process.env.NODE_ENV === 'development') {
      return mockInstructors;
    }
    return [];
  }

  return data.map((inst: any) => ({
    id: inst.id,
    userId: inst.user_id,
    displayName: inst.display_name,
    bio: inst.bio,
    specialties: inst.specialties,
    yearsExperience: inst.years_experience,
    isSample: inst.is_sample,
    status: inst.status,
    trainingPassed: inst.training_passed,
    workModel: inst.work_model,
    requestedPrice: inst.requested_price || undefined,
    selectedPricingOptionId: inst.selected_pricing_option_id || undefined,
    approvedPrice: inst.approved_price || undefined,
    weeklySchedule: (inst.weekly_schedule as any[]) || [],
    pendingSchedule: (inst.pending_schedule as any[]) || undefined,
    monthlyHoursCommitted: inst.monthly_hours_committed || undefined
  }));
};

export const getInstructorById = async (
  id: string
): Promise<Instructor | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('instructors')
    .select('*')
    .eq('id', id)
    .single();

  // Sample data is for local development only — it must never stand in for
  // a real record on the live site.
  if (error || !data) {
    if (process.env.NODE_ENV !== 'development') return null;
    const inst = mockInstructors.find((i) => i.id === id);
    return inst || null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    displayName: data.display_name,
    bio: data.bio,
    specialties: data.specialties,
    yearsExperience: data.years_experience,
    isSample: data.is_sample ?? undefined,
    status: data.status,
    trainingPassed: data.training_passed ?? false,
    workModel: data.work_model,
    requestedPrice: data.requested_price || undefined,
    selectedPricingOptionId: data.selected_pricing_option_id || undefined,
    approvedPrice: data.approved_price || undefined,
    weeklySchedule: (data.weekly_schedule as any[]) || [],
    pendingSchedule: (data.pending_schedule as any[]) || undefined,
    monthlyHoursCommitted: data.monthly_hours_committed || undefined
  };
};





export const getSessionMessages = async (sessionId: string): Promise<SessionMessage[]> => {
  return [
    { id: '1', sessionId, senderName: 'سارة أحمد', message: 'مرحباً، أهلاً بك في الجلسة القادمة.', createdAt: '2024-06-14T10:00:00Z' },
    { id: '2', sessionId, senderName: 'ياسمين طارق', message: 'أهلاً بك أستاذة، أنا متحمسة جداً!', createdAt: '2024-06-14T10:05:00Z' }
  ];
};

export const getSessionAttachments = async (sessionId: string): Promise<SessionAttachment[]> => {
  return [
    { id: '1', sessionId, fileName: 'ملخص_الأساسيات.pdf', fileUrl: '#' },
    { id: '2', sessionId, fileName: 'تدريب_الخيال.docx', fileUrl: '#' }
  ];
};

export const getStudyMaterials = async (): Promise<StudyMaterial[]> => {
  return [
    { id: '1', title: 'مقدمة في بناء الشخصيات', description: 'ملف تفصيلي لخطوات بناء شخصيات ثلاثية الأبعاد', packageName: 'باقة الإبحار (4 أسابيع)' },
    { id: '2', title: 'أساسيات الحبكة', description: 'دليل لترتيب أحداث القصة بشكل مشوق', packageName: 'باقة الغوص (12 أسبوع)' },
    { id: '3', title: 'تمارين تحفيز الخيال', description: 'تمارين يومية سريعة لكسر حاجز الكتابة', packageName: 'جلسة استشارية فردية' }
  ];
};

export const getInstructorStudents = async (): Promise<InstructorStudent[]> => {
  return [
    { id: 'st-1', name: 'ياسمين طارق', packageName: 'باقة الإبحار (4 أسابيع)', sessionsCompleted: 2, totalSessions: 4 },
    { id: 'st-2', name: 'عمر طارق', packageName: 'باقة الغوص (12 أسبوع)', sessionsCompleted: 5, totalSessions: 12 },
    { id: 'st-3', name: 'مريم أحمد', packageName: 'جلسة استشارية فردية', sessionsCompleted: 1, totalSessions: 1 },
  ];
};





export async function getCourseSubscriptions(): Promise<CourseSubscription[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('course_subscriptions')
    .select('id, package_id, user_id, participant_type, child_id, status, started_at, created_at')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    packageId: row.package_id,
    userId: row.user_id,
    participantType: row.participant_type as CourseSubscription['participantType'],
    childId: row.child_id ?? undefined,
    status: row.status as CourseSubscription['status'],
    startedAt: row.started_at ?? row.created_at,
    createdAt: row.created_at,
  }));
}



export async function getStudentDocuments(studentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('portfolio_documents')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if ((error || !data || data.length === 0)) {
    if (process.env.NODE_ENV === 'development') {
      return mockDocuments.filter(d => d.studentId === studentId);
    }
    return [];
  }

  return data.map((d: any) => ({
    id: d.id,
    studentId: d.student_id,
    title: d.title,
    content: d.content,
    status: d.status,
    instructorFeedback: d.instructor_feedback || undefined,
    updatedAt: d.updated_at || d.created_at
  }));
}

export async function getDocumentById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('portfolio_documents')
    .select('*')
    .eq('id', id)
    .single();

  if ((error || !data)) {
    if (process.env.NODE_ENV === 'development') {
      return mockDocuments.find(d => d.id === id);
    }
    return null;
  }

  return {
    id: data.id,
    studentId: data.student_id,
    title: data.title,
    content: data.content,
    status: data.status,
    instructorFeedback: data.instructor_feedback || undefined,
    updatedAt: data.updated_at || data.created_at
  };
}











export const getPricingFormulaSettings = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('pricing_formula_settings')
    .select('*')
    .eq('id', 'default')
    .single();

  if (error || !data) {
    if (process.env.NODE_ENV === 'development') {
      return mockPricingFormulaSettings[0];
    }
    return { id: 'default', platformMultiplier: 1, fixedAdminFee: 0, updatedAt: new Date().toISOString() };
  }

  return {
    id: data.id,
    platformMultiplier: data.platform_multiplier,
    fixedAdminFee: data.fixed_admin_fee,
    updatedAt: data.updated_at
  };
};

export async function getInstructorCompensationProfile(
  instructorId: string
): Promise<InstructorCompensationProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('instructor_compensation_profiles')
    .select('*')
    .eq('instructor_id', instructorId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    instructorId: data.instructor_id,
    billingModel: data.billing_model as InstructorCompensationProfile['billingModel'],
    selectedPricingOptionId: data.selected_pricing_option_id ?? '',
    monthlyMinimumHours: data.monthly_minimum_hours ?? 0,
    overtimeRatePerHour: data.overtime_rate_per_hour ?? undefined,
    approvalStatus: data.approval_status as InstructorCompensationProfile['approvalStatus'],
    adminNotes: data.admin_notes ?? undefined,
    reviewedByProfileId: data.reviewed_by_profile_id ?? undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function getInstructorCertification(
  instructorId: string
): Promise<InstructorCertification | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('instructor_certifications')
    .select('*')
    .eq('instructor_id', instructorId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    instructorId: data.instructor_id,
    trainingCompletedAt: data.training_completed_at ?? undefined,
    trainingMeetingLink: data.training_meeting_link ?? undefined,
    examPassed: data.exam_passed,
    examScore: data.exam_score ?? undefined,
    certifiedAt: data.certified_at ?? undefined,
  };
}

export async function getProfileUpdateRequestsByInstructor(
  instructorId: string
): Promise<import('@/types').ProfileUpdateRequest[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profile_update_requests')
    .select('*')
    .eq('instructor_id', instructorId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    instructorId: row.instructor_id,
    requestedChanges: (row.requested_changes ?? {}) as import('@/types').ProfileUpdateRequest['requestedChanges'],
    status: row.status as import('@/types').ProfileUpdateRequest['status'],
    adminFeedback: row.admin_feedback ?? undefined,
    createdAt: row.created_at,
  }));
}

export const getSessions = async (): Promise<SessionWithDetails[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('sessions')
    .select('*, course_subscriptions(*)')
    .order('scheduled_at', { ascending: true });

  if ((error || !data || data.length === 0)) {
    if (process.env.NODE_ENV === 'development') {
      return mockSessions;
    }
    return [];
  }

  return data.map((sess: any) => {
    const sub = sess.course_subscriptions;
    return {
      id: sess.id,
      courseSubscriptionId: sess.course_subscription_id,
      sessionNumber: sess.session_number,
      instructorId: sess.instructor_id || undefined,
      status: sess.status as any,
      scheduledAt: sess.scheduled_at,
      createdAt: sess.created_at,
      updatedAt: sess.updated_at || sess.created_at,
      meetingUrl: sess.meeting_url || undefined,
      // joined details
      userId: sub?.user_id || 'unknown',
      participantType: sub?.participant_type || 'self',
      childId: sub?.child_id || undefined,
      packageId: sub?.package_id || 'unknown',
    };
  });
};

export const getBookings = async (): Promise<Booking[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('bookings')
    .select('*');
  if (error || !data) return [];
  return data.map((b: any) => ({
    id: b.id,
    sessionId: b.session_id,
    status: b.status as any,
    bookedAt: b.booked_at
  }));
};


/** The pricing tiers an instructor can choose from. */
export async function getInstructorPricingOptions(): Promise<InstructorPricingOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('instructor_pricing_options')
    .select('*')
    .eq('is_active', true)
    .order('base_price_per_session', { ascending: true });

  if (error || !data) {
    if (process.env.NODE_ENV === 'development') return mockInstructorPricingOptions;
    return [];
  }

  return data.map((o) => ({
    id: o.id,
    label: o.label,
    basePricePerSession: o.base_price_per_session,
    isActive: o.is_active,
  }));
}

/** The latest saved report for a session, if the instructor has written one. */
export async function getSessionReport(sessionId: string): Promise<{
  attendance: 'present' | 'absent';
  report: string;
  createdAt: string;
} | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('session_reports')
    .select('attendance, report, updated_at')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (error || !data) return null;
  return {
    attendance: data.attendance === 'absent' ? 'absent' : 'present',
    report: data.report ?? '',
    createdAt: data.updated_at,
  };
}

/**
 * صفوف شاشة إدارة المدربين.
 *
 * الشاشة محتاجة معلومات من ثلاث جداول: المدرب نفسه، هل عنده طلب مراجعة
 * معلّق، وهل مشترك في خدمات إبداعية معتمدة. بنجيبهم في ثلاث استعلامات
 * مجمّعة بدل استعلام لكل مدرب (اللي كان هيبقى 200 استعلام لـ200 مدرب).
 */
export interface InstructorAdminRow extends Instructor {
  hasPendingReview: boolean;
  activeServicesCount: number;
}

export const getInstructorsForAdmin = async (): Promise<InstructorAdminRow[]> => {
  const instructors = await getInstructors();
  if (instructors.length === 0) return [];

  const supabase = await createClient();
  const ids = instructors.map((i) => i.id);

  const [{ data: pending }, { data: services }] = await Promise.all([
    supabase
      .from('profile_update_requests')
      .select('instructor_id')
      .eq('status', 'pending')
      .in('instructor_id', ids),
    supabase
      .from('instructor_services')
      .select('instructor_id')
      .eq('status', 'approved')
      .eq('is_active', true)
      .in('instructor_id', ids),
  ]);

  const pendingSet = new Set((pending ?? []).map((r) => r.instructor_id));
  const serviceCount = new Map<string, number>();
  for (const row of services ?? []) {
    serviceCount.set(row.instructor_id, (serviceCount.get(row.instructor_id) ?? 0) + 1);
  }

  return instructors.map((inst) => ({
    ...inst,
    hasPendingReview: pendingSet.has(inst.id),
    activeServicesCount: serviceCount.get(inst.id) ?? 0,
  }));
};
