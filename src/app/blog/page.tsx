import Link from 'next/link';
import { getBlogPosts } from '@/data/mock';
import { BookOpen, Calendar, ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/components/PageContainer';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المدونة',
  description: 'تصفح أحدث مقالات ونصائح منصة الرحلة.',
};


export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <PageContainer>
      {/* Header */}
      <section className="mx-auto max-w-4xl space-y-6 text-center">
        <h1 className="text-4xl leading-tight font-black text-slate-900 md:text-6xl">
          المدونة
        </h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed font-medium text-slate-500 md:text-xl">
          مقالات وأفكار حول القصص والكتابة والتربية والإبداع.
        </p>
      </section>

      {/* Blog Grid */}
      <section className="mx-auto w-full max-w-6xl">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-amber-200 hover:shadow-xl"
            >
              <div className="mb-6 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                {post.coverImageUrl ? (
                  <img
                    src={post.coverImageUrl}
                    alt={post.title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <BookOpen className="h-12 w-12 text-slate-300" />
                )}
              </div>

              <div className="flex flex-1 flex-col">
                <h3 className="mb-3 line-clamp-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-amber-600">
                  {post.title}
                </h3>
                <p className="mb-6 line-clamp-3 text-sm leading-relaxed font-medium text-slate-600">
                  {post.excerpt}
                </p>
                <div className="mt-auto flex items-center justify-between text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.publishedAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <span className="flex items-center gap-1 text-amber-600 transition-all group-hover:gap-2">
                    اقرأ المزيد <ArrowLeft className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
