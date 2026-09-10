import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogPosts } from '@/data/mock';
import { BookOpen, Calendar, ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/components/PageContainer';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المدونة',
  description: 'تصفح أحدث مقالات ونصائح منصة الرحلة.',
};


export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <PageContainer className="!py-0 !space-y-0">
      {/* Header */}
      <Section containerClassName="max-w-4xl space-y-6 text-center">
        <h1 className="text-4xl leading-tight font-black text-slate-900 md:text-6xl">
          المدونة
        </h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed font-medium text-slate-500 md:text-xl">
          مقالات وأفكار حول القصص والكتابة والتربية والإبداع.
        </p>
      </Section>

      {/* Blog Grid */}
      <Section containerClassName="max-w-6xl">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block h-full">
              <Card
                accentColor="amber"
                className="flex h-full flex-col p-6 transition-all duration-300 group-hover:border-amber-200 group-hover:shadow-xl"
              >
                <div className="relative mb-6 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                  {post.coverImageUrl ? (
                    <Image src={post.coverImageUrl} alt={`صورة مقال: ${post.title}`} fill className="object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
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
                      {formatDate(post.publishedAt)}
                    </div>
                    <span className="flex items-center gap-1 text-amber-600 transition-all group-hover:gap-2">
                      اقرأ المزيد <ArrowLeft className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </Section>
    </PageContainer>
  );
}
