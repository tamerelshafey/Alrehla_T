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

export type DayOfWeek = 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export type WeeklySlot = {
  day: DayOfWeek;
  time: string; // HH:mm format, e.g., "10:00"
  isBooked?: boolean;
  commitmentType?: 'ongoing' | 'fixed_term';
  commitmentMonths?: number;
  commitmentEndsAt?: string;
};

export type WorkModel = 'per_session' | 'monthly';

export type InstructorStatus = 'pending_training' | 'pending_approval' | 'active' | 'suspended';

export type Instructor = {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  specialties: string[];
  avatarUrl?: string;
  yearsExperience: number;
  isSample?: boolean;
  status: InstructorStatus;
  
  // New Fields for Scheduling & Pricing
  trainingPassed: boolean;
  workModel: WorkModel;
  requestedPrice?: number;
  selectedPricingOptionId?: string;
  approvedPrice?: number; // Price approved by admin
  
  weeklySchedule: WeeklySlot[]; // The standard weekly schedule they offer
  pendingSchedule?: WeeklySlot[]; // If they requested a schedule change
  
  monthlyHoursCommitted?: number; // Only if workModel === 'monthly'. Minimum 60.
};

export interface ProfileUpdateRequest {
  id: string;
  instructorId: string;
  requestedChanges: Partial<Instructor>;
  status: 'pending' | 'approved' | 'rejected';
  adminFeedback?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  studentId: string;
  studentName: string;
  instructorId: string;
  rating: number; // 1 to 5
  comment: string;
  scheduledSessionId?: string;
  createdAt: string;
}


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
  features?: string[];
};

// حالة الطلب
export type OrderStatus = 'pending' | 'awaiting_verification' | 'paid' | 'failed' | 'refunded';

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
  transactionReference?: string;
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
  actorName?: string;
  actorProfileId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

// طلب خدمات بداية الرحلة
export type ServiceOrderStatus = 'pending' | 'awaiting_verification' | 'paid' | 'refunded';

export interface ServiceOrder {
  id: string;
  buyerProfileId: string;
  packageId?: string;
  serviceId?: string;
  status: ServiceOrderStatus;
  amount: number;
  createdAt: string;
  transactionReference?: string;
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


export type DocumentStatus = 'draft' | 'submitted' | 'reviewed';

export interface PortfolioDocument {
  id: string;
  studentId: string;
  title: string;
  content: string;
  status: DocumentStatus;
  instructorFeedback?: string;
  updatedAt: string;
}




export type PaymentMethod = 'credit_card' | 'fawry' | 'wallet';


export type SlotChangeRequestedBy = 'guardian' | 'instructor' | 'admin';
export type SlotChangeRequestStatus = 'pending' | 'approved' | 'rejected';

export interface SlotChangeRequest {
  id: string;
  recurringSlotId: string;
  requestedBy: SlotChangeRequestedBy;
  requestedDayOfWeek: DayOfWeek;
  requestedStartTime: string;
  reason?: string;
  status: SlotChangeRequestStatus;
  createdAt: string;
}

export interface InstructorPricingOption {
  id: string;
  label: string;
  basePricePerSession: number;
  isActive: boolean;
}

export interface PricingFormulaSettings {
  id: string; // سجل واحد فقط (singleton) — استخدم id ثابت مثل 'default'
  platformMultiplier: number; // مثال: 1.2
  fixedAdminFee: number; // مثال: 50
  updatedAt: string;
}

export type BillingModel = 'monthly' | 'per_session';
export type CompensationApprovalStatus = 'proposed' | 'under_discussion' | 'approved' | 'rejected';

export interface InstructorCompensationProfile {
  id: string;
  instructorId: string;
  billingModel: BillingModel;
  selectedPricingOptionId: string;
  monthlyMinimumHours: number; // افتراضي 60، يُستخدم فقط عند billingModel = 'monthly'
  overtimeRatePerHour?: number;
  approvalStatus: CompensationApprovalStatus;
  adminNotes?: string;
  reviewedByProfileId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InstructorCertification {
  id: string;
  instructorId: string;
  trainingCompletedAt?: string;
  trainingMeetingLink?: string; // رابط Google Meet/Jitsi الذي تم فيه التدريب
  examPassed: boolean;
  examScore?: number;
  certifiedAt?: string;
}


export interface PublisherOrder {
  id: string;
  orderId: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  publisherShare: number;
  status: string;
  createdAt: string;
}

export type RecurringSlotStatus = 'active' | 'change_requested' | 'ended';

export interface RecurringSessionSlot {
  id: string;
  courseSubscriptionId: string;
  instructorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  status: RecurringSlotStatus;
  effectiveFrom: string;
  createdAt: string;
}
