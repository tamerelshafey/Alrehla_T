import { cookies } from 'next/headers';
import {
  WritingPackage,
  Instructor,
  PersonalizedProduct,
  BlogPost,
  UserProfile,
  UserRole,
  Testimonial,
  AddonProduct,
  SubscriptionTier
} from '../types';

export const mockWritingPackages: WritingPackage[] = [
  {
    id: 'pkg-1',
    slug: 'creative-writing-basics',
    name: 'أساسيات الكتابة الإبداعية',
    ageGroup: 'under_12',
    sessionsCount: 4,
    durationWeeks: 4,
    shortDescription: 'دورة مبسطة للأطفال لتعلم أساسيات سرد القصص.',
    fullDescription: 'دورة متكاملة تركز على بناء الشخصيات وخلق عوالم خيالية ممتعة...',
    isActive: true,
  },
  {
    id: 'pkg-2',
    slug: 'advanced-storytelling',
    name: 'السرد المتقدم',
    ageGroup: '12_plus',
    sessionsCount: 8,
    durationWeeks: 8,
    prerequisitePackageId: 'pkg-1',
    shortDescription: 'دورة متقدمة للشباب لتطوير مهارات السرد والحبكة.',
    fullDescription: 'تتناول هذه الدورة تقنيات متقدمة في الكتابة، الحبكة الدرامية، وتطوير الحوار...',
    isActive: true,
  },
];

export const mockInstructors: Instructor[] = [
  {
    id: 'inst-1',
    userId: 'user-101',
    displayName: 'أحمد محمود',
    bio: 'كاتب روائي مهتم بأدب الطفل.',
    specialties: ['أدب الطفل', 'القصص القصيرة'],
    yearsExperience: 5,
  },
  {
    id: 'inst-2',
    userId: 'user-102',
    displayName: 'سارة خالد',
    bio: 'محررة ومدربة كتابة إبداعية.',
    specialties: ['كتابة السيناريو', 'الرواية'],
    yearsExperience: 8,
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
    slug: 'prophets-stories',
    name: 'قصص الأنبياء للأطفال',
    category: 'library',
    price: 350,
    electronicPrice: 150,
    shortDescription: 'مجموعة مختارة من قصص الأنبياء بأسلوب مبسط ومناسب للأطفال، مع رسومات توضيحية جميلة (بدون تجسيد).',
    coverImageUrl: 'https://picsum.photos/seed/lib1/600/800',
  },
  {
    id: 'prod-lib-2',
    slug: 'little-explorer',
    name: 'موسوعة المستكشف الصغير',
    category: 'library',
    price: 400,
    shortDescription: 'رحلة في عالم العلوم، الفضاء، جسم الإنسان، والطبيعة. مليئة بالحقائق المدهشة والصور.',
    coverImageUrl: 'https://picsum.photos/seed/lib2/600/800',
  },
  {
    id: 'prod-lib-3',
    slug: 'morals-garden',
    name: 'حديقة الأخلاق',
    category: 'library',
    price: 300,
    electronicPrice: 120,
    shortDescription: 'قصص قصيرة تعلم الأطفال الآداب الإسلامية والأخلاق الحميدة في التعامل مع الأسرة والجيران والأصدقاء.',
    coverImageUrl: 'https://picsum.photos/seed/lib3/600/800',
  },
  {
    id: 'prod-lib-4',
    slug: 'bedtime-stories',
    name: 'حكايات قبل النوم',
    category: 'library',
    price: 320,
    electronicPrice: 130,
    shortDescription: 'مجموعة هادئة ولطيفة من القصص الخيالية القصيرة لتساعد طفلك على الاسترخاء والنوم بأحلام سعيدة.',
    coverImageUrl: 'https://picsum.photos/seed/lib4/600/800',
  }
];

export const mockAddonProducts: AddonProduct[] = [
  {
    id: 'addon-1',
    name: 'دفتر تلوين الأبطال',
    price: 80,
    description: 'دفتر تلوين يحتوي على شخصيات القصة ومشاهد منها، ليقوم الطفل بتلوين مغامرته بنفسه.',
  },
  {
    id: 'addon-2',
    name: 'ملصقات اسمي',
    price: 50,
    description: 'مجموعة ملصقات عالية الجودة تحمل اسم طفلك وشخصيات كرتونية لطيفة.',
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
    content: 'لم أكن أتخيل أن رؤية ابني لاسمه كبطل للقصة ستغير من حبه للقراءة بهذا الشكل. تجربة رائعة ومختلفة!',
  },
  {
    id: 'test-2',
    authorName: 'د. خالد مصطفى',
    authorRole: 'أخصائي تربوي',
    content: 'ما تقدمه "الرحلة" في دمج القيم التربوية عبر التخصيص الشخصي يعد نقلة نوعية في أدب الطفل العربي.',
  },
  {
    id: 'test-3',
    authorName: 'سارة',
    authorRole: 'طالبة في دورة الكتابة',
    content: 'تعلمت كيف أترجم مشاعري إلى كلمات، والأجمل هو الدعم المستمر والمساحة الآمنة للتعبير في دورات بداية الرحلة.',
  },
];

export const mockBlogPosts: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'how-to-encourage-reading',
    title: 'كيف تشجع طفلك على القراءة؟',
    excerpt: 'خطوات بسيطة وفعالة لبناء عادة القراءة لدى الأطفال.',
    content: 'محتوى المقال هنا...',
    publishedAt: '2023-10-01T10:00:00Z',
    authorName: 'فريق الرحلة',
  },
  {
    id: 'post-2',
    slug: 'benefits-of-creative-writing',
    title: 'فوائد الكتابة الإبداعية للشباب',
    excerpt: 'الكتابة الإبداعية ليست مجرد هواية، بل هي أداة لبناء الشخصية.',
    content: 'محتوى المقال هنا...',
    publishedAt: '2023-10-15T12:00:00Z',
    authorName: 'سارة خالد',
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

export const getWritingPackageBySlug = async (slug: string): Promise<WritingPackage | null> => {
  const pkg = mockWritingPackages.find(p => p.slug === slug);
  return Promise.resolve(pkg || null);
};

export const getInstructors = async (): Promise<Instructor[]> => {
  return Promise.resolve(mockInstructors);
};

export const getInstructorById = async (id: string): Promise<Instructor | null> => {
  const inst = mockInstructors.find(i => i.id === id);
  return Promise.resolve(inst || null);
};

export const getPersonalizedProducts = async (): Promise<PersonalizedProduct[]> => {
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

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  return Promise.resolve(mockBlogPosts);
};

export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  const post = mockBlogPosts.find(p => p.slug === slug);
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
