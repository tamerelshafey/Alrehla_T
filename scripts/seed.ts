import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const mockWritingPackages: any[] = [
  {
    slug: 'golden-words',
    name: 'الكلمات الذهبية',
    age_group: 'under_12',
    price: 2990,
    duration_text: '3 أشهر',
    sessions_count: 12,
    session_duration: '40 دقيقة',
    target_audience: 'تناسب الطفل الذي يخوض تجربة منظمة أولى مع الكتابة، أو يريد اكتشاف علاقته بها في مساحة فردية دافئة وخفيفة، دون الحاجة إلى خبرة سابقة.',
    prerequisite_note: 'مستقلة بذاتها (يمكن الانتقال بعدها إلى السطور السحرية لكنها ليست شرطًا لها)',
    short_description: 'رحلة استكشافية قصيرة للمبتدئين.',
    full_description: 'دورة تركز على اكتشاف الكتابة كمساحة للتعبير...',
    is_active: true,
  },
  {
    slug: 'magic-lines',
    name: 'السطور السحرية',
    age_group: 'under_12',
    price: 5990,
    duration_text: '6 أشهر',
    sessions_count: 24,
    target_audience: 'تناسب الطفل الذي يريد مساحة أطول للكتابة والتجريب، ويرغب في توسيع أدواته واكتشاف أنواع متعددة من الكتابة والعمل على مشروع كتابي خاص يمتد عبر فترة أطول.',
    prerequisite_note: 'لا تشترط إتمام الكلمات الذهبية مسبقًا',
    short_description: 'رحلة أطول لتوسيع أدوات الكتابة وبناء مشروع.',
    full_description: 'دورة لتوسيع مهارات الكتابة وبناء مشروع شخصي...',
    is_active: true,
  },
  {
    slug: 'first-spark',
    name: 'الشرارة الأولى',
    age_group: '12_plus',
    price: 2990,
    duration_text: '3 أشهر',
    sessions_count: 12,
    session_duration: '40 دقيقة',
    target_audience: 'تناسب اليافع أو الشاب أو الكبير الذي يريد أن يبدأ ممارسة الكتابة، أو يكتشف علاقته بها، أو يحوّل أفكاره الأولى إلى نصوص فعلية، دون الحاجة إلى الاشتراك في مسار طويل.',
    prerequisite_note: 'مستقلة بذاتها',
    short_description: 'رحلة قصيرة لتحويل الأفكار إلى نصوص.',
    full_description: 'الخطوة الأولى في عالم الكتابة والتعبير...',
    is_active: true,
  },
  {
    slug: 'crafting-impact',
    name: 'صياغة الأثر',
    age_group: '12_plus',
    price: 5990,
    duration_text: '6 أشهر',
    sessions_count: 24,
    target_audience: 'تناسب من يريد أن يمنح الكتابة وقتًا أطول، ويعمّق أدواته، ويجرب أكبر من نوع أدبي، ثم ينتقل إلى بناء مشروع كتابي خاص به.',
    prerequisite_note: 'مستقلة بذاتها، ويمكن الاشتراك فيها مباشرة',
    short_description: 'مسار متعمق لتجربة أنواع أدبية مختلفة.',
    full_description: 'برنامج متكامل يعمق أدوات الكاتب ويوسع مداركه...',
    is_active: true,
  },
  {
    slug: 'story-maker',
    name: 'صانع الحكاية',
    age_group: '12_plus',
    price: 11990,
    duration_text: '6 أشهر',
    sessions_count: 24,
    target_audience: 'تناسب المشارك الذي أتم «صياغة الأثر» وأصبح لديه أساس كتابي ومشروع يمكن تطويره، ويريد التعمق في بناء الحكاية والعمل على مشروع أدبي أكبر امتدادًا.',
    prerequisite_note: 'يشترط إتمام رحلة صياغة الأثر أولًا',
    short_description: 'رحلة لبناء وتطوير مشروع أدبي متكامل.',
    full_description: 'التعمق في بناء الحكاية والشخصيات وتطوير مشروع أدبي متماسك...',
    is_active: true,
  },
  {
    slug: 'journey-to-story',
    name: 'رحلتي نحو الحكاية',
    age_group: '12_plus',
    price: 19190,
    duration_text: '12 شهر (البرنامج الكامل)',
    sessions_count: 48,
    target_audience: 'تناسب من يريد خوض مسار سنوي واحد متصل بدلًا من رحلتين منفصلتين، ويبحث عن تجربة متصلة تمنحه الوقت للانتقال من التأسيس والتجريب إلى بناء المشروع ثم صقله وتطوير ملف أعماله.',
    prerequisite_note: 'لا تشترط إتمام أي رحلة سابقة، لأنها تحتوي المسار الكامل داخل تجربة سنوية واحدة',
    short_description: 'المسار الكامل من التجريب إلى صقل مشروع التخرج.',
    full_description: 'برنامج سنوي شامل ينتقل بالكاتب من نقطة البداية وحتى إنهاء مشروعه...',
    is_active: true,
  }
];

const mockProducts = [
  {
    owner_type: 'platform',
    slug: 'custom-story-book',
    name: 'القصة المخصصة',
    category: 'custom',
    price: 19500,
    electronic_price: 11970,
    short_description: 'قصة فريدة بطلها طفلك، باسمه وصورته وهواياته.',
    cover_image_url: 'https://picsum.photos/seed/custom1/600/800',
    features: ['تخصيص كامل', 'قصه هو بطلها', 'اختيار الهدف التربوي', 'رسومات احترافية'],
  },
  {
    owner_type: 'platform',
    slug: 'emotional-story',
    name: 'القصة الشعورية',
    category: 'custom',
    price: 21000,
    electronic_price: 13500,
    short_description: 'قصة مخصصة لمساعدة طفلك على فهم مشاعره والتعبير عنها.',
    cover_image_url: 'https://picsum.photos/seed/custom2/600/800',
    features: ['تنمية الذكاء العاطفي', 'سيناريو تفاعلي', 'مخصص حسب حالة الطفل'],
  },
  {
    owner_type: 'platform',
    slug: 'deep-sea-adventures',
    name: 'اعماق البحار',
    category: 'custom',
    price: 6000,
    electronic_price: 600,
    short_description: 'مغامرات شيقة بطلها طفلك في أعماق البحار المحيطات.',
    cover_image_url: 'https://picsum.photos/seed/custom3/600/800',
    features: ['مغامرة خيالية', 'حقائق علمية مبسطة', 'تخصيص المظهر'],
  }
];

async function seed() {
  console.log("Seeding creative_writing_packages...");
  for (const pkg of mockWritingPackages) {
    const { data: existing } = await supabase.from('creative_writing_packages').select('id').eq('slug', pkg.slug).single();
    if (existing) {
      const { error } = await supabase.from('creative_writing_packages').update(pkg).eq('id', existing.id);
      if (error) console.error(`Failed to update package ${pkg.slug}:`, error);
      else console.log(`Updated package: ${pkg.slug}`);
    } else {
      const { error } = await supabase.from('creative_writing_packages').insert(pkg);
      if (error) console.error(`Failed to insert package ${pkg.slug}:`, error);
      else console.log(`Inserted package: ${pkg.slug}`);
    }
  }

  // Link prerequisite for 'story-maker' -> 'crafting-impact'
  const { data: craftingImpact } = await supabase
    .from('creative_writing_packages')
    .select('id')
    .eq('slug', 'crafting-impact')
    .single();

  if (craftingImpact) {
    const { error } = await supabase
      .from('creative_writing_packages')
      .update({ prerequisite_package_id: craftingImpact.id })
      .eq('slug', 'story-maker');
    
    if (error) {
      console.error("Failed to link prerequisite for 'story-maker':", error);
    } else {
      console.log("Linked prerequisite for 'story-maker'.");
    }
  }

  console.log("Seeding personalized_products...");
  for (const prod of mockProducts) {
    const { data: existing } = await supabase.from('personalized_products').select('id').eq('slug', prod.slug).single();
    if (existing) {
      const { error } = await supabase.from('personalized_products').update(prod).eq('id', existing.id);
      if (error) console.error(`Failed to update product ${prod.slug}:`, error);
      else console.log(`Updated product: ${prod.slug}`);
    } else {
      const { error } = await supabase.from('personalized_products').insert(prod);
      if (error) console.error(`Failed to insert product ${prod.slug}:`, error);
      else console.log(`Inserted product: ${prod.slug}`);
    }
  }
}

seed().then(() => {
  console.log("Seeding complete.");
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
