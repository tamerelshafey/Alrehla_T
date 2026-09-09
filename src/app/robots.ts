import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.enhalak.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/account/',
        '/cart/',
        '/checkout/',
        '/enha-lak/checkout/',
        '/enha-lak/order-confirmation/',
        '/creative-writing/booking/',
        '/sign-in/',
        '/sign-up/'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
