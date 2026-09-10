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
  await new Promise(resolve => setTimeout(resolve, 600));
  return Promise.resolve(mockWritingPackages);
};

export const getWritingPackageBySlug = async (
  slug: string
): Promise<WritingPackage | null> => {
  const pkg = mockWritingPackages.find((p) => p.slug === slug);
  return Promise.resolve(pkg || null);
};

export const getInstructors = async (): Promise<Instructor[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return Promise.resolve(mockInstructors);
};

export const getInstructorById = async (
  id: string
): Promise<Instructor | null> => {
  const inst = mockInstructors.find((i) => i.id === id);
  return Promise.resolve(inst || null);
};

export const getCreativeServices = async (): Promise<CreativeService[]> => {
  return Promise.resolve(mockCreativeServices);
};

export const mockBookings: Booking[] = [
  {
    id: 'bkg-1',
    independentParticipantId: 'student-1',
    packageId: 'pkg-1',
    instructorId: 'inst-1',
    status: 'confirmed',
    scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(), // +2 days
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'bkg-2',
    dependentParticipantId: 'dep-child-2',
    packageId: 'pkg-2',
    instructorId: 'inst-2',
    status: 'completed',
    scheduledAt: new Date(Date.now() - 86400000 * 3).toISOString(), // -3 days
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'bkg-3',
    independentParticipantId: 'student-3',
    packageId: 'pkg-1',
    instructorId: 'inst-1',
    status: 'pending',
    scheduledAt: new Date(Date.now() + 86400000 * 5).toISOString(), // +5 days
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export const mockPortfolioItems: PortfolioItem[] = [
  {
    id: 'port-1',
    independentParticipantId: 'student-1',
    title: 'رسالة إلى صديقي الخيالي',
    excerpt: 'كان يجلس دائماً على حافة النافذة، يخبرني عن أسرار الغيوم...',
    packageName: 'الكلمات الذهبية',
    sessionNumber: 3,
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: 'port-2',
    independentParticipantId: 'student-1',
    title: 'قصة الشجرة التي رفضت أن تكبر',
    excerpt:
      'في الغابة البعيدة، كانت هناك شجرة صغيرة ترفض أن تمتد جذورها في الأرض...',
    packageName: 'الكلمات الذهبية',
    sessionNumber: 6,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'port-3',
    independentParticipantId: 'student-1',
    title: 'حوار مع غيمة',
    excerpt:
      'سألتها: لماذا تبكين دائماً في الشتاء؟ فقالت: هذه ليست دموع، بل هدايا للأرض.',
    packageName: 'السطور السحرية',
    sessionNumber: 1,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export const getBookings = async (): Promise<Booking[]> => {
  return Promise.resolve(mockBookings);
};

export const getPortfolioItems = async (): Promise<PortfolioItem[]> => {
  return Promise.resolve(mockPortfolioItems);
};

export const getSessionMessages = async (sessionId: string): Promise<SessionMessage[]> => {
  return [
    { id: '1', senderName: 'سارة أحمد', message: 'مرحباً، أهلاً بك في الجلسة القادمة.', createdAt: '2024-06-14T10:00:00Z' },
    { id: '2', senderName: 'ياسمين طارق', message: 'أهلاً بك أستاذة، أنا متحمسة جداً!', createdAt: '2024-06-14T10:05:00Z' }
  ];
};

export const getSessionAttachments = async (sessionId: string): Promise<SessionAttachment[]> => {
  return [
    { id: '1', fileName: 'ملخص_الأساسيات.pdf', fileUrl: '#' },
    { id: '2', fileName: 'تدريب_الخيال.docx', fileUrl: '#' }
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

export const getAvailabilitySlots = async (): Promise<AvailabilitySlot[]> => {
  return [
    { id: 'slot-1', dayLabel: 'السبت، 15 أكتوبر', timeLabel: '04:00 عصراً', isBooked: true },
    { id: 'slot-2', dayLabel: 'السبت، 15 أكتوبر', timeLabel: '05:30 مساءً', isBooked: false },
    { id: 'slot-3', dayLabel: 'الأحد، 16 أكتوبر', timeLabel: '03:00 عصراً', isBooked: true },
    { id: 'slot-4', dayLabel: 'الأحد، 16 أكتوبر', timeLabel: '04:30 عصراً', isBooked: false },
    { id: 'slot-5', dayLabel: 'الإثنين، 17 أكتوبر', timeLabel: '06:00 مساءً', isBooked: false },
    { id: 'slot-6', dayLabel: 'الإثنين، 17 أكتوبر', timeLabel: '07:30 مساءً', isBooked: true },
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
    guardianProfileId: 'parent-1',
    dependentParticipantId: 'dep-child-1',
    status: 'active',
    startedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    id: 'csub-2',
    packageId: 'pkg-2',
    independentParticipantId: 'student-1',
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
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockDocuments.filter(d => d.studentId === studentId);
}

export async function getDocumentById(id: string) {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockDocuments.find(d => d.id === id);
}


export const mockInstructorWeeklyAvailability: import('@/types').InstructorWeeklyAvailability[] = [
  {
    id: 'iwa-1',
    instructorId: 'inst-1',
    dayOfWeek: 'saturday',
    startTime: '10:00',
    endTime: '14:00',
    isActive: true,
    createdAt: '2023-10-01T10:00:00Z'
  },
  {
    id: 'iwa-2',
    instructorId: 'inst-1',
    dayOfWeek: 'monday',
    startTime: '16:00',
    endTime: '20:00',
    isActive: true,
    createdAt: '2023-10-01T10:00:00Z'
  },
  {
    id: 'iwa-3',
    instructorId: 'inst-2',
    dayOfWeek: 'sunday',
    startTime: '14:00',
    endTime: '18:00',
    isActive: true,
    createdAt: '2023-10-01T10:00:00Z'
  },
  {
    id: 'iwa-4',
    instructorId: 'inst-2',
    dayOfWeek: 'wednesday',
    startTime: '16:00',
    endTime: '21:00',
    isActive: true,
    createdAt: '2023-10-01T10:00:00Z'
  }
];

export const mockRecurringSessionSlots: import('@/types').RecurringSessionSlot[] = [
  {
    id: 'rss-1',
    courseSubscriptionId: 'csub-1',
    instructorId: 'inst-1',
    dayOfWeek: 'saturday',
    startTime: '10:00',
    status: 'active',
    effectiveFrom: '2023-10-05T00:00:00Z',
    createdAt: '2023-10-02T10:00:00Z'
  },
  {
    id: 'rss-2',
    courseSubscriptionId: 'csub-2',
    instructorId: 'inst-2',
    dayOfWeek: 'sunday',
    startTime: '14:00',
    status: 'active',
    effectiveFrom: '2023-10-10T00:00:00Z',
    createdAt: '2023-10-08T10:00:00Z'
  }
];

export const mockSlotChangeRequests: import('@/types').SlotChangeRequest[] = [
  {
    id: 'scr-1',
    recurringSlotId: 'rss-1',
    requestedBy: 'guardian',
    requestedDayOfWeek: 'monday',
    requestedStartTime: '16:00',
    reason: 'تغيير مواعيد المدرسة',
    status: 'pending',
    createdAt: '2023-10-20T10:00:00Z'
  }
];

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

export const getWeeklyAvailability = async (instructorId: string) =>
  Promise.resolve(mockInstructorWeeklyAvailability.filter(a => a.instructorId === instructorId));

export const getRecurringSlotBySubscription = async (courseSubscriptionId: string) =>
  Promise.resolve(mockRecurringSessionSlots.find(s => s.courseSubscriptionId === courseSubscriptionId) || null);

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
