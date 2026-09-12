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

export const mockOrders: Order[] = [
  {
    id: 'ord-1',
    userId: 'student-1',
    items: [{ productId: 'prod-1', quantity: 1, unitPrice: 350, customizationData: { childName: 'علي' } }, { productId: 'addon-1', quantity: 1, unitPrice: 45 }],
    
    totalAmount: 395,
    status: 'paid',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'ord-2',
    userId: 'student-2',
    items: [{ productId: 'prod-2', quantity: 1, unitPrice: 50 }],
    
    totalAmount: 120,
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

import { createClient } from '@/lib/supabase/server';

export const getOrders = async (): Promise<Order[]> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) { if (process.env.NODE_ENV === 'development') return mockOrders; return []; }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if ((error || !data || data.length === 0)) {
    if (process.env.NODE_ENV === 'development') {
      return mockOrders;
    }
    return [];
  }

  return data.map((order: any) => ({
    id: order.id,
    userId: order.user_id,
    
    
    totalAmount: order.total_amount,
    status: order.status,
    transactionReference: order.transaction_reference || undefined,
    createdAt: order.created_at,
    items: (order.order_items || []).map((item: any) => ({
      productId: item.product_id,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      customizationData: item.customization_data || undefined
    }))
  }));
};

