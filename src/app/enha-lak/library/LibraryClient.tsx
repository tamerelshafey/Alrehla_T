'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Book, FileText, Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { PersonalizedProduct, Publisher } from '@/types';

interface LibraryClientProps {
  initialProducts: PersonalizedProduct[];
  publishers: Publisher[];
}

export function LibraryClient({ initialProducts, publishers }: LibraryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPublisher, setSelectedPublisher] = useState('all');
  const [bookType, setBookType] = useState('all'); // all, print, digital
  const [sortBy, setSortBy] = useState('newest'); // newest, price-asc, price-desc

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...initialProducts];

    // Filter by search query
    if (searchQuery) {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Filter by publisher
    if (selectedPublisher !== 'all') {
      result = result.filter(p => p.publisherId === selectedPublisher);
    }

    // Filter by book type
    if (bookType === 'digital') {
      result = result.filter(p => p.electronicPrice != null);
    } else if (bookType === 'print') {
      // Assuming all books are available as print, or if we had a specific field for print
      // we could filter here. Currently, we show all if 'print' is selected, except if we want to enforce it.
    }

    // Sort
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      // Mock newest by reversing or sorting by id if dates aren't available
      result.sort((a, b) => b.id.localeCompare(a.id));
    }

    return result;
  }, [initialProducts, searchQuery, selectedPublisher, bookType, sortBy]);

  return (
    <section className="mx-auto w-full max-w-7xl">
      {/* Filters Toolbar */}
      <div className="mb-8 rounded-3xl bg-white p-4 shadow-sm border border-slate-200 lg:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="ابحث عن اسم الكتاب..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pr-12 pl-4 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-4 md:flex-nowrap">
            {/* Publisher Filter */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-slate-400 hidden sm:block" />
              <select
                className="rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-w-[160px]"
                value={selectedPublisher}
                onChange={(e) => setSelectedPublisher(e.target.value)}
              >
                <option value="all">جميع دور النشر</option>
                {publishers.map(pub => (
                  <option key={pub.id} value={pub.id}>{pub.name}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <select
              className="rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-w-[140px]"
              value={bookType}
              onChange={(e) => setBookType(e.target.value)}
            >
              <option value="all">كل الأنواع</option>
              <option value="print">مطبوع فقط</option>
              <option value="digital">متوفر إلكتروني</option>
            </select>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5 text-slate-400 hidden sm:block" />
              <select
                className="rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-w-[160px]"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">الأحدث</option>
                <option value="price-asc">السعر: من الأقل للأعلى</option>
                <option value="price-desc">السعر: من الأعلى للأقل</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {filteredAndSortedProducts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAndSortedProducts.map((product) => {
            const publisher = publishers.find(p => p.id === product.publisherId);
            return (
              <div
                key={product.id}
                className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-emerald-200 hover:shadow-xl relative"
              >
                <Link href={`/enha-lak/product/${product.slug}`} className="absolute inset-0 z-0" />
                <div className="relative h-64 w-full bg-slate-100">
                  <Image
                    src={
                      product.coverImageUrl ||
                      `https://picsum.photos/seed/${product.id}/600/800`
                    }
                    alt={product.name}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {publisher && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm z-10 pointer-events-none">
                      {publisher.name}
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6 z-10 pointer-events-none">
                  <h3 className="mb-2 text-xl font-bold text-slate-800">
                    {product.name}
                  </h3>
                  <p className="mb-6 flex-1 text-sm font-medium text-slate-500 line-clamp-2">
                    {product.shortDescription}
                  </p>
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2">
                        <Book className="h-4 w-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">
                          مطبوعة
                        </span>
                      </div>
                      <span className="font-black text-emerald-600">
                        {product.price.toLocaleString('ar-EG')} ج.م
                      </span>
                    </div>
                    {product.electronicPrice && (
                      <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <span className="text-xs font-bold text-slate-700">
                            إلكترونية
                          </span>
                        </div>
                        <span className="font-black text-emerald-600">
                          {product.electronicPrice.toLocaleString('ar-EG')} ج.م
                        </span>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/enha-lak/custom-library/${product.slug}`}
                    className="flex w-full items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white transition-colors hover:bg-emerald-700 pointer-events-auto"
                  >
                    تخصيص الغلاف
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-200">
          <Book className="h-16 w-16 text-slate-300 mb-4" />
          <h3 className="text-2xl font-black text-slate-800 mb-2">لا توجد نتائج</h3>
          <p className="text-slate-500">جرب تغيير كلمات البحث أو استخدام فلاتر مختلفة.</p>
        </div>
      )}
    </section>
  );
}
