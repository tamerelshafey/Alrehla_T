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
import { mockAllUsers, mockCurrentUser } from './auth';
import { mockOrders } from "./orders";

export const mockProducts: PersonalizedProduct[] = [
  // Custom Products
  {
    ownerType: 'platform',
    id: 'prod-custom-1',
    slug: 'custom-story-book',
    name: 'القصة المخصصة',
    category: 'custom',
    price: 19500,
    electronicPrice: 11970,
    shortDescription: 'قصة فريدة بطلها طفلك، باسمه وصورته وهواياته.',
    coverImageUrl: 'https://picsum.photos/seed/custom1/600/800',
    features: ['تخصيص كامل', 'قصه هو بطلها', 'اختيار الهدف التربوي', 'رسومات احترافية'],
  },
  {
    ownerType: 'platform',
    id: 'prod-custom-2',
    slug: 'emotional-story',
    name: 'القصة الشعورية',
    category: 'custom',
    price: 21000,
    electronicPrice: 13500,
    shortDescription: 'قصة مخصصة لمساعدة طفلك على فهم مشاعره والتعبير عنها.',
    coverImageUrl: 'https://picsum.photos/seed/custom2/600/800',
    features: ['تنمية الذكاء العاطفي', 'سيناريو تفاعلي', 'مخصص حسب حالة الطفل'],
  },
  {
    ownerType: 'platform',
    id: 'prod-custom-3',
    slug: 'deep-sea-adventures',
    name: 'اعماق البحار',
    category: 'custom',
    price: 6000,
    electronicPrice: 600,
    shortDescription: 'مغامرات شيقة بطلها طفلك في أعماق البحار المحيطات.',
    coverImageUrl: 'https://picsum.photos/seed/custom3/600/800',
    features: ['مغامرة خيالية', 'حقائق علمية مبسطة', 'تخصيص المظهر'],
  },
  // Library Products
  {
    ownerType: 'publisher',
    id: 'prod-lib-1',
    publisherId: 'pub-1',
    slug: 'prophets-stories',
    name: 'قصص الأنبياء للأطفال',
    category: 'library',
    price: 350,
    electronicPrice: 150,
    shortDescription:
      'مجموعة مختارة من قصص الأنبياء بأسلوب مبسط ومناسب للأطفال، مع رسومات توضيحية جميلة (بدون تجسيد).',
    coverImageUrl: 'https://picsum.photos/seed/lib1/600/800',
  },
  {
    ownerType: 'publisher',
    id: 'prod-lib-2',
    publisherId: 'pub-2',
    slug: 'little-explorer',
    name: 'موسوعة المستكشف الصغير',
    category: 'library',
    price: 400,
    shortDescription:
      'رحلة في عالم العلوم، الفضاء، جسم الإنسان، والطبيعة. مليئة بالحقائق المدهشة والصور.',
    coverImageUrl: 'https://picsum.photos/seed/lib2/600/800',
  },
  {
    ownerType: 'publisher',
    id: 'prod-lib-3',
    publisherId: 'pub-1',
    slug: 'morals-garden',
    name: 'حديقة الأخلاق',
    category: 'library',
    price: 300,
    electronicPrice: 120,
    shortDescription:
      'قصص قصيرة تعلم الأطفال الآداب الإسلامية والأخلاق الحميدة في التعامل مع الأسرة والجيران والأصدقاء.',
    coverImageUrl: 'https://picsum.photos/seed/lib3/600/800',
  },
  {
    ownerType: 'publisher',
    id: 'prod-lib-4',
    publisherId: 'pub-2',
    slug: 'bedtime-stories',
    name: 'حكايات قبل النوم',
    category: 'library',
    price: 320,
    electronicPrice: 130,
    shortDescription:
      'مجموعة هادئة ولطيفة من القصص الخيالية القصيرة لتساعد طفلك على الاسترخاء والنوم بأحلام سعيدة.',
    coverImageUrl: 'https://picsum.photos/seed/lib4/600/800',
  },
];

export const mockAddonProducts: AddonProduct[] = [
  {
    id: 'addon-1',
    name: 'دفتر تلوين الأبطال',
    price: 80,
    description:
      'دفتر تلوين يحتوي على شخصيات القصة ومشاهد منها، ليقوم الطفل بتلوين مغامرته بنفسه.',
  },
  {
    id: 'addon-2',
    name: 'ملصقات اسمي',
    price: 50,
    description:
      'مجموعة ملصقات عالية الجودة تحمل اسم طفلك وشخصيات كرتونية لطيفة.',
  },
];

export const mockSubscriptionTiers: SubscriptionTier[] = [
  {
    id: 'sub-1',
    name: 'شهري',
    priceTotal: 450,
    priceMonthly: 450,
    durationMonths: 1,
  },
  {
    id: 'sub-2',
    name: 'ربع سنوي',
    priceTotal: 1200,
    priceMonthly: 400,
    durationMonths: 3,
    savingsNote: `وفر ${formatPrice(150)}`,
  },
  {
    id: 'sub-3',
    name: 'نصف سنوي',
    priceTotal: 2100,
    priceMonthly: 350,
    durationMonths: 6,
    savingsNote: `وفر ${formatPrice(600)}`,
  },
];

import { createClient } from '@/lib/supabase/server';

export const getPersonalizedProducts = async (): Promise<PersonalizedProduct[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('personalized_products')
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

  return data.map(p => ({
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

export const getAddonProducts = async (): Promise<AddonProduct[]> => {
  return Promise.resolve(mockAddonProducts);
};

export const getSubscriptionTiers = async (): Promise<SubscriptionTier[]> => {
  return Promise.resolve(mockSubscriptionTiers);
};

export const mockPublishers: Publisher[] = [
  {
    id: 'pub-1',
    status: 'active',
    slug: 'dar-alhekaya',
    name: 'دار الحكاية الصغيرة',
    logoUrl: 'https://picsum.photos/seed/pub1/200/200',
    bio: 'دار متخصصة في نشر القصص التعليمية والتربوية للأطفال لبناء جيل واعٍ ومبدع.',
    isSample: true
  },
  {
    id: 'pub-2',
    status: 'active',
    slug: 'khayal-akhdar',
    name: 'ناشر الخيال الأخضر',
    logoUrl: 'https://picsum.photos/seed/pub2/200/200',
    bio: 'ناشر رائد في كتب المغامرات والموسوعات العلمية المبسطة لتشجيع الخيال والابتكار.',
    isSample: true
  },
  {
    id: 'pub-pending',
    slug: 'dar-new',
    name: 'دار النشر الجديدة',
    bio: 'دار نشر جديدة في انتظار الاعتماد',
    isSample: true,
    status: 'pending',
  },
];

export const getPublishers = async (): Promise<Publisher[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('publishers')
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
  const { data, error } = await supabase
    .from('publishers')
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
    isSample: data.is_sample,
    status: data.status
  };
};

export const getProductBySlug = async (slug: string): Promise<PersonalizedProduct | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('personalized_products')
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
      shortDescription: data.short_description,
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




