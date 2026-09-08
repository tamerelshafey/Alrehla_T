import { cookies } from 'next/headers';
import {
  WritingPackage,
  Instructor,
  PersonalizedProduct,
  Publisher,
  InstructorPayout,
  PublisherPayout,
  BlogPost,
  UserProfile,
  SessionMessage,
  SessionAttachment,
  StudyMaterial,
  UserRole,
  Testimonial,
  AddonProduct,
  SubscriptionTier,
  CreativeService,
} from '../types';

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
    userId: 'user-101',
    displayName: 'مدربة أولى',
    bio: 'سيتم إضافة الملفات الفعلية للمدربين قريبًا.',
    specialties: ['كتابة إبداعية'],
    yearsExperience: 5,
    isSample: true,
  },
  {
    id: 'inst-2',
    userId: 'user-102',
    displayName: 'مدرب أول',
    bio: 'سيتم إضافة الملفات الفعلية للمدربين قريبًا.',
    specialties: ['الكتابة للأطفال', 'بناء الشخصيات'],
    yearsExperience: 7,
    isSample: true,
  },
];

export const mockProducts: PersonalizedProduct[] = [
  // Custom Products
  {
    id: 'prod-custom-1',
    slug: 'custom-story-book',
    name: 'القصة المخصصة',
    category: 'custom',
    price: 19500,
    electronicPrice: 11970,
    shortDescription: 'قصة فريدة بطلها طفلك، باسمه وصورته وهواياته.',
    coverImageUrl: 'https://picsum.photos/seed/custom1/600/800',
  },
  {
    id: 'prod-custom-2',
    slug: 'emotional-story',
    name: 'القصة الشعورية',
    category: 'custom',
    price: 21000,
    electronicPrice: 13500,
    shortDescription: 'قصة مخصصة لمساعدة طفلك على فهم مشاعره والتعبير عنها.',
    coverImageUrl: 'https://picsum.photos/seed/custom2/600/800',
  },
  {
    id: 'prod-custom-3',
    slug: 'deep-sea-adventures',
    name: 'اعماق البحار',
    category: 'custom',
    price: 6000,
    electronicPrice: 600,
    shortDescription: 'مغامرات شيقة بطلها طفلك في أعماق البحار المحيطات.',
    coverImageUrl: 'https://picsum.photos/seed/custom3/600/800',
  },
  // Library Products
  {
    id: 'prod-lib-1',
    publisherId: 'pub-1',
    slug: 'prophets-stories',
    name: 'قصص الأنبياء للأطفال',
    category: 'library',
    price: 350,
    electronicPrice: 150,
    shortDescription:
      'مجموعة مختارة من قصص الأنبياء بأسلوب مبسط ومناسب للأطفال، مع رسومات توضيحية جميلة (بدون تجسيد).',
    coverImageUrl: 'https://picsum.photos/seed/lib1/600/800',
  },
  {
    id: 'prod-lib-2',
    publisherId: 'pub-2',
    slug: 'little-explorer',
    name: 'موسوعة المستكشف الصغير',
    category: 'library',
    price: 400,
    shortDescription:
      'رحلة في عالم العلوم، الفضاء، جسم الإنسان، والطبيعة. مليئة بالحقائق المدهشة والصور.',
    coverImageUrl: 'https://picsum.photos/seed/lib2/600/800',
  },
  {
    id: 'prod-lib-3',
    publisherId: 'pub-1',
    slug: 'morals-garden',
    name: 'حديقة الأخلاق',
    category: 'library',
    price: 300,
    electronicPrice: 120,
    shortDescription:
      'قصص قصيرة تعلم الأطفال الآداب الإسلامية والأخلاق الحميدة في التعامل مع الأسرة والجيران والأصدقاء.',
    coverImageUrl: 'https://picsum.photos/seed/lib3/600/800',
  },
  {
    id: 'prod-lib-4',
    publisherId: 'pub-2',
    slug: 'bedtime-stories',
    name: 'حكايات قبل النوم',
    category: 'library',
    price: 320,
    electronicPrice: 130,
    shortDescription:
      'مجموعة هادئة ولطيفة من القصص الخيالية القصيرة لتساعد طفلك على الاسترخاء والنوم بأحلام سعيدة.',
    coverImageUrl: 'https://picsum.photos/seed/lib4/600/800',
  },
];

export const mockAddonProducts: AddonProduct[] = [
  {
    id: 'addon-1',
    name: 'دفتر تلوين الأبطال',
    price: 80,
    description:
      'دفتر تلوين يحتوي على شخصيات القصة ومشاهد منها، ليقوم الطفل بتلوين مغامرته بنفسه.',
  },
  {
    id: 'addon-2',
    name: 'ملصقات اسمي',
    price: 50,
    description:
      'مجموعة ملصقات عالية الجودة تحمل اسم طفلك وشخصيات كرتونية لطيفة.',
  },
];

export const mockSubscriptionTiers: SubscriptionTier[] = [
  {
    id: 'sub-1',
    name: 'شهري',
    priceTotal: 450,
    priceMonthly: 450,
    durationMonths: 1,
  },
  {
    id: 'sub-2',
    name: 'ربع سنوي',
    priceTotal: 1200,
    priceMonthly: 400,
    durationMonths: 3,
    savingsNote: 'وفر 150 ج.م',
  },
  {
    id: 'sub-3',
    name: 'نصف سنوي',
    priceTotal: 2100,
    priceMonthly: 350,
    durationMonths: 6,
    savingsNote: 'وفر 600 ج.م',
  },
];

export const mockTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    authorName: 'أم أحمد',
    authorRole: 'ولية أمر',
    content:
      'لم أكن أتخيل أن رؤية ابني لاسمه كبطل للقصة ستغير من حبه للقراءة بهذا الشكل. تجربة رائعة ومختلفة!',
  },
  {
    id: 'test-2',
    authorName: 'د. خالد مصطفى',
    authorRole: 'أخصائي تربوي',
    content:
      'ما تقدمه "الرحلة" في دمج القيم التربوية عبر التخصيص الشخصي يعد نقلة نوعية في أدب الطفل العربي.',
  },
  {
    id: 'test-3',
    authorName: 'سارة',
    authorRole: 'طالبة في دورة الكتابة',
    content:
      'تعلمت كيف أترجم مشاعري إلى كلمات، والأجمل هو الدعم المستمر والمساحة الآمنة للتعبير في دورات بداية الرحلة.',
  },
  {
    id: 'test-4',
    authorName: 'خالد عبد الرحمن',
    authorRole: 'ولي أمر طالب',
    content:
      'أصبح ابني ينتظر موعد الجلسة بشغف. الكتابة تحولت من واجب مدرسي ثقيل إلى مساحة يحبها ويعبر فيها عن نفسه بحرية.',
  },
  {
    id: 'test-5',
    authorName: 'مريم العلي',
    authorRole: 'ولية أمر طالبة',
    content:
      'لم أكن أعرف كيف أساعد ابنتي على تنمية موهبتها. بداية الرحلة وفرت لها المدربة والمنهج والمساحة الآمنة لتكبر موهبتها.',
  },
];

export const mockCreativeServices: CreativeService[] = [
  {
    id: 'srv-1',
    name: 'مراجعة قصة قصيرة',
    price: 350,
    description: 'مراجعة لغوية وإبداعية لقصة قصيرة كتبها الطفل.',
  },
  {
    id: 'srv-2',
    name: 'جلسة توليد أفكار',
    price: 410,
    description:
      'لقاء فردي لمن يريد تطوير فكرة قصة أو شخصيات أو إيجاد مدخل للبدء.',
  },
  {
    id: 'srv-3',
    name: 'تقرير على عينة كتابية',
    price: 290,
    description:
      'قراءة مركزة لعينة يرسلها العميل، تتضمن أبرز نقاط القوة وفرص التطوير.',
  },
];

export const mockBlogPosts: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'discover-writing-voice',
    title: 'كيف تساعد طفلك على اكتشاف صوته الكتابي؟',
    excerpt: 'خطوات بسيطة وعملية تبدأ من الاستماع لا من التصحيح.',
    content: `كل طفل يحمل طريقة تعبير خاصة به، لكنها تحتاج مساحة لتظهر. ابدأ بالاستماع لما يحب أن يحكيه شفهيًا قبل أن تطلب منه الكتابة؛ فالقصص التي يرويها بصوته العالي غالبًا ما تكون أقرب أسلوبه الحقيقي. اترك له حرية اختيار الموضوع في البداية، فالحماس للموضوع أهم من الالتزام بقالب معين. لا تصحح كل خطأ إملائي أو نحوي فور ظهوره؛ التركيز الأول على الفكرة والصوت، والتحرير يأتي لاحقًا كخطوة منفصلة. واحتفِ بكل محاولة كاملة، مهما كانت قصيرة، لأن الثقة بالكتابة تُبنى قبل إتقانها.`,
    publishedAt: '2023-10-01T10:00:00Z',
    authorName: 'فريق الرحلة',
  },
  {
    id: 'post-2',
    slug: 'why-children-love-being-heroes',
    title: 'لماذا يحب الأطفال أن يروا أنفسهم أبطالًا في القصة؟',
    excerpt: 'التخصيص ليس رفاهية، بل أداة تربوية حقيقية.',
    content: `حين يرى الطفل اسمه وملامحه داخل قصة مطبوعة، تتغير علاقته بالقراءة من مجرد نشاط إلى تجربة شخصية. هذا الشعور بالحضور داخل الحكاية يعزز تقدير الطفل لذاته، ويجعله أكثر انتباهًا لتفاصيل النص لأنه يخصه هو تحديدًا. كما أن القيم التربوية المطروحة داخل القصة تصل بشكل أعمق حين يعيشها الطفل كبطل للأحداث، لا كمتفرج عليها من الخارج. لهذا تصبح القصة المخصصة أداة فعالة ليس فقط للترفيه، بل لتعزيز السلوكيات والقيم التي يسعى الأهل لغرسها بأسلوب غير مباشر وغير مباشر في فرضه.`,
    publishedAt: '2023-10-15T12:00:00Z',
    authorName: 'فريق الرحلة',
  },
  {
    id: 'post-3',
    slug: '5-simple-ideas-for-writing-at-home',
    title: 'خمس أفكار بسيطة لتشجيع طفلك على الكتابة في المنزل',
    excerpt: 'لا تحتاج إلى أدوات معقدة، فقط عادة صغيرة يومية.',
    content: `أولًا، خصص "دفتر أفكار" يكتب فيه الطفل جملة أو فكرة يومية دون أي شرط بالطول أو الصحة اللغوية. ثانيًا، اطلب منه أحيانًا أن يكتب نهاية بديلة لقصة قرأها بدل النهاية الأصلية. ثالثًا، شجعه على كتابة رسائل قصيرة لأفراد العائلة في المناسبات بدل الاكتفاء بالتهنئة الشفهية. رابعًا، اجعلوا وقت القراءة العائلي فرصة لطرح سؤال: "لو كنت مكان البطل، ماذا كنت ستفعل؟" ثم اتركوه يكتب إجابته. خامسًا، لا تربط الكتابة دائمًا بالواجب المدرسي؛ اجعل جزءًا منها خاصًا باللعب والخيال الحر بلا تقييم.`,
    publishedAt: '2023-11-01T10:00:00Z',
    authorName: 'فريق الرحلة',
  },
];

export const mockCurrentUser: UserProfile = {
  id: 'current-user',
  fullName: 'زائر تجريبي',
  email: 'visitor@example.com',
  role: 'visitor',
  createdAt: '2023-01-01T00:00:00Z',
};

// Simulated Database Access Functions
export const getWritingPackages = async (): Promise<WritingPackage[]> => {
  return Promise.resolve(mockWritingPackages);
};

export const getWritingPackageBySlug = async (
  slug: string
): Promise<WritingPackage | null> => {
  const pkg = mockWritingPackages.find((p) => p.slug === slug);
  return Promise.resolve(pkg || null);
};

export const getInstructors = async (): Promise<Instructor[]> => {
  return Promise.resolve(mockInstructors);
};

export const getInstructorById = async (
  id: string
): Promise<Instructor | null> => {
  const inst = mockInstructors.find((i) => i.id === id);
  return Promise.resolve(inst || null);
};

export const getPersonalizedProducts = async (): Promise<
  PersonalizedProduct[]
> => {
  return Promise.resolve(mockProducts);
};

export const getAddonProducts = async (): Promise<AddonProduct[]> => {
  return Promise.resolve(mockAddonProducts);
};

export const getSubscriptionTiers = async (): Promise<SubscriptionTier[]> => {
  return Promise.resolve(mockSubscriptionTiers);
};

export const getTestimonials = async (): Promise<Testimonial[]> => {
  return Promise.resolve(mockTestimonials);
};

export const getCreativeServices = async (): Promise<CreativeService[]> => {
  return Promise.resolve(mockCreativeServices);
};

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  return Promise.resolve(mockBlogPosts);
};

export const getBlogPostBySlug = async (
  slug: string
): Promise<BlogPost | null> => {
  const post = mockBlogPosts.find((p) => p.slug === slug);
  return Promise.resolve(post || null);
};

export const getCurrentUser = async (): Promise<UserProfile> => {
  const cookieStore = await cookies();
  const mockRoleCookie = cookieStore.get('mockRole');
  const role = (mockRoleCookie?.value as UserRole) || 'visitor';

  return Promise.resolve({
    id: 'current-user',
    fullName: role === 'visitor' ? 'زائر تجريبي' : `مستخدم تجريبي (${role})`,
    email: `${role}@example.com`,
    role: role,
    createdAt: '2023-01-01T00:00:00Z',
  });
};

import {
  Booking,
  Order,
  PortfolioItem,
} from '../types';

export const mockBookings: Booking[] = [
  {
    id: 'bkg-1',
    studentId: 'student-1',
    packageId: 'pkg-1',
    instructorId: 'inst-1',
    status: 'confirmed',
    scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(), // +2 days
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'bkg-2',
    studentId: 'student-2',
    packageId: 'pkg-2',
    instructorId: 'inst-2',
    status: 'completed',
    scheduledAt: new Date(Date.now() - 86400000 * 3).toISOString(), // -3 days
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'bkg-3',
    studentId: 'student-3',
    packageId: 'pkg-1',
    instructorId: 'inst-1',
    status: 'pending',
    scheduledAt: new Date(Date.now() + 86400000 * 5).toISOString(), // +5 days
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ord-1',
    userId: 'student-1',
    items: ['prod-1', 'addon-1'],
    totalAmount: 395,
    status: 'paid',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'ord-2',
    userId: 'student-2',
    items: ['prod-2'],
    totalAmount: 120,
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export const mockPortfolioItems: PortfolioItem[] = [
  {
    id: 'port-1',
    studentId: 'student-1',
    title: 'رسالة إلى صديقي الخيالي',
    excerpt: 'كان يجلس دائماً على حافة النافذة، يخبرني عن أسرار الغيوم...',
    packageName: 'الكلمات الذهبية',
    sessionNumber: 3,
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: 'port-2',
    studentId: 'student-1',
    title: 'قصة الشجرة التي رفضت أن تكبر',
    excerpt:
      'في الغابة البعيدة، كانت هناك شجرة صغيرة ترفض أن تمتد جذورها في الأرض...',
    packageName: 'الكلمات الذهبية',
    sessionNumber: 6,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'port-3',
    studentId: 'student-1',
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

export const getOrders = async (): Promise<Order[]> => {
  return Promise.resolve(mockOrders);
};

export const getPortfolioItems = async (): Promise<PortfolioItem[]> => {
  return Promise.resolve(mockPortfolioItems);
};

export const mockFamilyMembers = [
  { id: 'fm-1', name: 'أحمد', age: 8 },
  { id: 'fm-2', name: 'سارة', age: 12 },
];
export const getFamilyMembers = async () => mockFamilyMembers;

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

export const mockPublishers: Publisher[] = [
  {
    id: 'pub-1',
    slug: 'dar-alhekaya',
    name: 'دار الحكاية الصغيرة',
    logoUrl: 'https://picsum.photos/seed/pub1/200/200',
    bio: 'دار متخصصة في نشر القصص التعليمية والتربوية للأطفال لبناء جيل واعٍ ومبدع.',
    isSample: true
  },
  {
    id: 'pub-2',
    slug: 'khayal-akhdar',
    name: 'ناشر الخيال الأخضر',
    logoUrl: 'https://picsum.photos/seed/pub2/200/200',
    bio: 'ناشر رائد في كتب المغامرات والموسوعات العلمية المبسطة لتشجيع الخيال والابتكار.',
    isSample: true
  }
];

export const getPublishers = async (): Promise<Publisher[]> => mockPublishers;

export const getPublisherBySlug = async (slug: string): Promise<Publisher | null> => {
  return mockPublishers.find(p => p.slug === slug) || null;
};

export const getProductBySlug = async (slug: string): Promise<PersonalizedProduct | null> => {
  const product = mockProducts.find(p => p.slug === slug);
  if (product && !product.publisherId) {
    return product;
  }
  return null;
};

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
