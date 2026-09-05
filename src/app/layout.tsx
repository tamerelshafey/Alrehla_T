import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DevAuthToolbar from '@/components/dev/DevAuthToolbar';

const cairo = Cairo({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  title: 'الرحلة',
  description: 'منصة تعليمية لتعلّم الكتابة الإبداعية وتقديم قصص وهدايا مخصصة للأطفال والشباب.',
  openGraph: {
    title: 'الرحلة',
    description: 'منصة تعليمية لتعلّم الكتابة الإبداعية وتقديم قصص وهدايا مخصصة للأطفال والشباب.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'الرحلة',
    description: 'منصة تعليمية لتعلّم الكتابة الإبداعية وتقديم قصص وهدايا مخصصة للأطفال والشباب.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-sans text-slate-800 antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        <Header />
        <main className="flex-1 flex flex-col relative w-full">
          {children}
        </main>
        <Footer />
        <DevAuthToolbar />
      </body>
    </html>
  );
}
