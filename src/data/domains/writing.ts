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
import { createClient } from '@/lib/supabase/server';

// Import from auth if needed
import { mockAllUsers, mockCurrentUser } from './auth';

export const mockWritingPackages: WritingPackage[] = [
  // مسار الإبداع التأسيسي (دون 12 سنة)
  {
    id: 'pkg-1',
    slug: 'golden-words',
    name: 'الكلمات الذهبية',
    ageGroup: 'under_12',
    price: 2990,
    durationText: '3 أشهر',
    sessionsCount: 12,
    sessionDuration: '40 دقيقة',
    targetAudience:
      'تناسب الطفل الذي يخوض تجربة منظمة أولى مع الكتابة، أو يريد اكتشاف علاقته بها في مساحة فردية دافئة وخفيفة، دون الحاجة إلى خبرة سابقة.',
    prerequisiteNote:
      'مستقلة بذاتها (يمكن الانتقال بعدها إلى السطور السحرية لكنها ليست شرطًا لها)',
    shortDescription: 'رحلة استكشافية قصيرة للمبتدئين.',
    fullDescription: 'دورة تركز على اكتشاف الكتابة كمساحة للتعبير...',
    isActive: true,
  },
  {
    id: 'pkg-2',
    slug: 'magic-lines',
    name: 'السطور السحرية',
    ageGroup: 'under_12',
    price: 5990,
    durationText: '6 أشهر',
    sessionsCount: 24,
    targetAudience:
      'تناسب الطفل الذي يريد مساحة أطول للكتابة والتجريب، ويرغب في توسيع أدواته واكتشاف أنواع متعددة من الكتابة والعمل على مشروع كتابي خاص يمتد عبر فترة أطول.',
    prerequisiteNote: 'لا تشترط إتمام الكلمات الذهبية مسبقًا',
    shortDescription: 'رحلة أطول لتوسيع أدوات الكتابة وبناء مشروع.',
    fullDescription: 'دورة لتوسيع مهارات الكتابة وبناء مشروع شخصي...',
    isActive: true,
  },
  // مسار اليافعين والكبار (12 سنة فأعلى)
  {
    id: 'pkg-3',
    slug: 'first-spark',
    name: 'الشرارة الأولى',
    ageGroup: '12_plus',
    price: 2990,
    durationText: '3 أشهر',
    sessionsCount: 12,
    sessionDuration: '40 دقيقة',
    targetAudience:
      'تناسب اليافع أو الشاب أو الكبير الذي يريد أن يبدأ ممارسة الكتابة، أو يكتشف علاقته بها، أو يحوّل أفكاره الأولى إلى نصوص فعلية، دون الحاجة إلى الاشتراك في مسار طويل.',
    prerequisiteNote: 'مستقلة بذاتها',
    shortDescription: 'رحلة قصيرة لتحويل الأفكار إلى نصوص.',
    fullDescription: 'الخطوة الأولى في عالم الكتابة والتعبير...',
    isActive: true,
  },
  {
    id: 'pkg-4',
    slug: 'crafting-impact',
    name: 'صياغة الأثر',
    ageGroup: '12_plus',
    price: 5990,
    durationText: '6 أشهر',
    sessionsCount: 24,
    targetAudience:
      'تناسب من يريد أن يمنح الكتابة وقتًا أطول، ويعمّق أدواته، ويجرب أكبر من نوع أدبي، ثم ينتقل إلى بناء مشروع كتابي خاص به.',
    prerequisiteNote: 'مستقلة بذاتها، ويمكن الاشتراك فيها مباشرة',
    shortDescription: 'مسار متعمق لتجربة أنواع أدبية مختلفة.',
    fullDescription: 'برنامج متكامل يعمق أدوات الكاتب ويوسع مداركه...',
    isActive: true,
  },
  {
    id: 'pkg-5',
    slug: 'story-maker',
    name: 'صانع الحكاية',
    ageGroup: '12_plus',
    price: 11990,
    durationText: '6 أشهر',
    sessionsCount: 24,
    targetAudience:
      'تناسب المشارك الذي أتم «صياغة الأثر» وأصبح لديه أساس كتابي ومشروع يمكن تطويره، ويريد التعمق في بناء الحكاية والعمل على مشروع أدبي أكبر امتدادًا.',
    prerequisiteNote: 'يشترط إتمام رحلة صياغة الأثر أولًا',
    prerequisitePackageId: 'pkg-4',
    shortDescription: 'رحلة لبناء وتطوير مشروع أدبي متكامل.',
    fullDescription:
      'التعمق في بناء الحكاية والشخصيات وتطوير مشروع أدبي متماسك...',
    isActive: true,
  },
  {
    id: 'pkg-6',
    slug: 'journey-to-story',
    name: 'رحلتي نحو الحكاية',
    ageGroup: '12_plus',
    price: 19190,
    durationText: '12 شهر (البرنامج الكامل)',
    sessionsCount: 48,
    targetAudience:
      'تناسب من يريد خوض مسار سنوي واحد متصل بدلًا من رحلتين منفصلتين، ويبحث عن تجربة متصلة تمنحه الوقت للانتقال من التأسيس والتجريب إلى بناء المشروع ثم صقله وتطوير ملف أعماله.',
    prerequisiteNote:
      'لا تشترط إتمام أي رحلة سابقة، لأنها تحتوي المسار الكامل داخل تجربة سنوية واحدة',
    shortDescription: 'المسار الكامل من التجريب إلى صقل مشروع التخرج.',
    fullDescription:
      'برنامج سنوي شامل ينتقل بالكاتب من نقطة البداية وحتى إنهاء مشروعه...',
    isActive: true,
  },
];

export const mockInstructors: Instructor[] = [
  {
    id: 'inst-1',
    status: 'active',
    userId: 'user-101',
    displayName: 'سارة أحمد',
    bio: 'مدربة معتمدة بخبرة واسعة في تنمية مهارات الكتابة الإبداعية لدى الأطفال.',
    specialties: ['كتابة إبداعية', 'الخيال العلمي'],
    yearsExperience: 5,
    isSample: true,
    trainingPassed: true,
    workModel: 'per_session',
    requestedPrice: 150,
    approvedPrice: 150,
    weeklySchedule: [
      { day: 'saturday', time: '10:00', isBooked: true },
      { day: 'saturday', time: '12:00' },
      { day: 'monday', time: '16:00' }
    ]
  },
  {
    id: 'inst-2',
    status: 'active',
    userId: 'user-102',
    displayName: 'خالد عبد الله',
    bio: 'كاتب متخصص في أدب الطفل وحائز على عدة جوائز محلية.',
    specialties: ['الكتابة للأطفال', 'بناء الشخصيات'],
    yearsExperience: 7,
    isSample: true,
    trainingPassed: true,
    workModel: 'monthly',
    monthlyHoursCommitted: 60,
    requestedPrice: 120,
    approvedPrice: 120,
    weeklySchedule: [
      { day: 'sunday', time: '14:00' },
      { day: 'tuesday', time: '14:00' },
      { day: 'thursday', time: '14:00' }
    ]
  },
  {
    id: 'inst-pending',
    userId: 'user-new',
    displayName: 'محمود طارق',
    bio: 'مدرب شغوف بتعليم أساسيات السرد القصصي.',
    specialties: ['كتابة الخيال'],
    yearsExperience: 2,
    status: 'pending_approval',
    trainingPassed: true,
    workModel: 'per_session',
    requestedPrice: 200, // Wants a higher price
    weeklySchedule: [
      { day: 'wednesday', time: '18:00' }
    ]
  },
  {
    id: 'inst-training',
    userId: 'user-training',
    displayName: 'منى سعيد',
    bio: 'كاتبة شابة تسعى للانضمام للمنصة.',
    specialties: ['الشعر'],
    yearsExperience: 1,
    status: 'pending_training',
    trainingPassed: false,
    workModel: 'monthly',
    monthlyHoursCommitted: 80,
    requestedPrice: 100,
    weeklySchedule: []
  }
];

export const mockCreativeServices: CreativeService[] = [
  {
    id: "review-1",
    name: "مراجعة نص",
    price: 650,
    description: "مراجعة لغوية وفنية لقصة الطفل.",
  },
  {
    id: "video-1",
    name: "فيديو قصة",
    price: 1250,
    description: "فيديو لقصتك",
  },
  {
    id: "publish-1",
    name: "نشر قصة",
    price: 2450,
    description: "انشر قصتك داخل احد انتجاتنا",
  },
  {
    id: "publish-2",
    name: "نشر كتابك الخاص",
    price: 8450,
    description: "نشر كتابك الخاص",
  },
  {
    id: "consult-1",
    name: "استشارة تربوية",
    price: 650,
    description: "جلسة استشارة لولي الأمر. جلسة استشارة لولي الأمر.",
  },
  {
    id: "adv-1",
    name: "تهههح",
    price: 230,
    description: "مغامرة إبداعية مخصصة",
  },
  {
    id: "audio-1",
    name: "قصة مسموعة",
    price: 590,
    description: "قصة مسموعة",
  },
];

export const getWritingPackages = async (): Promise<WritingPackage[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('creative_writing_packages')
    .select('*')
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) {
    return mockWritingPackages;
  }

  return data.map(p => ({
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
  const { data, error } = await supabase
    .from('creative_writing_packages')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    const pkg = mockWritingPackages.find((p) => p.slug === slug);
    return pkg || null;
  }

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    ageGroup: data.age_group,
    price: data.price,
    durationText: data.duration_text,
    sessionsCount: data.sessions_count,
    sessionDuration: data.session_duration || undefined,
    targetAudience: data.target_audience,
    prerequisiteNote: data.prerequisite_note || undefined,
    prerequisitePackageId: data.prerequisite_package_id || undefined,
    shortDescription: data.short_description,
    fullDescription: data.full_description,
    isActive: data.is_active
  };
};

export const getInstructors = async (): Promise<Instructor[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('instructors')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    return mockInstructors;
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
  const { data, error } = await supabase
    .from('instructors')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
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
    isSample: data.is_sample,
    status: data.status,
    trainingPassed: data.training_passed,
    workModel: data.work_model,
    requestedPrice: data.requested_price || undefined,
    selectedPricingOptionId: data.selected_pricing_option_id || undefined,
    approvedPrice: data.approved_price || undefined,
    weeklySchedule: (data.weekly_schedule as any[]) || [],
    pendingSchedule: (data.pending_schedule as any[]) || undefined,
    monthlyHoursCommitted: data.monthly_hours_committed || undefined
  };
};

export const getCreativeServices = async (): Promise<CreativeService[]> => {
  return Promise.resolve(mockCreativeServices);
};

export const mockBookings: Booking[] = [
  {
    id: 'bkg-1',
    userId: 'student-1',
    participantType: 'self',
    packageId: 'pkg-1',
    instructorId: 'inst-1',
    status: 'confirmed',
    scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(), // +2 days
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'bkg-2',
    userId: 'current-user',
    participantType: 'child',
    childId: 'dep-child-2',
    packageId: 'pkg-2',
    instructorId: 'inst-2',
    status: 'completed',
    scheduledAt: new Date(Date.now() - 86400000 * 3).toISOString(), // -3 days
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'bkg-3',
    userId: 'student-3',
    participantType: 'self',
    packageId: 'pkg-1',
    instructorId: 'inst-1',
    status: 'pending',
    scheduledAt: new Date(Date.now() + 86400000 * 5).toISOString(), // +5 days
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];



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



export const mockServiceOrders: ServiceOrder[] = [
  {
    id: 'so-1',
    buyerProfileId: 'parent-1',
    packageId: 'pkg-1',
    status: 'paid',
    amount: 1500,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'so-2',
    buyerProfileId: 'parent-2',
    packageId: 'pkg-2',
    status: 'pending',
    amount: 800,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];

export const mockCourseSubscriptions: CourseSubscription[] = [
  {
    id: 'csub-1',
    packageId: 'pkg-1',
    userId: 'parent-1',
    participantType: 'child',
    childId: 'dep-child-1',
    status: 'active',
    startedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    id: 'csub-2',
    packageId: 'pkg-2',
    userId: 'student-1',
    participantType: 'self',
    status: 'completed',
    startedAt: new Date(Date.now() - 86400000 * 40).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
  }
];

export async function getServiceOrders(): Promise<ServiceOrder[]> {
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockServiceOrders;
}

export async function getCourseSubscriptions(): Promise<CourseSubscription[]> {
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockCourseSubscriptions;
}


export const mockDocuments: import('@/types').PortfolioDocument[] = [
  {
    id: 'doc-1',
    studentId: 'user-2',
    title: 'قصتي القصيرة الأولى: البحث عن الضوء',
    content: 'في قرية صغيرة تحيط بها الجبال من كل جانب، كان هناك شاب يدعى مالك. كان مالك يحلم دائماً باكتشاف ما وراء هذه الجبال الشاهقة...',
    status: 'reviewed',
    instructorFeedback: 'بداية ممتازة يا مالك! أسلوبك في الوصف جذاب جداً. أنصحك بالعمل أكثر على الحوار بين الشخصيات لإضفاء مزيد من الحيوية على القصة.',
    updatedAt: '2023-10-20T10:00:00Z'
  },
  {
    id: 'doc-2',
    studentId: 'user-2',
    title: 'مقال: تأثير التكنولوجيا على الأدب',
    content: 'لا شك أن التكنولوجيا الحديثة قد أحدثت ثورة في كل مجالات الحياة، والأدب ليس استثناءً. فمع ظهور الكتب الإلكترونية...',
    status: 'submitted',
    updatedAt: '2023-10-22T14:30:00Z'
  },
  {
    id: 'doc-3',
    studentId: 'user-2',
    title: 'مسودة: رواية الخيال العلمي',
    content: 'في عام 2150، لم تعد الأرض كما نعرفها...',
    status: 'draft',
    updatedAt: '2023-10-25T09:15:00Z'
  }
];

export async function getStudentDocuments(studentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('portfolio_documents')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    return mockDocuments.filter(d => d.studentId === studentId);
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
  const { data, error } = await supabase
    .from('portfolio_documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return mockDocuments.find(d => d.id === id);
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





export const mockInstructorPricingOptions: import('@/types').InstructorPricingOption[] = [
  {
    id: 'ipo-1',
    label: 'مبتدئ',
    basePricePerSession: 100,
    isActive: true
  },
  {
    id: 'ipo-2',
    label: 'متوسط',
    basePricePerSession: 150,
    isActive: true
  },
  {
    id: 'ipo-3',
    label: 'خبير',
    basePricePerSession: 200,
    isActive: true
  }
];

export const mockPricingFormulaSettings: import('@/types').PricingFormulaSettings[] = [
  {
    id: 'default',
    platformMultiplier: 1.2,
    fixedAdminFee: 50,
    updatedAt: '2023-10-01T10:00:00Z'
  }
];

export const mockInstructorCompensationProfiles: import('@/types').InstructorCompensationProfile[] = [
  {
    id: 'icp-1',
    instructorId: 'inst-1',
    billingModel: 'monthly',
    selectedPricingOptionId: 'ipo-2',
    monthlyMinimumHours: 60,
    approvalStatus: 'approved',
    createdAt: '2023-10-01T10:00:00Z',
    updatedAt: '2023-10-02T10:00:00Z'
  },
  {
    id: 'icp-2',
    instructorId: 'inst-2',
    billingModel: 'per_session',
    selectedPricingOptionId: 'ipo-3',
    monthlyMinimumHours: 0,
    approvalStatus: 'approved',
    createdAt: '2023-10-05T10:00:00Z',
    updatedAt: '2023-10-06T10:00:00Z'
  },
  {
    id: 'icp-3',
    instructorId: 'inst-pending',
    billingModel: 'per_session',
    selectedPricingOptionId: 'ipo-1',
    monthlyMinimumHours: 0,
    approvalStatus: 'proposed',
    createdAt: '2023-10-25T10:00:00Z',
    updatedAt: '2023-10-25T10:00:00Z'
  },
  {
    id: 'icp-4',
    instructorId: 'inst-training',
    billingModel: 'monthly',
    selectedPricingOptionId: 'ipo-1',
    monthlyMinimumHours: 60,
    approvalStatus: 'under_discussion',
    createdAt: '2023-10-26T10:00:00Z',
    updatedAt: '2023-10-27T10:00:00Z'
  }
];

export const mockInstructorCertifications: import('@/types').InstructorCertification[] = [
  {
    id: 'ic-1',
    instructorId: 'inst-1',
    trainingCompletedAt: '2023-09-15T10:00:00Z',
    examPassed: true,
    examScore: 95,
    certifiedAt: '2023-09-20T10:00:00Z'
  },
  {
    id: 'ic-2',
    instructorId: 'inst-2',
    trainingCompletedAt: '2023-09-18T10:00:00Z',
    examPassed: true,
    examScore: 92,
    certifiedAt: '2023-09-22T10:00:00Z'
  },
  {
    id: 'ic-3',
    instructorId: 'inst-pending',
    trainingCompletedAt: '2023-10-25T10:00:00Z',
    examPassed: false,
    examScore: 65
  },
  {
    id: 'ic-4',
    instructorId: 'inst-training',
    examPassed: false
  }
];



export const getPricingFormulaSettings = async () =>
  Promise.resolve(mockPricingFormulaSettings[0]);

export const getInstructorCompensationProfile = async (instructorId: string) =>
  Promise.resolve(mockInstructorCompensationProfiles.find(c => c.instructorId === instructorId) || null);

export const getInstructorCertification = async (instructorId: string) =>
  Promise.resolve(mockInstructorCertifications.find(c => c.instructorId === instructorId) || null);

export let mockProfileUpdateRequests: import('@/types').ProfileUpdateRequest[] = [];

export const getProfileUpdateRequestsByInstructor = async (instructorId: string) => {
  return Promise.resolve(mockProfileUpdateRequests.filter(req => req.instructorId === instructorId));
};

export const getBookings = async (): Promise<Booking[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('scheduled_at', { ascending: true });

  if (error || !data || data.length === 0) {
    return mockBookings;
  }

  return data.map((bkg: any) => ({
    id: bkg.id,
    userId: bkg.user_id || 'unknown',
    participantType: bkg.participant_type || 'self',
    childId: bkg.child_id || undefined,
    packageId: bkg.package_id,
    instructorId: bkg.instructor_id || undefined,
    courseSubscriptionId: bkg.course_subscription_id || undefined,
    status: bkg.status,
    scheduledAt: bkg.scheduled_at,
    createdAt: bkg.created_at
  }));
};
