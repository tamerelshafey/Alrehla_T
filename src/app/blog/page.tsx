import Link from 'next/link';
import { getBlogPosts } from '@/data/mock';
import { BookOpen, Calendar, ArrowLeft } from 'lucide-react';

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="flex-1 flex flex-col items-center justify-start relative px-6 md:px-12 py-20 w-full font-sans text-slate-800 space-y-24">
      
      {/* Header */}
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">
          المدونة
        </h1>
        <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
          مقالات وأفكار حول القصص والكتابة والتربية والإبداع.
        </p>
      </section>

      {/* Blog Grid */}
      <section className="w-full max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all duration-300 flex flex-col h-full">
              
              <div className="w-full aspect-[4/3] bg-slate-100 rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
                {post.coverImageUrl ? (
                  <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <BookOpen className="w-12 h-12 text-slate-300" />
                )}
              </div>

              <div className="flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-slate-600 font-medium text-sm leading-relaxed mb-6 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="mt-auto flex items-center justify-between text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.publishedAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <span className="flex items-center gap-1 text-amber-600 group-hover:gap-2 transition-all">
                    اقرأ المزيد <ArrowLeft className="w-3 h-3" />
                  </span>
                </div>
              </div>

            </Link>
          ))}
        </div>
      </section>
      
    </div>
  );
}
