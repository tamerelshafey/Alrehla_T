import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getPersonalizedProducts, getPublishers } from '@/data/mock';
import { getPublisherPricingSettings } from '@/data/domains/admin';
import { ProductEditFormClient } from '../ProductEditFormClient';
import { hasAdminPermission } from '@/lib/utils';
import { Unauthorized } from '@/components/admin/Unauthorized';
import { saveProduct } from '@/actions/products';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!hasAdminPermission(user, 'canManagePublishers')) {
    return <Unauthorized />;
  }

  const { id } = await params;
  const allProducts = await getPersonalizedProducts();
  const target = allProducts.find(p => p.id === id) || allProducts[0];
  const publishers = await getPublishers();
  const pricingSettings = await getPublisherPricingSettings();

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <DashboardPageHeader title="تعديل المنتج" backHref="/dashboard/admin/products" />
      
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <ProductEditFormClient product={target} publishers={publishers} pricingSettings={pricingSettings} />
      </div>
    </div>
  );
}
