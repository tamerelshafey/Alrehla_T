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
}

export const getSiteSettings = async (): Promise<SiteSettings> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('site_settings')
    .select('value')
    .eq('key', 'general')
    .single();

  if (error || !data) {
    if (process.env.NODE_ENV === 'development') {
      return mockSiteSettings;
    }
    return { siteName: "", contactEmail: "", facebookUrl: "", instagramUrl: "" };
  }

  return data.value as unknown as SiteSettings;
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

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('blog_posts')
    .select('*')
    .order('published_at', { ascending: false });

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

  if (error || !data) {
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

