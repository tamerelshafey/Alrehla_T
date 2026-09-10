import { BookOpen } from 'lucide-react';
import { PageContainer } from '@/components/PageContainer';
import { SectionHeader } from '@/components/SectionHeader';
import { getPersonalizedProducts, getPublishers } from '@/data/mock';
import { LibraryClient } from './LibraryClient';

export default async function LibraryPage() {
  const allProducts = await getPersonalizedProducts();
  const libraryProducts = allProducts.filter((p) => p.category === 'library');
  const publishers = await getPublishers();

  return (
    <PageContainer className="!py-0 !space-y-0">
      {/* Header */}
      <SectionHeader
        title="المكتبة العامة"
        icon={<BookOpen className="h-8 w-8" />}
        iconClassName="bg-rose-50 text-rose-600"
        description="اختر قصة جاهزة من المكتبة وخصص غلافها فقط، محتوى القصة الأصلي يبقى كما هو. خيار مثالي لمن يبحث عن محتوى قيم بلمسة شخصية بسيطة."
      />

      {/* Library Products with Filters */}
      <LibraryClient initialProducts={libraryProducts} publishers={publishers} />
    </PageContainer>
  );
}
