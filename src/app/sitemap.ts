import { MetadataRoute } from 'next';
import { getBlogPosts, getPersonalizedProducts, getPublishers, getInstructors } from '@/data/mock';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alrehlat.vercel.app';

  // Static routes
  const staticRoutes = [
    '',
    '/about',
    '/blog',
    '/enha-lak',
    '/creative-writing',
    '/creative-writing/instructors',
    '/creative-writing/packages',
    '/join-us',
    '/support',
    '/privacy',
    '/terms'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic routes
  const posts = await getBlogPosts();
  const blogRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt || new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const allProducts = await getPersonalizedProducts();
  const platformProducts = allProducts.filter((p: any) => p.ownerType === 'platform');
  const productRoutes = platformProducts.map((product: any) => ({
    url: `${baseUrl}/enha-lak/product/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const publishers = await getPublishers();
  const publisherRoutes = publishers.map((pub: any) => ({
    url: `${baseUrl}/enha-lak/publisher/${pub.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const instructors = await getInstructors();
  const instructorRoutes = instructors.map((inst: any) => ({
    url: `${baseUrl}/creative-writing/instructors/${inst.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...blogRoutes,
    ...productRoutes,
    ...publisherRoutes,
    ...instructorRoutes,
  ];
}
