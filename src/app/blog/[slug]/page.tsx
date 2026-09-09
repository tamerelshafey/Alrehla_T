import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { PageContainer } from '@/components/PageContainer';
import { ArrowLeft, Calendar, User, BookOpen, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { getBlogPosts } from '@/data/mock';
import { notFound } from 'next/navigation';


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const posts = await getBlogPosts();
  const post = posts.find(p => p.slug === resolvedParams.slug);
  if (!post) return { title: 'مقال غير موجود' };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const posts = await getBlogPosts();
  const post = posts.find(p => p.slug === resolvedParams.slug) || posts[0]; // fallback for preview

  if (!post) {
    notFound();
  }

  return (
    <PageContainer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "datePublished": post.publishedAt,
    "author": {
      "@type": "Organization",
      "name": "فريق الرحلة"
    }
  }) }} />
      <div className="mx-auto w-full max-w-4xl pt-12 pb-24">
        {/* Back link */}
        <Link href="/blog" className="mb-8 inline-flex items-center gap-2 font-bold text-slate-500 hover:text-amber-600 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          العودة للمدونة
        </Link>

        {/* Article Header */}
        <header className="mb-12 text-center">
          <h1 className="mb-6 text-3xl font-black leading-tight text-slate-900 md:text-5xl">{post.title}</h1>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-bold text-slate-500">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-500" />
              {formatDate(post.publishedAt)}
            </div>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-amber-500" />
              فريق الرحلة
            </div>
          </div>
        </header>

        {/* Cover Image */}
        <div className="mb-16 aspect-[21/9] w-full overflow-hidden rounded-[2rem] bg-slate-100 shadow-lg">
          {post.coverImageUrl ? (
            <img 
              src={post.coverImageUrl} 
              alt={post.title} 
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              <BookOpen className="h-24 w-24" />
            </div>
          )}
        </div>

        {/* Content */}
        <article className="prose prose-slate prose-lg mx-auto prose-headings:font-black prose-a:text-amber-600 prose-img:rounded-2xl max-w-3xl">
          <p className="lead text-xl text-slate-600 font-medium leading-relaxed mb-8">
            {post.excerpt}
          </p>
          <div className="text-slate-700 leading-loose space-y-6">
            <p>
              في عالم يتسارع فيه كل شيء، تظل القراءة والكتابة من أهم النوافذ التي يطل منها الطفل واليافع على عوالمه الداخلية والخارجية. من خلال القصة، لا يتعلم الطفل فقط مفردات جديدة، بل يكتسب مهارات حياتية وقيم إنسانية تبني شخصيته.
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-10 mb-4">أهمية الخيال في التنشئة</h3>
            <p>
              يعد الخيال المحرك الأساسي للإبداع. عندما يقرأ الطفل قصة أو يبني أحداثها بنفسه، فإنه يضع نفسه مكان الأبطال، ويختبر مشاعر متنوعة في بيئة آمنة تماماً. هذه التجربة تعزز من قدرته على التعاطف وحل المشكلات.
            </p>
            <p>
              من هنا، نؤمن في منصة «الرحلة» أن تخصيص القصص لتشمل تفاصيل عن الطفل نفسه، يضاعف من ارتباطه بالقراءة ويجعله شغوفاً بمعرفة المزيد. 
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-10 mb-4">كيف نبني هذه التجربة؟</h3>
            <ul className="list-disc pr-6 space-y-2 marker:text-amber-500">
              <li>نعتمد على بناء سردي سليم يحترم وعي الطفل.</li>
              <li>نشرك العائلة في اختيار القيم التربوية المناسبة.</li>
              <li>نقدم منتجاً بصرياً عال الجودة يثري المخيلة.</li>
            </ul>
            <p>
              في النهاية، تذكر أن تخصيص وقت للقراءة اليومية مع طفلك هو استثمار حقيقي في مستقبله وذاكرته.
            </p>
          </div>
        </article>

        {/* Share */}
        <div className="mt-16 flex items-center justify-center gap-4 border-t border-slate-200 pt-8">
          <span className="font-bold text-slate-700">شارك المقال:</span>
          <div className="flex gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-blue-600 hover:text-white">
              <Facebook className="h-5 w-5" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-sky-500 hover:text-white">
              <Twitter className="h-5 w-5" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-blue-700 hover:text-white">
              <Linkedin className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
