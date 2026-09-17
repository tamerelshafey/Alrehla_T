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

import { createClient } from '@/lib/supabase/server';


export const getBoxSubscriptions = async (): Promise<BoxSubscription[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('box_subscriptions')
    .select('*')
    .order('created_at', { ascending: false });

  if ((error || !data || data.length === 0)) {
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

