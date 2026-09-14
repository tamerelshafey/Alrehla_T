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




export interface SiteSettings {
  siteName: string;
  contactEmail: string;
  facebookUrl: string;
  instagramUrl: string;
  /** The wallet customers transfer to. Editable from the admin settings screen
   *  so it never has to be a number buried in the code again. */
  paymentWalletNumber: string;
}

/** Used only when the settings row has no wallet number saved yet. */
export const DEFAULT_PAYMENT_WALLET = '01063335517';

export const getSiteSettings = async (): Promise<SiteSettings> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('site_settings')
    .select('value')
    .eq('key', 'general')
    .single();

  if (error || !data) {
    if (process.env.NODE_ENV === 'development') {
      return { ...mockSiteSettings, paymentWalletNumber: DEFAULT_PAYMENT_WALLET };
    }
    return {
      siteName: '',
      contactEmail: '',
      facebookUrl: '',
      instagramUrl: '',
      paymentWalletNumber: DEFAULT_PAYMENT_WALLET,
    };
  }

  const value = data.value as unknown as Partial<SiteSettings>;
  return {
    siteName: value.siteName ?? '',
    contactEmail: value.contactEmail ?? '',
    facebookUrl: value.facebookUrl ?? '',
    instagramUrl: value.instagramUrl ?? '',
    paymentWalletNumber: value.paymentWalletNumber || DEFAULT_PAYMENT_WALLET,
  };
};

import { createClient } from '@/lib/supabase/server';
import { mockBlogPosts, mockSiteSettings, mockTestimonials } from '@/data/fixtures/content';

export const getTestimonials = async (): Promise<Testimonial[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });

  if ((error || !data || data.length === 0)) {
    if (process.env.NODE_ENV === 'development') {
      return mockTestimonials;
    }
    return [];
  }

  return data.map((t: any) => ({
    id: t.id,
    authorName: t.author_name,
    authorRole: t.author_role,
    content: t.content
  }));
};

export const getBlogPosts = async (
  options: { includeDrafts?: boolean } = {}
): Promise<BlogPost[]> => {
  const supabase = await createClient();
  // A post dated in the future is a draft: the public listing must not show it.
  const query = supabase.from('blog_posts').select('*');
  if (!options.includeDrafts) {
    query.lte('published_at', new Date().toISOString());
  }
  const { data, error } = await query.order('published_at', { ascending: false });

  if ((error || !data || data.length === 0)) {
    if (process.env.NODE_ENV === 'development') {
      return mockBlogPosts;
    }
    return [];
  }

  return data.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    coverImageUrl: p.cover_image_url || undefined,
    authorName: p.author_name || 'فريق الرحلة',
    publishedAt: p.published_at
  }));
};

export const getBlogPostBySlug = async (
  slug: string
): Promise<BlogPost | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  // Sample data is for local development only — it must never stand in for
  // a real record on the live site.
  if (error || !data) {
    if (process.env.NODE_ENV !== 'development') return null;
    const post = mockBlogPosts.find((p) => p.slug === slug);
    return post || null;
  }

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    coverImageUrl: data.cover_image_url || undefined,
    authorName: data.author_name || 'فريق الرحلة',
    publishedAt: data.published_at
  };
};


/** One post by id — for the admin editor, which works on ids not slugs. */
export const getBlogPostById = async (id: string): Promise<BlogPost | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    coverImageUrl: data.cover_image_url || undefined,
    authorName: data.author_name || 'فريق الرحلة',
    publishedAt: data.published_at,
  };
};
