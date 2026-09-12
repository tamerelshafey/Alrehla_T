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

// Import from auth if needed
import { mockAllUsers, mockCurrentUser } from './auth';

import { createClient } from '@/lib/supabase/server';

export const mockBoxSubscriptions: BoxSubscription[] = [
  { id: 'sub-1', customerName: 'أحمد محمود', planName: 'اشتراك 3 أشهر', status: 'active', nextShipmentDate: '2023-11-01T00:00:00Z' },
  { id: 'sub-2', customerName: 'سارة خالد', planName: 'اشتراك 6 أشهر', status: 'paused', nextShipmentDate: '2023-11-15T00:00:00Z' },
  { id: 'sub-3', customerName: 'علياء حسين', planName: 'اشتراك سنوي', status: 'active', nextShipmentDate: '2023-11-05T00:00:00Z' },
];

export const getBoxSubscriptions = async (): Promise<BoxSubscription[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('box_subscriptions')
    .select('*')
    .order('created_at', { ascending: false });

  if ((error || !data || data.length === 0)) {
    if (process.env.NODE_ENV === 'development') {
      return mockBoxSubscriptions;
    }
    return [];
  }

  return data.map((sub: any) => ({
    id: sub.id,
    customerName: sub.customer_name,
    planName: sub.plan_name,
    status: sub.status,
    nextShipmentDate: sub.next_shipment_date || new Date().toISOString()
  }));
};

