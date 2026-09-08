import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { SimpleDataTable } from '@/components/dashboard/SimpleDataTable';
import { getPublishers, getPersonalizedProducts } from '@/data/mock';

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
  };

  const formattedProducts = myProducts.map(product => ({
    ...product,
    priceDisplay: `${product.price} ج.م`,
    categoryDisplay: categoryMap[product.category] || product.category
  }));

  const columns = [
    { header: 'اسم المنتج', accessorKey: 'name' },
    { header: 'النوع', accessorKey: 'categoryDisplay' },
    { header: 'السعر', accessorKey: 'priceDisplay' }
  ];

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader 
        title="منتجاتي" 
        backHref="/dashboard/publisher"
      />
      <SimpleDataTable columns={columns} data={formattedProducts} />
    </div>
  );
}
