// الأدوار المتاحة للمستخدمين في المنصة
export type UserRole = 'visitor' | 'student' | 'instructor' | 'general_supervisor' | 'super_admin';

// الملف الشخصي للمستخدم
export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
};

// الفئة العمرية للباقات
export type AgeGroup = 'under_12' | '12_plus';

// باقة الكتابة الإبداعية
export type WritingPackage = {
  id: string;
  slug: string;
  name: string;
  ageGroup: AgeGroup;
  sessionsCount: number;
  durationWeeks: number;
  prerequisitePackageId?: string;
  shortDescription: string;
  fullDescription: string;
  isActive: boolean;
};

// ملف المدرب
export type Instructor = {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  specialties: string[];
  avatarUrl?: string;
  yearsExperience: number;
};

// حالة الحجز
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// عملية الحجز لباقة معينة
export type Booking = {
  id: string;
  studentId: string;
  packageId: string;
  instructorId?: string;
  status: BookingStatus;
  scheduledAt: string;
  createdAt: string;
};

// فئة المنتج المخصص
export type ProductCategory = 'library' | 'custom' | 'subscription';

// منتج مخصص (قصة، هدية، الخ)
export type PersonalizedProduct = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  shortDescription: string;
  coverImageUrl?: string;
};

// حالة الطلب
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// طلب شراء من المتجر
export type Order = {
  id: string;
  userId: string;
  items: string[]; // مصفوفة معرفات المنتجات للتبسيط حالياً
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
};

// مقال في المدونة
export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  publishedAt: string;
  authorName: string;
};
