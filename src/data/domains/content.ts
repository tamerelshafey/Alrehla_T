import {
  WritingPackage, Instructor, PersonalizedProduct, AddonProduct, SubscriptionTier, 
  Testimonial, CreativeService, BlogPost, UserProfile, Booking, Order, 
  Publisher, InstructorPayout, PublisherPayout, SessionMessage, SessionAttachment, 
  StudyMaterial, InstructorStudent, BoxSubscription, SupportTicket, 
  JoinRequest, SupportSessionRequest, AuditLog, ServiceOrder, CourseSubscription, 
  SupportTicketMessage, FamilyMember, NotificationItem, UserRole,
  PublisherOrder,
  InstructorPricingOption, PricingFormulaSettings, InstructorCompensationProfile, InstructorCertification
} from '@/types';
import { cookies } from 'next/headers';

// Import from auth if needed
import { mockAllUsers, mockCurrentUser } from './auth';

export const mockTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    authorName: 'أم أحمد',
    authorRole: 'ولية أمر',
    content:
      'لم أكن أتخيل أن رؤية ابني لاسمه كبطل للقصة ستغير من حبه للقراءة بهذا الشكل. تجربة رائعة ومختلفة!',
  },
  {
    id: 'test-2',
    authorName: 'د. خالد مصطفى',
    authorRole: 'أخصائي تربوي',
    content:
      'ما تقدمه "الرحلة" في دمج القيم التربوية عبر التخصيص الشخصي يعد نقلة نوعية في أدب الطفل العربي.',
  },
  {
    id: 'test-3',
    authorName: 'سارة',
    authorRole: 'طالبة في دورة الكتابة',
    content:
      'تعلمت كيف أترجم مشاعري إلى كلمات، والأجمل هو الدعم المستمر والمساحة الآمنة للتعبير في دورات بداية الرحلة.',
  },
  {
    id: 'test-4',
    authorName: 'خالد عبد الرحمن',
    authorRole: 'ولي أمر طالب',
    content:
      'أصبح ابني ينتظر موعد الجلسة بشغف. الكتابة تحولت من واجب مدرسي ثقيل إلى مساحة يحبها ويعبر فيها عن نفسه بحرية.',
  },
  {
    id: 'test-5',
    authorName: 'مريم العلي',
    authorRole: 'ولية أمر طالبة',
    content:
      'لم أكن أعرف كيف أساعد ابنتي على تنمية موهبتها. بداية الرحلة وفرت لها المدربة والمنهج والمساحة الآمنة لتكبر موهبتها.',
  },
];

export const mockBlogPosts: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'discover-writing-voice',
    title: 'كيف تساعد طفلك على اكتشاف صوته الكتابي؟',
    excerpt: 'خطوات بسيطة وعملية تبدأ من الاستماع لا من التصحيح.',
    content: `كل طفل يحمل طريقة تعبير خاصة به، لكنها تحتاج مساحة لتظهر. ابدأ بالاستماع لما يحب أن يحكيه شفهيًا قبل أن تطلب منه الكتابة؛ فالقصص التي يرويها بصوته العالي غالبًا ما تكون أقرب أسلوبه الحقيقي. اترك له حرية اختيار الموضوع في البداية، فالحماس للموضوع أهم من الالتزام بقالب معين. لا تصحح كل خطأ إملائي أو نحوي فور ظهوره؛ التركيز الأول على الفكرة والصوت، والتحرير يأتي لاحقًا كخطوة منفصلة. واحتفِ بكل محاولة كاملة، مهما كانت قصيرة، لأن الثقة بالكتابة تُبنى قبل إتقانها.`,
    publishedAt: '2023-10-01T10:00:00Z',
    authorName: 'فريق الرحلة',
  },
  {
    id: 'post-2',
    slug: 'why-children-love-being-heroes',
    title: 'لماذا يحب الأطفال أن يروا أنفسهم أبطالًا في القصة؟',
    excerpt: 'التخصيص ليس رفاهية، بل أداة تربوية حقيقية.',
    content: `حين يرى الطفل اسمه وملامحه داخل قصة مطبوعة، تتغير علاقته بالقراءة من مجرد نشاط إلى تجربة شخصية. هذا الشعور بالحضور داخل الحكاية يعزز تقدير الطفل لذاته، ويجعله أكثر انتباهًا لتفاصيل النص لأنه يخصه هو تحديدًا. كما أن القيم التربوية المطروحة داخل القصة تصل بشكل أعمق حين يعيشها الطفل كبطل للأحداث، لا كمتفرج عليها من الخارج. لهذا تصبح القصة المخصصة أداة فعالة ليس فقط للترفيه، بل لتعزيز السلوكيات والقيم التي يسعى الأهل لغرسها بأسلوب غير مباشر وغير مباشر في فرضه.`,
    publishedAt: '2023-10-15T12:00:00Z',
    authorName: 'فريق الرحلة',
  },
  {
    id: 'post-3',
    slug: '5-simple-ideas-for-writing-at-home',
    title: 'خمس أفكار بسيطة لتشجيع طفلك على الكتابة في المنزل',
    excerpt: 'لا تحتاج إلى أدوات معقدة، فقط عادة صغيرة يومية.',
    content: `أولًا، خصص "دفتر أفكار" يكتب فيه الطفل جملة أو فكرة يومية دون أي شرط بالطول أو الصحة اللغوية. ثانيًا، اطلب منه أحيانًا أن يكتب نهاية بديلة لقصة قرأها بدل النهاية الأصلية. ثالثًا، شجعه على كتابة رسائل قصيرة لأفراد العائلة في المناسبات بدل الاكتفاء بالتهنئة الشفهية. رابعًا، اجعلوا وقت القراءة العائلي فرصة لطرح سؤال: "لو كنت مكان البطل، ماذا كنت ستفعل؟" ثم اتركوه يكتب إجابته. خامسًا، لا تربط الكتابة دائمًا بالواجب المدرسي؛ اجعل جزءًا منها خاصًا باللعب والخيال الحر بلا تقييم.`,
    publishedAt: '2023-11-01T10:00:00Z',
    authorName: 'فريق الرحلة',
  },
];

export const mockSiteSettings = {
  siteName: 'منصة الرحلة',
  contactEmail: 'contact@alrehla.com',
  facebookUrl: 'https://facebook.com/alrehla',
  instagramUrl: 'https://instagram.com/alrehla',
};

export const getSiteSettings = async () => mockSiteSettings;

export const getTestimonials = async (): Promise<Testimonial[]> => {
  return Promise.resolve(mockTestimonials);
};

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  return Promise.resolve(mockBlogPosts);
};

export const getBlogPostBySlug = async (
  slug: string
): Promise<BlogPost | null> => {
  const post = mockBlogPosts.find((p) => p.slug === slug);
  return Promise.resolve(post || null);
};

