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


export const mockCurrentUser: UserProfile = {
  id: 'current-user',
  fullName: 'زائر تجريبي',
  email: 'visitor@example.com',
  role: 'visitor',
  createdAt: '2023-01-01T00:00:00Z',
};

// Simulated Database Access Functions
export const getCurrentUser = async (): Promise<UserProfile> => {
  const cookieStore = await cookies();
  const mockRoleCookie = cookieStore.get('mockRole');
  const role = (mockRoleCookie?.value as UserRole) || 'visitor';

  let permissions: import('@/types').AdminPermission[] = [];
  if (role === 'super_admin') {
    permissions = [
      'canManageUsers', 'canManageInstructors', 'canManagePublishers', 
      'canManageCatalog', 'canManageSubscriptions', 'canManageOrders', 
      'canManageBookings', 'canManageSupport', 'canManageContent', 
      'canManageFinance', 'canViewAuditLogs'
    ];
  } else if (role === 'general_supervisor') {
    permissions = [
      'canManageUsers', 'canManageInstructors', 'canManagePublishers', 
      'canManageCatalog', 'canManageSubscriptions', 'canManageOrders', 
      'canManageBookings', 'canManageSupport', 'canManageContent'
    ];
  }

  return Promise.resolve({
    id: 'current-user',
    fullName: role === 'visitor' ? 'زائر تجريبي' : `مستخدم تجريبي (${role})`,
    email: `${role}@example.com`,
    role: role,
    createdAt: '2023-01-01T00:00:00Z',
    ...(permissions.length > 0 ? { permissions } : {})
  });
};

export const mockAllUsers: UserProfile[] = [
  { id: 'usr-1', fullName: 'أحمد محمود', email: 'ahmed@example.com', role: 'student', createdAt: '2023-01-10T00:00:00Z', isGuardian: false },
  { id: 'usr-2', fullName: 'سارة خالد', email: 'sara@example.com', role: 'instructor', createdAt: '2023-02-15T00:00:00Z' },
  { id: 'usr-3', fullName: 'علياء حسين', email: 'alia@example.com', role: 'publisher', createdAt: '2023-03-20T00:00:00Z' },
  { id: 'usr-4', fullName: 'محمد طارق', email: 'mohamed@example.com', role: 'super_admin', createdAt: '2023-01-01T00:00:00Z' },
  { id: 'usr-5', fullName: 'نور مصطفى', email: 'nour@example.com', role: 'general_supervisor', createdAt: '2023-04-10T00:00:00Z' },
  { id: 'usr-6', fullName: 'ياسر عادل', email: 'yasser@example.com', role: 'visitor', createdAt: '2023-05-12T00:00:00Z' },
  { id: 'usr-7', fullName: 'مريم أمين', email: 'mariam@example.com', role: 'student', createdAt: '2023-06-18T00:00:00Z', isGuardian: true },
  { id: 'usr-8', fullName: 'خالد وليد', email: 'khaled@example.com', role: 'instructor', createdAt: '2023-07-22T00:00:00Z' },
];

export const getAllUsers = async (): Promise<UserProfile[]> => {
  return Promise.resolve(mockAllUsers);
};


