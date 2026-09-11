import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key. Make sure to set them in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- Imports from domains ---
import { mockAllUsers } from '../src/data/domains/auth';
import { mockFamilyMembers } from '../src/data/domains/account';
import { 
  mockInstructorPricingOptions,
  mockPricingFormulaSettings,
  mockInstructors,
  mockInstructorCompensationProfiles,
  mockInstructorCertifications,
  mockBookings,
  mockServiceOrders,
  mockCourseSubscriptions,
  mockDocuments,
  mockWritingPackages,
  mockCreativeServices
} from '../src/data/domains/writing';
import { 
  mockProducts, 
  mockPublishers 
} from '../src/data/domains/products';
import { 
  mockInstructorPayouts,
  mockPublisherPayouts,
  mockAllSupportTickets,
  mockJoinRequests,
  mockSupportSessionRequests,
  mockAuditLogs,
  mockPublisherPricingSettings
} from '../src/data/domains/admin';
import { mockOrders } from '../src/data/domains/orders';
import { mockBoxSubscriptions } from '../src/data/domains/subscriptions';
import { mockBlogPosts, mockTestimonials, mockSiteSettings } from '../src/data/domains/content';
import { mockReviews } from '../src/data/mock';

async function seed() {
  console.log('Starting Supabase Seeding...');

  // Helper to run query
  const run = async (table: string, data: any[]) => {
    if (!data || data.length === 0) return;
    console.log(`Seeding ${table} (${data.length} records)...`);
    const { error } = await supabase.from(table).upsert(data);
    if (error) {
      console.error(`Error inserting into ${table}:`, error.message);
    }
  };

  // 1. Profiles
  const profiles = mockAllUsers.map(u => ({
    id: u.id,
    full_name: u.fullName,
    email: u.email,
    role: u.role,
    is_guardian: u.isGuardian || false,
    permissions: u.permissions || [],
    created_at: u.createdAt || new Date().toISOString(),
  }));
  await run('profiles', profiles);

  // 1b. Child Profiles
  const childProfiles = mockFamilyMembers.map((fm, idx) => ({
    id: fm.id || `child-${idx}`,
    guardian_profile_id: fm.parentId || 'usr-7', // fallback
    full_name: fm.name,
    birth_date: new Date(new Date().getFullYear() - (fm.age || 10), 0, 1).toISOString().split('T')[0],
  }));
  await run('child_profiles', childProfiles);

  // 2. Instructor Pricing Options
  const pricingOptions = mockInstructorPricingOptions.map(opt => ({
    id: opt.id,
    label: opt.label,
    base_price_per_session: opt.basePricePerSession,
    is_active: opt.isActive !== false,
  }));
  await run('instructor_pricing_options', pricingOptions);

  // 2b. Pricing formula settings
  const formulaSettings = mockPricingFormulaSettings.map(set => ({
    id: 'default',
    platform_multiplier: set.platformMultiplier,
    fixed_admin_fee: set.fixedAdminFee,
    updated_at: new Date().toISOString(),
  }));
  await run('pricing_formula_settings', formulaSettings);

  // 2c. Instructors
  const instructors = mockInstructors.map(inst => ({
    id: inst.id,
    profile_id: inst.profileId || inst.id,
    display_name: inst.displayName || inst.name,
    bio: inst.bio,
    specialties: inst.specialties || [],
    avatar_url: inst.avatarUrl,
    years_experience: inst.yearsExperience || 0,
    status: inst.status || 'active',
    training_passed: inst.trainingPassed || true,
    work_model: inst.workModel,
    requested_price: inst.requestedPrice,
    approved_price: inst.approvedPrice,
    selected_pricing_option_id: inst.selectedPricingOptionId,
    monthly_hours_committed: inst.monthlyHoursCommitted,
  }));
  await run('instructors', instructors);

  // 2d. Weekly slots (we will skip for now if too complex to parse from weeklySchedule string array, or map directly if needed)
  // 2e. Compensation Profiles
  const compProfiles = mockInstructorCompensationProfiles.map(cp => ({
    id: cp.id,
    instructor_id: cp.instructorId,
    billing_model: cp.billingModel,
    selected_pricing_option_id: cp.selectedPricingOptionId,
    monthly_minimum_hours: cp.monthlyMinimumHours,
    overtime_rate_per_hour: cp.overtimeRatePerHour,
    approval_status: cp.approvalStatus,
    admin_notes: cp.adminNotes,
    reviewed_by_profile_id: cp.reviewedByProfileId,
  }));
  await run('instructor_compensation_profiles', compProfiles);

  // 2f. Certifications
  const certs = mockInstructorCertifications.map(c => ({
    id: c.id,
    instructor_id: c.instructorId,
    training_completed_at: c.trainingCompletedAt,
    training_meeting_link: c.trainingMeetingLink,
    exam_passed: c.examPassed,
    exam_score: c.examScore,
    certified_at: c.certifiedAt,
  }));
  await run('instructor_certifications', certs);

  // 2g. Instructor Payouts
  const instPayouts = mockInstructorPayouts.map(p => ({
    id: p.id,
    instructor_id: p.instructorId,
    period: p.period,
    amount: p.amount,
    status: p.status,
  }));
  await run('instructor_payouts', instPayouts);

  // 3. Publisher Profiles
  const publishers = mockPublishers.map(pub => ({
    id: pub.id,
    profile_id: pub.profileId || pub.id,
    slug: pub.slug,
    name: pub.name,
    logo_url: pub.logoUrl,
    bio: pub.bio,
    status: pub.status || 'active',
  }));
  await run('publisher_profiles', publishers);

  // 3b. Products
  const products = mockProducts.map(p => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    price: p.price,
    electronic_price: p.electronicPrice,
    short_description: p.shortDescription,
    cover_image_url: p.coverImageUrl,
    publisher_id: p.publisherId,
    owner_type: p.ownerType || 'platform',
    features: p.features || [],
  }));
  await run('personalized_products', products);

  // 3c. Publisher Payouts
  const pubPayouts = mockPublisherPayouts.map(p => ({
    id: p.id,
    publisher_id: p.publisherId,
    period: p.period,
    amount: p.amount,
    status: p.status,
  }));
  await run('publisher_payouts', pubPayouts);

  // 4. Creative Writing Packages
  const cwPackages = mockWritingPackages.map(pkg => ({
    id: pkg.id,
    slug: pkg.slug,
    name: pkg.name,
    age_group: pkg.ageGroup || '12_plus',
    price: pkg.price,
    duration_text: pkg.durationText,
    sessions_count: pkg.sessionsCount,
    session_duration: pkg.sessionDuration,
    target_audience: pkg.targetAudience,
    prerequisite_note: pkg.prerequisiteNote,
    short_description: pkg.shortDescription,
    full_description: pkg.fullDescription,
    is_active: pkg.isActive !== false,
  }));
  await run('creative_writing_packages', cwPackages);

  // 4b. Standalone Services
  const services = mockCreativeServices.map(s => ({
    id: s.id,
    name: s.name,
    price: s.price,
    description: s.description,
  }));
  await run('standalone_services', services);

  // 4c. Service Orders
  const serviceOrders = mockServiceOrders.map(so => ({
    id: so.id,
    buyer_profile_id: so.buyerId,
    package_id: so.packageId,
    standalone_service_id: so.standaloneServiceId,
    status: so.status || 'pending',
    amount: so.amount || 0,
    transaction_reference: so.transactionReference,
    created_at: so.createdAt || new Date().toISOString(),
  }));
  await run('service_orders', serviceOrders);

  // 4d. Course Subscriptions
  const courseSubs = mockCourseSubscriptions.map(cs => ({
    id: cs.id,
    package_id: cs.packageId,
    guardian_profile_id: cs.studentId, // simplified
    independent_participant_id: cs.studentId,
    status: cs.status,
    started_at: cs.startedAt || new Date().toISOString(),
  }));
  await run('course_subscriptions', courseSubs);

  // 4e. Bookings
  const bookings = mockBookings.map(b => ({
    id: b.id,
    independent_participant_id: b.studentId,
    package_id: b.packageId,
    instructor_id: b.instructorId,
    course_subscription_id: b.courseSubscriptionId,
    status: b.status,
    scheduled_at: b.scheduledAt,
    created_at: b.createdAt || new Date().toISOString(),
  }));
  await run('bookings', bookings);

  // 5. Orders (and Order Items)
  const orders: any[] = [];
  const orderItems: any[] = [];
  mockOrders.forEach(o => {
    orders.push({
      id: o.id,
      customer_profile_id: o.customerId,
      independent_participant_id: o.customerId,
      total_amount: o.totalAmount,
      status: o.status,
      transaction_reference: o.transactionReference,
      created_at: o.createdAt || new Date().toISOString(),
    });
    o.items?.forEach((item: any) => {
      orderItems.push({
        id: item.id || `item-${o.id}-${item.productId}`,
        order_id: o.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.price,
        customization_data: item.customization || null,
      });
    });
  });
  await run('orders', orders);
  await run('order_items', orderItems);

  // 6. Support Tickets
  const tickets = mockAllSupportTickets.map(t => ({
    id: t.id,
    requester_profile_id: t.userId,
    subject: t.subject,
    category: t.category,
    status: t.status,
    created_at: t.createdAt || new Date().toISOString(),
  }));
  await run('support_tickets', tickets);

  // 7. Box Subscriptions
  const boxPlans = [
    { id: 'plan-1', name: 'باقة 3 شهور', price_total: 1050, price_monthly: 350, duration_months: 3, savings_note: 'وفر 50 ج.م' },
    { id: 'plan-2', name: 'باقة 6 شهور', price_total: 1950, price_monthly: 325, duration_months: 6, savings_note: 'وفر 150 ج.م' },
    { id: 'plan-3', name: 'باقة سنوية', price_total: 3600, price_monthly: 300, duration_months: 12, savings_note: 'وفر 600 ج.م' }
  ];
  await run('box_subscription_plans', boxPlans);

  const boxSubs = mockBoxSubscriptions.map(sub => ({
    id: sub.id,
    customer_profile_id: 'usr-1', // fallback since mock uses strings for name
    plan_id: sub.plan, // mock has plan='باقة 3 شهور' or similar. Better fallback:
    status: sub.status,
    next_shipment_date: sub.nextShipment,
  })).map(sub => ({
    ...sub,
    plan_id: sub.plan_id.includes('6') ? 'plan-2' : sub.plan_id.includes('سنة') ? 'plan-3' : 'plan-1'
  }));
  await run('box_subscriptions', boxSubs);

  // 8. Reviews
  const reviews = mockReviews.map(r => ({
    id: r.id,
    independent_participant_id: r.studentId,
    instructor_id: r.instructorId,
    rating: r.rating,
    comment: r.comment,
    created_at: r.createdAt || new Date().toISOString()
  }));
  await run('reviews', reviews);

  // 9. Other Support and Admin Data
  const supportReqs = mockSupportSessionRequests.map(r => ({
    id: r.id,
    contact_name: r.contactName,
    contact_phone: r.contactPhone,
    message: r.message,
    status: r.status,
    created_at: r.createdAt || new Date().toISOString()
  }));
  await run('support_session_requests', supportReqs);

  const joins = mockJoinRequests.map(r => ({
    id: r.id,
    applicant_name: r.applicantName,
    requested_role: r.requestedRole,
    status: r.status,
    created_at: r.createdAt || new Date().toISOString()
  }));
  await run('join_requests', joins);

  const audits = mockAuditLogs.map(a => ({
    id: a.id,
    actor_profile_id: a.userId === 'system' ? null : a.userId,
    action: a.action,
    entity_type: a.entityType,
    entity_id: a.entityId,
    metadata: a.metadata,
    created_at: a.createdAt || new Date().toISOString()
  }));
  await run('audit_logs', audits);

  // 10. Content
  const posts = mockBlogPosts?.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    cover_image_url: p.coverImage,
    author_name: p.author,
    published_at: p.publishedAt
  })) || [];
  await run('blog_posts', posts);

  const tests = mockTestimonials?.map((t: any) => ({
    id: t.id,
    author_name: t.author,
    author_role: t.role,
    content: t.content
  })) || [];
  await run('testimonials', tests);

  console.log('Seeding finished successfully!');
}

seed().catch(console.error);
