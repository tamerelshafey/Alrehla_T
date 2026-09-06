import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <h2>الصفحة غير موجودة</h2>
      <Link href="/">العودة للصفحة الرئيسية</Link>
    </div>
  );
}
