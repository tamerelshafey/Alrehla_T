/**
 * Every image the site shows that is not a product, a person or an article.
 *
 * These were all `https://picsum.photos/...` — random stock photographs pulled
 * from the internet and presented as the platform's own. Each slot is named
 * here once, with where it appears, so the admin screen can list them and
 * nobody has to hunt through the code to find which image goes where.
 */

export type SiteImageKey =
  | 'homeHero'
  | 'homeReading'
  | 'homeWriting'
  | 'homeFamily'
  | 'aboutTeam'
  | 'creativeSlide1'
  | 'creativeSlide2'
  | 'creativeSlide3'
  | 'enhaLakSlide1'
  | 'enhaLakSlide2'
  | 'enhaLakSlide3';

export type SiteImageSlot = {
  key: SiteImageKey;
  /** What it is, in the admin screen. */
  label: string;
  /** Exactly where it appears on the site. */
  location: string;
  /** The shape it is displayed in, so the uploaded image fits. */
  ratio: string;
};

export const SITE_IMAGE_SLOTS: SiteImageSlot[] = [
  {
    key: 'homeHero',
    label: 'الصورة الرئيسية',
    location: 'الصفحة الرئيسية — أعلى الصفحة بجوار العنوان',
    ratio: 'مربعة (1:1) — 800×800 أو أكبر',
  },
  {
    key: 'homeReading',
    label: 'صورة قسم «إنها لك»',
    location: 'الصفحة الرئيسية — قسم القصص المخصصة',
    ratio: 'أفقية (4:3) — 800×600 أو أكبر',
  },
  {
    key: 'homeWriting',
    label: 'صورة قسم «بداية الرحلة»',
    location: 'الصفحة الرئيسية — قسم الكتابة الإبداعية',
    ratio: 'أفقية (4:3) — 800×600 أو أكبر',
  },
  {
    key: 'homeFamily',
    label: 'صورة قسم العائلة',
    location: 'الصفحة الرئيسية — القسم قبل الأخير',
    ratio: 'مربعة (1:1) — 800×800 أو أكبر',
  },
  {
    key: 'aboutTeam',
    label: 'صورة صفحة «رحلتنا»',
    location: 'صفحة رحلتنا — الصورة العريضة',
    ratio: 'عريضة (2:1) — 1200×600 أو أكبر',
  },
  {
    key: 'creativeSlide1',
    label: 'شريحة 1 — بداية الرحلة',
    location: 'أعلى صفحات «بداية الرحلة»',
    ratio: 'عريضة (16:9) — 1600×900',
  },
  {
    key: 'creativeSlide2',
    label: 'شريحة 2 — بداية الرحلة',
    location: 'أعلى صفحات «بداية الرحلة»',
    ratio: 'عريضة (16:9) — 1600×900',
  },
  {
    key: 'creativeSlide3',
    label: 'شريحة 3 — بداية الرحلة',
    location: 'أعلى صفحات «بداية الرحلة»',
    ratio: 'عريضة (16:9) — 1600×900',
  },
  {
    key: 'enhaLakSlide1',
    label: 'شريحة 1 — إنها لك',
    location: 'أعلى صفحات «إنها لك»',
    ratio: 'عريضة (16:9) — 1600×900',
  },
  {
    key: 'enhaLakSlide2',
    label: 'شريحة 2 — إنها لك',
    location: 'أعلى صفحات «إنها لك»',
    ratio: 'عريضة (16:9) — 1600×900',
  },
  {
    key: 'enhaLakSlide3',
    label: 'شريحة 3 — إنها لك',
    location: 'أعلى صفحات «إنها لك»',
    ratio: 'عريضة (16:9) — 1600×900',
  },
];

export type SiteImages = Partial<Record<SiteImageKey, string>>;
