import { getSiteSettings } from '@/data/domains/content';
import { AnnouncementBarClient } from './AnnouncementBarClient';

/**
 * شريط التنبيه العلوي.
 *
 * بيتظبط من «الإعدادات العامة»: نص، وتشغيل/إيقاف، وتاريخ اختفاء تلقائي.
 *
 * ليه التاريخ مهم: التنبيه اللي بينسى مفتوح بيبقى جزء من ديكور الصفحة
 * وبيتجاهله الكل. التاريخ بيخليه يختفي لوحده بعد ما ينتهي سببه.
 *
 * الفحص بيتم على السيرفر، فالشريط المنتهي ما بيوصلش للمتصفح أصلًا.
 */
export async function AnnouncementBar() {
  const { announcement } = await getSiteSettings();

  if (!announcement.enabled || !announcement.text.trim()) return null;

  if (announcement.until) {
    const until = new Date(announcement.until);
    if (!Number.isNaN(until.getTime()) && until.getTime() <= Date.now()) {
      return null;
    }
  }

  return <AnnouncementBarClient text={announcement.text} />;
}
