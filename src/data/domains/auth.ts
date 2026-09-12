import {
  UserProfile, UserRole, AdminPermission
} from '@/types';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { User } from '@supabase/supabase-js';

export const mockCurrentUser: UserProfile = {
  id: 'current-user',
  fullName: 'زائر تجريبي',
  email: 'visitor@example.com',
  role: 'visitor',
  createdAt: '2023-01-01T00:00:00Z',
};

// Safe profile synchronization helper
export async function syncUserProfile(user: User) {
  const supabase = await createClient();
  
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (existingProfile) {
    return existingProfile;
  }

  // Profile does not exist: create the missing user_profiles row safely
  const fullName = user.user_metadata?.full_name || 'مستخدم';
  
  const { data: newProfile, error: insertError } = await supabase
    .from('user_profiles')
    .insert({
      id: user.id,
      full_name: fullName,
      role: 'customer',
      is_guardian: false
    })
    .select('*')
    .single();

  if (insertError || !newProfile) {
    console.error('Profile synchronization failed:', insertError);
    throw new Error('Authentication error: Failed to synchronize user profile.');
  }

  return newProfile;
}

// Database Access Functions
export const getCurrentUser = async (): Promise<UserProfile> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If no user is logged in, use the mock role cookie for local development UI testing ONLY
  if (!user) {
    if (process.env.NODE_ENV === 'development') {
      const cookieStore = await cookies();
      const mockRoleCookie = cookieStore.get('mockRole');
      const role = (mockRoleCookie?.value as UserRole) || 'visitor';
      
      let permissions: AdminPermission[] = [];
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
      return {
        id: 'current-user',
        fullName: role === 'visitor' ? 'زائر تجريبي' : `مستخدم تجريبي (${role})`,
        email: `${role}@example.com`,
        role: role,
        createdAt: '2023-01-01T00:00:00Z',
        ...(permissions.length > 0 ? { permissions } : {})
      };
    } else {
      // In production, unauthenticated users are just visitors
      return {
        id: 'visitor-user',
        fullName: 'زائر',
        email: '',
        role: 'visitor',
        createdAt: new Date().toISOString(),
      };
    }
  }

  // Fetch or synchronize actual profile from Supabase
  const profile = await syncUserProfile(user);

  let role: UserRole = (profile.role as UserRole) || 'customer';
  let permissions: AdminPermission[] = [];
  
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

  return {
    id: user.id,
    fullName: profile.full_name || user.user_metadata?.full_name || 'مستخدم',
    email: user.email || '',
    role: role,
    isGuardian: profile.is_guardian || false,
    avatarUrl: profile.avatar_url || undefined,
    createdAt: profile.created_at || user.created_at,
    ...(permissions.length > 0 ? { permissions } : {})
  };
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
  const supabase = await createClient();
  const { data: profiles, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !profiles || profiles.length === 0) {
    console.error("Error fetching users or none found, falling back to mock", error);
    if (process.env.NODE_ENV === 'development') {
        return mockAllUsers;
    }
    return [];
  }

  return profiles.map(profile => ({
    id: profile.id,
    fullName: profile.full_name,
    email: '', // Requires Admin API to fetch emails for all users
    role: profile.role as UserRole,
    isGuardian: profile.is_guardian || false,
    avatarUrl: profile.avatar_url || undefined,
    createdAt: profile.created_at || new Date().toISOString(),
  }));
};
