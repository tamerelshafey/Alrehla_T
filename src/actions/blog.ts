'use server';
import { requireAdmin } from '@/lib/auth-guard';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { logAuditAction } from '@/lib/audit';

/**
 * Writing and publishing blog posts.
 *
 * The admin editor was a `<form>` with no action whose fields were filled with
 * hard-coded sample text ("كيف تشجع طفلك على القراءة") rather than the real
 * article, and whose save button had no handler — so there was no way to
 * publish or edit a post from inside the site at all.
 */

/** يفوّض للقاعدة الموحّدة في `@/lib/auth-guard` — التنفيذ واحد، والرسالة خاصة بهذا المجال. */
async function requireContentAdmin() {
  return requireAdmin('canManageContent', 'غير مصرح لك بإدارة المدونة');
}

/**
 * A URL-safe slug. Arabic characters are kept — Arabic URLs work fine and a
 * transliterated slug would be worse for search than the real title.
 */
function toSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);
}

export interface BlogPostInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  authorName: string;
  /** Unpublished posts are dated in the future, which is how the list marks a draft. */
  isPublished: boolean;
  publishedAt: string;
}

function validate(input: BlogPostInput) {
  const title = input.title.trim();
  const content = input.content.trim();
  if (!title) throw new Error('اكتب عنوان المقال');
  if (!content) throw new Error('اكتب محتوى المقال');

  const slug = toSlug(input.slug || title);
  if (!slug) throw new Error('تعذّر توليد رابط للمقال — غيّر العنوان');

  // A draft is simply not yet published: it keeps a future date so the public
  // listing, which orders and filters by date, never shows it.
  const publishedAt = input.isPublished
    ? input.publishedAt || new Date().toISOString()
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  return {
    title,
    slug,
    excerpt: input.excerpt.trim(),
    content,
    cover_image_url: input.coverImageUrl.trim() || null,
    author_name: input.authorName.trim() || 'فريق الرحلة',
    published_at: publishedAt,
    updated_at: new Date().toISOString(),
  };
}

export async function saveBlogPost(id: string | null, input: BlogPostInput) {
  const admin = await requireContentAdmin();
  const row = validate(input);
  const supabase = await createClient();

  const { data, error } = id
    ? await supabase.from('blog_posts').update(row).eq('id', id).select('id, slug').single()
    : await supabase.from('blog_posts').insert(row).select('id, slug').single();

  if (error || !data) {
    console.error('Error saving blog post', error);
    if (String(error?.message ?? '').toLowerCase().includes('duplicate')) {
      throw new Error('يوجد مقال آخر بنفس الرابط — غيّر العنوان أو الرابط');
    }
    throw new Error('تعذّر حفظ المقال');
  }

  await logAuditAction({
    actorProfileId: admin.id,
    actorName: admin.fullName,
    action: id ? 'blog_post_updated' : 'blog_post_created',
    entityType: 'BlogPost',
    entityId: data.id,
    metadata: { title: row.title, published: input.isPublished },
  });

  revalidatePath('/dashboard/admin/content/blog');
  revalidatePath('/blog');
  revalidatePath(`/blog/${data.slug}`);
  return { ok: true, id: data.id };
}

export async function deleteBlogPost(id: string) {
  const admin = await requireContentAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) {
    console.error('Error deleting blog post', error);
    throw new Error('تعذّر حذف المقال');
  }

  await logAuditAction({
    actorProfileId: admin.id,
    actorName: admin.fullName,
    action: 'blog_post_deleted',
    entityType: 'BlogPost',
    entityId: id,
  });

  revalidatePath('/dashboard/admin/content/blog');
  revalidatePath('/blog');
  redirect('/dashboard/admin/content/blog');
}
