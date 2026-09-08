export const dynamic = 'force-dynamic';
import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ScrollToTop from '@/components/layout/ScrollToTop';
import DevAuthToolbar from '@/components/dev/DevAuthToolbar';
import { Providers } from '@/components/providers/Providers';

const cairo = Cairo({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  title: 'الرحلة',
  description:
    'منصة تعليمية لتعلّم الكتابة الإبداعية وتقديم قصص وهدايا مخصصة للأطفال والشباب.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${cairo.variable} flex min-h-screen flex-col font-sans text-slate-800 antialiased bg-[#FCFDFD] selection:bg-amber-200 selection:text-amber-900`}
        suppressHydrationWarning
      >
        <Providers>
          <ScrollToTop />
          <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-emerald-500 z-50" />
          <Header />
          <main className="relative flex w-full flex-1 flex-col">{children}</main>
          <Footer />
          <DevAuthToolbar />
        </Providers>
      </body>
    </html>
  );
}
