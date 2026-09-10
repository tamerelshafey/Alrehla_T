import { formatPrice } from '@/lib/utils';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import { getPublishers, getPersonalizedProducts } from '@/data/mock';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PublisherProductsPage() {
  const publishers = await getPublishers();
  const myPublisher = publishers[0]; 
  
  const allProducts = await getPersonalizedProducts();
  const myProducts = allProducts.filter(p => p.publisherId === myPublisher.id);

  const categoryMap: Record<string, string> = {
    book: 'كتاب',
    game: 'لعبة',
    accessory: 'ملحق',
    library: 'مكتبة',
  };

  const formattedProducts = myProducts.map(product => ({
    ...product,
    nameDisplay: <Link href={`/dashboard/publisher/products/${product.id}`} className="font-bold text-blue-600 hover:underline">{product.name}</Link>,
    priceDisplay: `${formatPrice(product.price)}`,
    categoryDisplay: categoryMap[product.category] || product.category
  }));

  const columns = [
    { header: 'اسم المنتج', accessorKey: 'nameDisplay' },
    { header: 'النوع', accessorKey: 'categoryDisplay' },
    { header: 'السعر', accessorKey: 'priceDisplay' }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader 
        title="منتجاتي" 
        backHref="/dashboard/publisher"
      />
      
      <div className="flex justify-start mb-6">
        <Link href="/dashboard/publisher/products/new" className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-bold text-white shadow-md transition-colors hover:bg-amber-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          إضافة منتج جديد
        </Link>
      </div>

      <SimpleDataTable columns={columns} data={formattedProducts} />
    </div>
  );
}
