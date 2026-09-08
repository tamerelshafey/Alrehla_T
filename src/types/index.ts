// الأدوار المتاحة للمستخدمين في المنصة
export type UserRole =
  'visitor' | 'customer' | 'student' | 'instructor' | 'publisher' | 'general_supervisor' | 'super_admin';

// الملف الشخصي للمستخدم
export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isGuardian?: boolean;
  avatarUrl?: string;
  createdAt: string;
  permissions?: AdminPermission[];
};

// الفئة العمرية للباقات
export type AgeGroup = 'under_12' | '12_plus';

// باقة الكتابة الإبداعية
export type WritingPackage = {
  id: string;
  slug: string;
  name: string;
  ageGroup: AgeGroup;
  price: number;
  durationText: string;
  sessionsCount: number;
  sessionDuration?: string;
  targetAudience: string;
  prerequisiteNote?: string;
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
  isSample?: boolean;
  status: 'pending' | 'active' | 'suspended';
};

// خدمة إبداعية مستقلة
export type CreativeService = {
  id: string;
  name: string;
  price: number;
  description: string;
};

// حالة الحجز
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// عملية الحجز لباقة معينة
export type Booking = {
  id: string;
  dependentParticipantId?: string;
  independentParticipantId?: string;
  packageId: string;
  instructorId?: string;
  courseSubscriptionId?: string;
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
  electronicPrice?: number;
  shortDescription: string;
  coverImageUrl?: string;
  publisherId?: string;
  ownerType: 'platform' | 'publisher';
};

// حالة الطلب
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// طلب شراء من المتجر
export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  customizationData?: {
    childName?: string;
    childPhotoUrl?: string;
    coverChoice?: string;
    notes?: string;
  };
}

// طلب شراء من المتجر
export type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  dependentParticipantId?: string;
  independentParticipantId?: string;
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

// عمل في الملف الكتابي للطالب
export type PortfolioItem = {
  id: string;
  dependentParticipantId?: string;
  independentParticipantId?: string;
  title: string;
  excerpt: string;
  packageName: string;
  sessionNumber: number;
  createdAt: string;
};

// شهادة مستخدم
export type Testimonial = {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
};

// إضافة إضافية لمنتج
export type AddonProduct = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

// خطة اشتراك
export type SubscriptionTier = {
  id: string;
  name: string;
  priceTotal: number;
  priceMonthly: number;
  durationMonths: number;
  savingsNote?: string;
};

// أفراد العائلة المرتبطين بحساب
export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  avatarUrl?: string;
}

// الإشعارات
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// تذاكر الدعم
export interface SupportTicket {
  id: string;
  senderName?: string;
  requesterName?: string;
  subject: string;
  category: string;
  status: 'open' | 'answered' | 'closed';
  createdAt: string;
}

export interface SupportTicketMessage {
  id: string;
  ticketId: string;
  senderName: string;
  message: string;
  createdAt: string;
}

// الناشر
export type Publisher = {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  bio: string;
  isSample: boolean;
  status: 'pending' | 'active' | 'suspended';
};


// حالة الدفع
export type PayoutStatus = 'pending' | 'paid';

// مستحقات المدرب
export interface InstructorPayout {
  id: string;
  instructorId: string;
  period: string;
  amount: number;
  status: PayoutStatus;
}

// مستحقات الناشر
export interface PublisherPayout {
  id: string;
  publisherId: string;
  period: string;
  amount: number;
  status: PayoutStatus;
}

export interface SessionMessage {
  id: string;
  senderName: string;
  message: string;
  createdAt: string;
}

export interface SessionAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  packageName: string;
}

export interface InstructorStudent {
  id: string;
  name: string;
  avatarUrl?: string;
  packageName: string;
  sessionsCompleted: number;
  totalSessions: number;
}

export interface AvailabilitySlot {
  id: string;
  dayLabel: string;
  timeLabel: string;
  isBooked: boolean;
}

export type AdminPermission = 
  | 'canManageUsers'
  | 'canManageInstructors'
  | 'canManagePublishers'
  | 'canManageCatalog'
  | 'canManageSubscriptions'
  | 'canManageOrders'
  | 'canManageBookings'
  | 'canManageSupport'
  | 'canManageContent'
  | 'canManageFinance'
  | 'canViewAuditLogs';


export type BoxSubscription = {
  id: string;
  customerName: string;
  planName: string;
  status: 'active' | 'cancelled' | 'paused';
  nextShipmentDate: string;
};

export type JoinRequest = {
  id: string;
  applicantName: string;
  requestedRole: 'instructor' | 'publisher';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

export type SupportSessionRequest = {
  id: string;
  contactName: string;
  contactPhone: string;
  message: string;
  status: 'pending' | 'contacted' | 'closed';
  createdAt: string;
};

export type AuditLog = {
  id: string;
  actorName: string;
  action: string;
  entityType: string;
  createdAt: string;
};

// طلب خدمات بداية الرحلة
export type ServiceOrderStatus = 'pending' | 'paid' | 'refunded';

export interface ServiceOrder {
  id: string;
  buyerProfileId: string;
  packageId?: string;
  serviceId?: string;
  status: ServiceOrderStatus;
  amount: number;
  createdAt: string;
}

// اشتراك في دورة
export type CourseSubscriptionStatus = 'active' | 'completed' | 'cancelled';

export interface CourseSubscription {
  id: string;
  packageId: string;
  guardianProfileId?: string;
  dependentParticipantId?: string;
  independentParticipantId?: string;
  status: CourseSubscriptionStatus;
  startedAt: string;
  createdAt: string;
}
