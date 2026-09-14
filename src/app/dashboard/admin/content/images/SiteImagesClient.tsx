'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Upload, Trash2, MapPin, Crop } from 'lucide-react';
import { SITE_IMAGE_SLOTS, type SiteImages } from '@/lib/site-images';
import { uploadImage, optimizedImageUrl } from '@/lib/cloudinary';
import { saveSiteImage } from '@/actions/content';

/**
 * Every image slot on the site, in one place.
 *
 * Each slot says where it appears and what shape it should be, so an image
 * can be prepared correctly without opening the code.
 */
export function SiteImagesClient({ images }: { images: SiteImages }) {
  const router = useRouter();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState('');

  const upload = async (key: string, file: File | undefined) => {
    if (!file) return;
    setBusyKey(key);
    setError('');
    try {
      const uploaded = await uploadImage(file, 'alrehla/site');
      await saveSiteImage({ key, url: uploaded.url });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر رفع الصورة');
    } finally {
      setBusyKey(null);
    }
  };

  const remove = async (key: string) => {
    setBusyKey(key);
    setError('');
    try {
      await saveSiteImage({ key, url: '' });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر حذف الصورة');
    } finally {
      setBusyKey(null);
    }
  };

  const filled = SITE_IMAGE_SLOTS.filter((s) => images[s.key]).length;

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-600">
        {filled} من {SITE_IMAGE_SLOTS.length} صورة مرفوعة.
        {filled < SITE_IMAGE_SLOTS.length &&
          ' الأماكن الفارغة تظهر للزائر كإطار فارغ حتى ترفع صورتها.'}
      </div>

      {SITE_IMAGE_SLOTS.map((slot) => {
        const url = images[slot.key];
        const busy = busyKey === slot.key;

        return (
          <div
            key={slot.key}
            className="flex flex-wrap items-center gap-5 rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              {url ? (
                <Image
                  src={optimizedImageUrl(url, 400)}
                  alt={slot.label}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400">
                  فارغ
                </div>
              )}
            </div>

            <div className="min-w-[200px] flex-1">
              <h3 className="font-black text-slate-800">{slot.label}</h3>
              <p className="mt-1 flex items-start gap-1.5 text-sm font-medium text-slate-500">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {slot.location}
              </p>
              <p className="mt-1 flex items-start gap-1.5 text-xs font-bold text-slate-400">
                <Crop className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {slot.ratio}
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200">
                <Upload className="h-4 w-4" />
                {busy ? 'جارٍ…' : url ? 'تغيير' : 'رفع صورة'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={busy}
                  onChange={(e) => upload(slot.key, e.target.files?.[0])}
                />
              </label>
              {url && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => remove(slot.key)}
                  className="rounded-xl border border-red-200 bg-white px-3 py-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                  aria-label="حذف الصورة"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
