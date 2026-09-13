import { formatPrice } from '@/lib/utils';
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
import { mockAllUsers, mockCurrentUser } from '../fixtures/auth';
import { mockOrders } from '../fixtures/orders';




import { createClient } from '@/lib/supabase/server';
import { mockAddonProducts, mockProducts, mockPublishers, mockSubscriptionTiers } from '@/data/fixtures/products';

export const getPersonalizedProducts = async (): Promise<PersonalizedProduct[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('personalized_products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    if (error) {
      console.error('Error fetching personalized products:', error);
    }
    if (process.env.NODE_ENV === 'development') {
      return mockProducts; // Fallback to mock data in development
    }
    return [];
  }

  return data.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    price: p.price,
    electronicPrice: p.electronic_price || undefined,
    shortDescription: p.short_description,
    coverImageUrl: p.cover_image_url || undefined,
    publisherId: p.publisher_id || undefined,
    ownerType: p.owner_type,
    features: p.features || undefined
  }));
};

/**
 * Add-on products have no table in the database yet — the shape and business
 * rules still need deciding. Until then a customer must never be offered one:
 * they would be selecting, and paying for, something that does not exist.
 * Sample data is kept for local development only.
 */
export const getAddonProducts = async (): Promise<AddonProduct[]> => {
  if (process.env.NODE_ENV === 'development') {
    return mockAddonProducts;
  }
  return [];
};

export const getSubscriptionTiers = async (): Promise<SubscriptionTier[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('box_subscription_plans')
    .select('id, name, price_total, price_monthly, duration_months, savings_note')
    .order('duration_months', { ascending: true });

  if (error || !data || data.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      return mockSubscriptionTiers;
    }
    return [];
  }

  return data.map((plan: any) => ({
    id: plan.id,
    name: plan.name,
    priceTotal: plan.price_total,
    priceMonthly: plan.price_monthly,
    durationMonths: plan.duration_months,
    savingsNote: plan.savings_note
  }));
};


export const getPublishers = async (): Promise<Publisher[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('publishers')
    .select('*')
    .order('created_at', { ascending: false });

  if ((error || !data || data.length === 0)) {
    if (process.env.NODE_ENV === 'development') {
      return mockPublishers;
    }
    return [];
  }

  return data.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    logoUrl: p.logo_url || undefined,
    bio: p.bio,
    isSample: p.is_sample,
    status: p.status
  }));
};

export const getPublisherBySlug = async (slug: string): Promise<Publisher | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('publishers')
    .select('*')
    .eq('slug', slug)
    .single();

  if ((error || !data)) {
    if (process.env.NODE_ENV === 'development') {
      return mockPublishers.find(p => p.slug === slug) || null;
    }
    return null;
  }

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    logoUrl: data.logo_url || undefined,
    bio: data.bio,
    isSample: data.is_sample ?? false,
    status: data.status
  };
};

export const getProductBySlug = async (slug: string): Promise<PersonalizedProduct | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('personalized_products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    // Fallback to mock data if not found in db
    const product = mockProducts.find(p => p.slug === slug);
    if (product && product.ownerType === 'platform') {
      return product;
    }
    return null;
  }

  // Ensure ownerType matches if the original logic required 'platform'
  // But maybe it's better to just return the found product.
  // We'll keep the original logic for fallback, but for DB we can return any found product.
  if (data.owner_type === 'platform') {
    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      category: data.category,
      price: data.price,
      electronicPrice: data.electronic_price || undefined,
      shortDescription: data.short_description ?? '',
      coverImageUrl: data.cover_image_url || undefined,
      publisherId: data.publisher_id || undefined,
      ownerType: data.owner_type,
      features: data.features || undefined
    };
  }
  
  return null;
};


export async function getPublisherOrders() {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const publisherOrders: PublisherOrder[] = [];
  mockOrders.forEach(order => {
    order.items.forEach(item => {
      const product = mockProducts.find(p => p.id === item.productId);
      if (product && product.ownerType === "publisher" && product.publisherId) {
        const totalAmount = item.unitPrice * item.quantity;
        const publisherShare = totalAmount * 0.7;
        publisherOrders.push({
          id: `po-${order.id}-${item.productId}`,
          orderId: order.id,
          productName: product.name,
          quantity: item.quantity,
          totalAmount: totalAmount,
          publisherShare: publisherShare,
          status: order.status === "paid" ? "completed" : order.status === "failed" ? "cancelled" : "pending",
          createdAt: order.createdAt
        });
      }
    });
  });
  return publisherOrders;
}




