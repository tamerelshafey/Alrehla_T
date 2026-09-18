import {
  WritingPackage, Instructor, PersonalizedProduct, AddonProduct, SubscriptionTier, 
  Testimonial, CreativeService, BlogPost, UserProfile, Booking, SessionWithDetails, Order, 
  Publisher, InstructorPayout, PublisherPayout, SessionMessage, SessionAttachment, 
  StudyMaterial, InstructorStudent, BoxSubscription, SupportTicket, 
  JoinRequest, SupportSessionRequest, AuditLog, ServiceOrder, CourseSubscription, 
  SupportTicketMessage, FamilyMember, NotificationItem, UserRole,
  PublisherOrder,
  InstructorPricingOption, PricingFormulaSettings, InstructorCompensationProfile, InstructorCertification,
  BookedSlot, DayOfWeek
} from '@/types';
import { cookies } from 'next/headers';
import { createPublicClient } from '@/lib/supabase/public';
import { getParticipantName } from '@/data/domains/account';
import { createClient } from '@/lib/supabase/server';
import { cairoParts } from '@/lib/timezone';

// Import from auth if needed




export const getWritingPackages = async (): Promise<WritingPackage[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from('creative_writing_packages')
    .select('*')
    .order('created_at', { ascending: true });

  if ((error || !data || data.length === 0)) {
    return [];
  }

  return data.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    ageGroup: p.age_group,
    track: (p.track as import('@/types').PackageTrack | null) ?? null,
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

export const getInstructors = async (): Promise<Instructor[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from('instructors')
    .select('*')
    .order('created_at', { ascending: false });

  if ((error || !data || data.length === 0)) {
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
  const supabase = createPublicClient();
  const { data, error } = await supabase.from('instructors')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;

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





/**
 * رسائل الجلسة.
 *
 * كانت بترجّع رسالتين مكتوبتين في الكود من أشخاص مخترعين بتواريخ 2024،
 * وبتتعرض في صفحة الجلسة في لوحة الإدارة كأنها محادثة حقيقية.
 *
 * ملاحظة: عمود الربط في الجدول اسمه `booking_id` من تسمية قديمة، وبنمرّر
 * له رقم الجلسة — ده الربط الوحيد الموجود.
 */
export const getSessionMessages = async (sessionId: string): Promise<SessionMessage[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('session_messages')
    .select('id, booking_id, sender_profile_id, message, created_at')
    .eq('booking_id', sessionId)
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) return [];

  const senderIds = [...new Set(data.map((m) => m.sender_profile_id).filter(Boolean))];
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('id, full_name')
    .in('id', senderIds);

  const nameById = new Map((profiles ?? []).map((p) => [String(p.id), p.full_name]));

  return data.map((m) => ({
    id: m.id,
    sessionId: m.booking_id,
    senderName: nameById.get(String(m.sender_profile_id)) ?? 'مستخدم',
    message: m.message,
    createdAt: m.created_at,
  }));
};

/** مرفقات الجلسة. كانت ملفين مخترعين بروابط «#» ما بتفتحش حاجة. */
export const getSessionAttachments = async (sessionId: string): Promise<SessionAttachment[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('session_attachments')
    .select('id, booking_id, file_name, file_url')
    .eq('booking_id', sessionId);

  if (error || !data) return [];

  return data.map((a) => ({
    id: a.id,
    sessionId: a.booking_id,
    fileName: a.file_name,
    fileUrl: a.file_url,
  }));
};

/**
 * المواد الدراسية.
 *
 * كانت تلات مواد مخترعة مربوطة بأسماء باقات مخترعة — وكل طالب في المنصة
 * بيشوف نفس التلاتة.
 */
export const getStudyMaterials = async (): Promise<StudyMaterial[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('study_materials')
    .select('id, title, description, package_id')
    .order('title', { ascending: true });

  if (error || !data || data.length === 0) return [];

  const packageIds = [...new Set(data.map((m) => m.package_id).filter(Boolean))] as string[];
  const { data: packages } = packageIds.length
    ? await supabase
        .from('creative_writing_packages')
        .select('id, name')
        .in('id', packageIds)
    : { data: [] as { id: string; name: string }[] };

  const packageName = new Map((packages ?? []).map((p) => [p.id, p.name]));

  return data.map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description ?? '',
    packageName: m.package_id ? (packageName.get(m.package_id) ?? '—') : '—',
  }));
};

/**
 * طلاب المدرب الحالي.
 *
 * كانت بترجّع تلات طلاب مخترعين لكل مدرب في المنصة: أسماء وتقدّم مالهمش
 * وجود في قاعدة البيانات.
 *
 * التعريف الحقيقي لـ«طالبي»: صاحب اشتراك ليه جلسة مسندة ليّا. ودي نفس
 * العلاقة اللي صلاحيات القاعدة بتستخدمها (دالة `instructor_teaches`)،
 * عشان اللي الشاشة بتعرضه يبقى هو نفسه اللي الصلاحيات بتسمح بيه.
 *
 * ملاحظة: لو المشارك طفل، النصوص مربوطة بحساب ولي الأمر — فالرقم
 * المستخدم هو رقم الحساب، والاسم المعروض هو اسم المشارك.
 */
export const getInstructorStudents = async (): Promise<InstructorStudent[]> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: instructor } = await supabase
    .from('instructors')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!instructor) return [];

  // ── ليه التعريف اتغيّر ──────────────────────────────────────
  //
  // القايمة كانت بتتبني من **جدول الجلسات وحده**: بنجيب جلسات المدرب،
  // ومنها نوصل للاشتراكات. يعني أي متدرب:
  //   • اشتراكه اتأكد قبل ما توليد الجلسات يتضاف للمشروع، أو
  //   • جلساته اتعملت بلا مدرب (العميل ما اختارش واحد في المعالج)، أو
  //   • اتعيّنله مدرب على الاشتراك من غير ما الجلسات تتولّد
  // كان **مش بيظهر خالص** — والقايمة تفضل فاضية والمدرب عنده متدربين
  // فعلًا.
  //
  // «متدرب المدرب» = اشتراك مربوط بيه. الجلسات مصدر «التقدم» بس، مش
  // مصدر وجود المتدرب من أصله.
  const [{ data: byPreference }, { data: mySessions }] = await Promise.all([
    supabase
      .from('course_subscriptions')
      .select('id, user_id, child_id, package_id')
      .eq('preferred_instructor_id', instructor.id),
    supabase
      .from('sessions')
      .select('id, status, course_subscription_id')
      .eq('instructor_id', instructor.id),
  ]);

  // اشتراك جلساته مسنَدة للمدرب من غير ما يكون هو «المدرب المفضّل»
  // (الإدارة عيّنته على الجلسات) — ده متدربه برضه.
  const known = new Set((byPreference ?? []).map((s) => s.id));
  const extraIds = [
    ...new Set(
      (mySessions ?? [])
        .map((s) => s.course_subscription_id)
        .filter((id): id is string => Boolean(id) && !known.has(id)),
    ),
  ];

  let extra: typeof byPreference = [];
  if (extraIds.length > 0) {
    const { data } = await supabase
      .from('course_subscriptions')
      .select('id, user_id, child_id, package_id')
      .in('id', extraIds);
    extra = data ?? [];
  }

  const subscriptions = [...(byPreference ?? []), ...(extra ?? [])];
  if (subscriptions.length === 0) return [];

  const packageIds = [...new Set(subscriptions.map((sub) => sub.package_id).filter(Boolean))];
  const { data: packages } = await supabase
    .from('creative_writing_packages')
    .select('id, name, sessions_count')
    .in('id', packageIds);

  const packageById = new Map((packages ?? []).map((p) => [p.id, p]));

  const rows: InstructorStudent[] = [];
  for (const sub of subscriptions) {
    const mine = (mySessions ?? []).filter((s) => s.course_subscription_id === sub.id);
    const pkg = packageById.get(sub.package_id);
    rows.push({
      id: String(sub.user_id),
      name: await getParticipantName(sub.child_id ?? undefined, String(sub.user_id)),
      packageName: pkg?.name ?? 'باقة محذوفة',
      sessionsCompleted: mine.filter((s) => s.status === 'completed').length,
      // عدد جلسات الباقة هو المرجع. لو الجلسات لسه ماتولّدتش، التقدم
      // بيبقى «0 / 8» بدل ما المتدرب يختفي.
      totalSessions: pkg?.sessions_count ?? mine.length,
    });
  }

  return rows;
};


/**
 * المواعيد المحجوزة فعلًا لكل مدرب.
 *
 * ليه موجودة: `WeeklySlot.isBooked` **مفيش حاجة في المشروع بتكتبه** —
 * ولا سطر. فمعالج الحجز كان بيعرض كل مواعيد المدرب لكل عميل إلى الأبد،
 * وعميلين يقدروا يحجزوا نفس المدرب في نفس الساعة من نفس اليوم.
 *
 * الحساب من الواقع لا من علامة يدوية: أي **جلسة قادمة** للمدرب بتشغّل
 * ميعادها، والميعاد بيفضى بعد آخر جلسة فيه. يعني باقة ماشية شهرين
 * بتقفل ميعادها شهرين — وده اللي كان مطلوب.
 *
 * اليوم والساعة بيتقروا بتوقيت القاهرة — نفس الأساس اللي جدول المدرب
 * مكتوب بيه واللي `buildSessionSchedule` بيولّد بيه. قراءتها بتوقيت
 * الخادم (UTC على Vercel) كانت هتخلي ميعاد «18:00» في الجدول ما
 * يقابلش الجلسة المسجّلة له.
 */
export async function getBookedSlotsByInstructor(
  instructorIds: string[],
): Promise<Record<string, BookedSlot[]>> {
  const result: Record<string, BookedSlot[]> = {};
  if (instructorIds.length === 0) return result;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sessions')
    .select('instructor_id, scheduled_at, status')
    .in('instructor_id', instructorIds)
    .gte('scheduled_at', new Date().toISOString())
    .neq('status', 'cancelled');

  if (error || !data) return result;

  const DAYS: DayOfWeek[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];

  // (المدرب، اليوم، الساعة) ← أبعد جلسة
  const latest = new Map<string, { instructorId: string; slot: BookedSlot }>();

  for (const row of data) {
    if (!row.instructor_id) continue;
    const at = new Date(row.scheduled_at);
    if (Number.isNaN(at.getTime())) continue;

    const p = cairoParts(at);
    const day = DAYS[p.weekday];
    const time = `${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
    const key = `${row.instructor_id}|${day}|${time}`;

    const current = latest.get(key);
    if (!current || new Date(current.slot.bookedUntil) < at) {
      latest.set(key, {
        instructorId: row.instructor_id,
        slot: { day, time, bookedUntil: at.toISOString() },
      });
    }
  }

  for (const { instructorId, slot } of latest.values()) {
    (result[instructorId] ??= []).push(slot);
  }

  return result;
}

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
    return { id: 'default', platformMultiplier: 1, fixedAdminFee: 0, updatedAt: new Date().toISOString() };
  }

  return {
    id: data.id,
    platformMultiplier: data.platform_multiplier,
    fixedAdminFee: data.fixed_admin_fee,
    updatedAt: data.updated_at
  };
};

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

export async function getInstructorPricingOptions(): Promise<InstructorPricingOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('instructor_pricing_options')
    .select('*')
    .eq('is_active', true)
    .order('base_price_per_session', { ascending: true });

  if (error || !data) {
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
    // العدّ من `provider_services` عبر صف مقدّم الخدمة بتاع المدرب —
    // ده الجدول اللي العميل بيشوف منه. العدّ من `instructor_services`
    // كان بيدّي الإدارة رقمًا مالوش علاقة باللي معروض فعلًا.
    supabase
      .from('provider_services')
      .select('service_providers!inner(instructor_id)')
      .eq('status', 'approved')
      .eq('is_active', true)
      .in('service_providers.instructor_id', ids),
  ]);

  const pendingSet = new Set((pending ?? []).map((r) => r.instructor_id));
  const serviceCount = new Map<string, number>();
  for (const row of services ?? []) {
    const linked = row.service_providers as unknown as { instructor_id: string | null } | null;
    const id = linked?.instructor_id;
    if (!id) continue;
    serviceCount.set(id, (serviceCount.get(id) ?? 0) + 1);
  }

  return instructors.map((inst) => ({
    ...inst,
    hasPendingReview: pendingSet.has(inst.id),
    activeServicesCount: serviceCount.get(inst.id) ?? 0,
  }));
};

/** حجز كتابة كما تراه الإدارة. */
export type AdminCourseBooking = {
  id: string;
  participantName: string;
  packageName: string;
  amount: number | null;
  status: string;
  paymentReference: string | null;
  paymentMethod: string | null;
  paymentReceiptUrl: string | null;
  preferredInstructorId: string | null;
  preferredInstructorName: string | null;
  createdAt: string;
  startedAt: string | null;
  sessionsCount: number;
};

/**
 * حجوزات الكتابة للإدارة.
 *
 * شاشة الحجوزات كانت مبنية على جدول **الجلسات**، وبتطابقها بطلبات
 * الخدمات بنفس الرقم («نفترض تطابق 1:1» زي ما كان مكتوب في الكود).
 * ولما وقفنا إنشاء الجلسة التلقائية بتاريخ مخترع، الحجز الجديد مكانش
 * هيظهر في أي شاشة.
 *
 * الحجز = صف في `course_subscriptions`. والجلسات بتتجدول بعد تأكيد الدفع.
 */
export async function getCourseBookingsForAdmin(): Promise<AdminCourseBooking[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('course_subscriptions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) return [];

  const packageIds = [...new Set(data.map((r) => r.package_id).filter(Boolean))];
  const instructorIds = [
    ...new Set(data.map((r) => r.preferred_instructor_id).filter(Boolean)),
  ] as string[];

  const [{ data: packages }, { data: instructors }, { data: sessions }] = await Promise.all([
    supabase.from('creative_writing_packages').select('id, name').in('id', packageIds),
    instructorIds.length
      ? supabase.from('instructors').select('id, display_name').in('id', instructorIds)
      : Promise.resolve({ data: [] as { id: string; display_name: string }[] }),
    supabase.from('sessions').select('id, course_subscription_id'),
  ]);

  const packageName = new Map((packages ?? []).map((p) => [p.id, p.name]));
  const instructorName = new Map((instructors ?? []).map((i) => [i.id, i.display_name]));

  const rows: AdminCourseBooking[] = [];
  for (const row of data) {
    rows.push({
      id: row.id,
      participantName: await getParticipantName(row.child_id ?? undefined, row.user_id),
      packageName: packageName.get(row.package_id) ?? 'باقة محذوفة',
      amount: row.amount ?? null,
      status: row.status,
      paymentReference: row.payment_reference ?? null,
      paymentMethod: row.payment_method ?? null,
      paymentReceiptUrl: row.payment_receipt_url ?? null,
      preferredInstructorId: row.preferred_instructor_id ?? null,
      preferredInstructorName: row.preferred_instructor_id
        ? (instructorName.get(row.preferred_instructor_id) ?? null)
        : null,
      createdAt: row.created_at,
      startedAt: row.started_at ?? null,
      sessionsCount: (sessions ?? []).filter((x) => x.course_subscription_id === row.id).length,
    });
  }

  return rows;
}
