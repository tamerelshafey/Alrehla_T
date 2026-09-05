import { cookies } from 'next/headers';
import {
  WritingPackage,
  Instructor,
  PersonalizedProduct,
  BlogPost,
  UserProfile,
  UserRole
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
  {
    id: 'prod-1',
    slug: 'custom-story-book',
    name: 'كتاب قصتك الخاصة',
    category: 'custom',
    price: 150,
    shortDescription: 'كتاب مطبوع يحتوي على قصة يكون طفلك بطلها.',
  },
  {
    id: 'prod-2',
    slug: 'monthly-box',
    name: 'صندوق القراءة الشهري',
    category: 'subscription',
    price: 200,
    shortDescription: 'اشتراك شهري يصلك فيه مجموعة مختارة من القصص والهدايا.',
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
