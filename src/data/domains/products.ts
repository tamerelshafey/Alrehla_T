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




import { createClient } from '@/lib/supabase/server';
import { getPublisherPricingSettings } from '@/data/domains/admin';
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

  // Sample data is for local development only — it must never stand in for
  // a real record on the live site.
  if (error || !data) {
    if (process.env.NODE_ENV !== 'development') return null;
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


/**
 * طلبات الناشر الحقيقية ونصيبه منها.
 *
 * دي كانت **مخترعة بالكامل**: بتبني الطلبات من بيانات تجريبية، ومعاها
 * `setTimeout(600)` بيقلّد بطء الشبكة عشان تبان حقيقية، وبتحسب نصيب
 * الناشر 70% ثابتة مكتوبة في الكود. يعني أي ناشر بيفتح لوحته كان بيشوف
 * طلبات وأرباح مش موجودة.
 *
 * النسخة دي بتقرا من قاعدة البيانات، وبتحسب النصيب بعكس معادلة التسعير
 * المحفوظة في «إعدادات تسعير الناشرين»:
 *
 *     سعر العميل  =  نصيب الناشر × المُعامِل + الرسم الثابت
 *     نصيب الناشر =  (سعر العميل − الرسم الثابت) ÷ المُعامِل
 *
 * الرسم الثابت بيتخصم على الوحدة الواحدة، زي ما بيتخصم على الجلسة
 * الواحدة في جانب المدربين.
 */
export async function getPublisherOrders(): Promise<PublisherOrder[]> {
  const publisher = await getMyPublisher();
  if (!publisher) return [];

  const supabase = await createClient();

  // منتجات الناشر ده.
  const { data: products } = await supabase
    .from('personalized_products')
    .select('id, name')
    .eq('publisher_id', publisher.id);

  if (!products || products.length === 0) return [];
  const productById = new Map(products.map((p) => [p.id, p.name]));

  // بنودها في الطلبات.
  const { data: items } = await supabase
    .from('order_items')
    .select('id, order_id, product_id, quantity, unit_price')
    .in('product_id', Array.from(productById.keys()));

  if (!items || items.length === 0) return [];

  // الطلبات نفسها — للحالة والتاريخ.
  const orderIds = Array.from(new Set(items.map((i) => i.order_id)));
  const { data: orders } = await supabase
    .from('orders')
    .select('id, status, created_at')
    .in('id', orderIds);

  const orderById = new Map((orders ?? []).map((o) => [o.id, o]));

  const formula = await getPublisherPricingSettings();
  const multiplier = formula.platformMultiplier > 0 ? formula.platformMultiplier : 1;

  const rows: PublisherOrder[] = [];
  for (const item of items) {
    const order = orderById.get(item.order_id);
    if (!order) continue;

    const totalAmount = item.unit_price * item.quantity;
    // النصيب لا ينزل تحت الصفر لو الرسم الثابت أكبر من سعر الوحدة.
    const sharePerUnit = Math.max(
      0,
      (item.unit_price - formula.fixedAdminFee) / multiplier,
    );

    rows.push({
      id: item.id,
      orderId: item.order_id,
      productName: productById.get(item.product_id) ?? 'منتج محذوف',
      quantity: item.quantity,
      totalAmount,
      publisherShare: sharePerUnit * item.quantity,
      status: order.status,
      createdAt: order.created_at,
    });
  }

  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** The publisher record belonging to the signed-in user, if any. */
export async function getMyPublisher(): Promise<Publisher | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('publishers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    logoUrl: data.logo_url || undefined,
    bio: data.bio,
    isSample: data.is_sample ?? false,
    status: data.status,
  };
}
