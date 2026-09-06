import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white px-6 py-8 md:px-12 md:py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row md:items-start">
        <div className="space-y-4 text-center md:text-right">
          <Link
            href="/"
            className="block text-2xl font-black tracking-tighter text-amber-500"
          >
            الرحلة
          </Link>
          <p className="max-w-xs text-sm text-slate-500">
            منصة تعليمية متطورة لتعلّم الكتابة الإبداعية وتقديم قصص مخصصة.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 md:justify-end">
          <div className="space-y-3">
            <h4 className="text-sm font-black tracking-widest text-slate-800 uppercase">
              روابط سريعة
            </h4>
            <div className="flex flex-col gap-2 text-sm font-medium text-slate-500">
              <Link
                href="/about"
                className="transition-colors hover:text-amber-500"
              >
                رحلتنا
              </Link>
              <Link
                href="/enha-lak"
                className="transition-colors hover:text-amber-500"
              >
                إنها لك
              </Link>
              <Link
                href="/creative-writing"
                className="transition-colors hover:text-amber-500"
              >
                بداية الرحلة
              </Link>
              <Link
                href="/blog"
                className="transition-colors hover:text-amber-500"
              >
                المدونة
              </Link>
              <Link
                href="/join-us"
                className="transition-colors hover:text-amber-500"
              >
                انضم إلينا
              </Link>
              <Link
                href="/support"
                className="transition-colors hover:text-amber-500"
              >
                الدعم والمساعدة
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-black tracking-widest text-slate-800 uppercase">
              القانونية
            </h4>
            <div className="flex flex-col gap-2 text-sm font-medium text-slate-500">
              <Link
                href="/privacy"
                className="transition-colors hover:text-amber-500"
              >
                سياسة الخصوصية
              </Link>
              <Link
                href="/terms"
                className="transition-colors hover:text-amber-500"
              >
                الشروط والأحكام
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs font-medium text-slate-400 md:flex-row">
        <p>© {new Date().getFullYear()} منصة الرحلة. جميع الحقوق محفوظة.</p>
        <div className="rounded bg-slate-50 px-2 py-1 font-mono">
          AR - RTL Default
        </div>
      </div>
    </footer>
  );
}
