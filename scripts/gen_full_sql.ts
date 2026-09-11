import * as fs from 'fs';
import { mockAllUsers } from '../src/data/domains/auth';
import { mockFamilyMembers } from '../src/data/domains/account';
import { mockWritingPackages, mockCreativeServices, mockInstructorPricingOptions, mockPricingFormulaSettings, mockInstructors } from '../src/data/domains/writing';
import { mockProducts, mockPublishers } from '../src/data/domains/products';
import { mockOrders } from '../src/data/domains/orders';
import { mockBoxSubscriptions } from '../src/data/domains/subscriptions';
import { mockAllSupportTickets } from '../src/data/domains/admin';

function escapeSql(str: any): string {
  if (str === null || str === undefined) return 'NULL';
  if (Array.isArray(str)) {
    return "ARRAY[" + str.map(s => escapeSql(s)).join(',') + "]::text[]";
  }
  if (typeof str === 'boolean') return str ? 'true' : 'false';
  if (typeof str === 'number') return str.toString();
  return "'" + String(str).replace(/'/g, "''") + "'";
}

let stage1 = `-- ==========================================\n`;
stage1 += `-- المرحلة 1: الحسابات، الإعدادات، والمدربون والناشرون\n`;
stage1 += `-- ==========================================\n\n`;

stage1 += `INSERT INTO profiles (id, full_name, email, role, is_guardian, created_at) VALUES\n`;
const profiles = mockAllUsers.map(u => 
  `(${escapeSql(u.id)}, ${escapeSql(u.fullName)}, ${escapeSql(u.email)}, ${escapeSql(u.role)}, ${escapeSql(u.isGuardian || false)}, ${escapeSql(u.createdAt)})`
);
profiles.push(`('usr-inst-pending', 'Pending Inst', 'pen@ex.com', 'instructor', false, now())`);
profiles.push(`('usr-inst-training', 'Training Inst', 'trn@ex.com', 'instructor', false, now())`);
profiles.push(`('usr-pub-1', 'Pub 2', 'p2@ex.com', 'publisher', false, now())`);
profiles.push(`('usr-pub-2', 'Pub 3', 'p3@ex.com', 'publisher', false, now())`);
stage1 += profiles.join(',\n') + `\nON CONFLICT (id) DO NOTHING;\n\n`;

stage1 += `INSERT INTO child_profiles (id, guardian_profile_id, full_name, birth_date) VALUES\n`;
const children = mockFamilyMembers.map((fm, i) => 
  `(${escapeSql(fm.id || 'child-'+i)}, 'usr-7', ${escapeSql(fm.name)}, ${escapeSql(new Date(new Date().getFullYear() - (fm.age || 10), 0, 1).toISOString().split('T')[0])})`
);
stage1 += children.join(',\n') + `\nON CONFLICT (id) DO NOTHING;\n\n`;

stage1 += `INSERT INTO instructor_pricing_options (id, label, base_price_per_session, is_active) VALUES\n`;
const pricing = mockInstructorPricingOptions.map(o => 
  `(${escapeSql(o.id)}, ${escapeSql(o.label)}, ${escapeSql(o.basePricePerSession)}, ${escapeSql(o.isActive !== false)})`
);
stage1 += pricing.join(',\n') + `\nON CONFLICT (id) DO NOTHING;\n\n`;

stage1 += `INSERT INTO pricing_formula_settings (id, platform_multiplier, fixed_admin_fee) VALUES\n`;
const formula = mockPricingFormulaSettings.map(f => 
  `('default', ${escapeSql(f.platformMultiplier)}, ${escapeSql(f.fixedAdminFee)})`
);
stage1 += formula.join(',\n') + `\nON CONFLICT (id) DO NOTHING;\n\n`;

stage1 += `INSERT INTO instructors (id, profile_id, display_name, bio, specialties, avatar_url, years_experience, status, training_passed, work_model, requested_price, approved_price, selected_pricing_option_id, monthly_hours_committed) VALUES\n`;
const insts = mockInstructors.map((i, idx) => {
  const pid = idx === 0 ? 'usr-2' : idx === 1 ? 'usr-8' : idx === 2 ? 'usr-inst-pending' : 'usr-inst-training';
  return `(${escapeSql(i.id)}, '${pid}', ${escapeSql(i.name || i.displayName || 'مدرب')}, ${escapeSql(i.bio)}, ${escapeSql(i.specialties)}, ${escapeSql(i.avatarUrl)}, ${escapeSql(i.yearsExperience || 0)}, ${escapeSql(i.status || 'active')}, ${escapeSql(i.trainingPassed || false)}, ${escapeSql(i.workModel)}, ${escapeSql(i.requestedPrice)}, ${escapeSql(i.approvedPrice)}, ${escapeSql(i.selectedPricingOptionId)}, ${escapeSql(i.monthlyHoursCommitted)})`;
});
stage1 += insts.join(',\n') + `\nON CONFLICT (id) DO NOTHING;\n\n`;

stage1 += `INSERT INTO publisher_profiles (id, profile_id, slug, name, logo_url, bio, status) VALUES\n`;
const pubs = mockPublishers.map((p, idx) => {
  let pid = idx === 0 ? 'usr-3' : `usr-pub-${idx}`;
  return `(${escapeSql(p.id)}, '${pid}', ${escapeSql(p.slug)}, ${escapeSql(p.name)}, ${escapeSql(p.logoUrl)}, ${escapeSql(p.bio)}, 'active')`;
});
stage1 += pubs.join(',\n') + `\nON CONFLICT (id) DO NOTHING;\n\n`;

fs.writeFileSync('scripts/out_stage1.sql', stage1);

// Stage 2
let stage2 = `-- ==========================================\n`;
stage2 += `-- المرحلة 2: المنتجات، باقات الكتابة، والخدمات\n`;
stage2 += `-- ==========================================\n\n`;

stage2 += `INSERT INTO personalized_products (id, slug, name, category, price, electronic_price, short_description, cover_image_url, publisher_id, owner_type) VALUES\n`;
const prods = mockProducts.map(p => 
  `(${escapeSql(p.id)}, ${escapeSql(p.slug)}, ${escapeSql(p.name)}, ${escapeSql(p.category)}, ${escapeSql(p.price)}, ${escapeSql(p.electronicPrice)}, ${escapeSql(p.shortDescription)}, ${escapeSql(p.coverImageUrl)}, ${escapeSql(p.publisherId)}, ${escapeSql(p.ownerType || 'platform')})`
);
stage2 += prods.join(',\n') + `\nON CONFLICT (id) DO NOTHING;\n\n`;

stage2 += `INSERT INTO creative_writing_packages (id, slug, name, age_group, price, duration_text, sessions_count, session_duration, target_audience, prerequisite_note, short_description, full_description, is_active) VALUES\n`;
const pkgs = mockWritingPackages.map(p => 
  `(${escapeSql(p.id)}, ${escapeSql(p.slug)}, ${escapeSql(p.name)}, ${escapeSql(p.ageGroup || '12_plus')}, ${escapeSql(p.price)}, ${escapeSql(p.durationText)}, ${escapeSql(p.sessionsCount)}, ${escapeSql(p.sessionDuration)}, ${escapeSql(p.targetAudience)}, ${escapeSql(p.prerequisiteNote)}, ${escapeSql(p.shortDescription)}, ${escapeSql(p.fullDescription)}, ${escapeSql(p.isActive !== false)})`
);
stage2 += pkgs.join(',\n') + `\nON CONFLICT (id) DO NOTHING;\n\n`;

stage2 += `INSERT INTO standalone_services (id, name, price, description) VALUES\n`;
const srvs = mockCreativeServices.map(s => 
  `(${escapeSql(s.id)}, ${escapeSql(s.name)}, ${escapeSql(s.price)}, ${escapeSql(s.description)})`
);
stage2 += srvs.join(',\n') + `\nON CONFLICT (id) DO NOTHING;\n\n`;

fs.writeFileSync('scripts/out_stage2.sql', stage2);

// Stage 3
let stage3 = `-- ==========================================\n`;
stage3 += `-- المرحلة 3: الطلبات، الاشتراكات، والدعم\n`;
stage3 += `-- ==========================================\n\n`;

stage3 += `INSERT INTO orders (id, customer_profile_id, independent_participant_id, total_amount, status, transaction_reference, created_at) VALUES\n`;
const ords = mockOrders.map(o => 
  `(${escapeSql(o.id)}, 'usr-1', 'usr-1', ${escapeSql(o.totalAmount)}, ${escapeSql(o.status)}, ${escapeSql(o.transactionReference)}, ${escapeSql(o.createdAt || new Date().toISOString())})`
);
stage3 += ords.join(',\n') + `\nON CONFLICT (id) DO NOTHING;\n\n`;

stage3 += `INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, customization_data) VALUES\n`;
let oitems: string[] = [];
mockOrders.forEach(o => {
  o.items?.forEach((i: any, idx: number) => {
    oitems.push(`('item-${o.id}-${idx}', ${escapeSql(o.id)}, ${escapeSql(i.productId)}, ${escapeSql(i.quantity)}, ${escapeSql(i.price)}, NULL)`);
  });
});
stage3 += oitems.join(',\n') + `\nON CONFLICT (id) DO NOTHING;\n\n`;

stage3 += `INSERT INTO box_subscription_plans (id, name, price_total, price_monthly, duration_months, savings_note) VALUES\n`;
stage3 += `('plan-1', 'باقة 3 شهور', 1050, 350, 3, 'وفر 50 ج.م'),\n('plan-2', 'باقة 6 شهور', 1950, 325, 6, 'وفر 150 ج.م'),\n('plan-3', 'باقة سنوية', 3600, 300, 12, 'وفر 600 ج.م')\nON CONFLICT (id) DO NOTHING;\n\n`;

stage3 += `INSERT INTO box_subscriptions (id, customer_profile_id, plan_id, status, next_shipment_date) VALUES\n`;
const bsubs = mockBoxSubscriptions.map((s, idx) => 
  `(${escapeSql(s.id)}, 'usr-1', 'plan-1', ${escapeSql(s.status)}, ${escapeSql(s.nextShipment)})`
);
stage3 += bsubs.join(',\n') + `\nON CONFLICT (id) DO NOTHING;\n\n`;

stage3 += `INSERT INTO support_tickets (id, requester_profile_id, subject, category, status, created_at) VALUES\n`;
const tix = mockAllSupportTickets.map(t => 
  `(${escapeSql(t.id)}, 'usr-1', ${escapeSql(t.subject)}, ${escapeSql(t.category)}, ${escapeSql(t.status)}, ${escapeSql(t.createdAt || new Date().toISOString())})`
);
stage3 += tix.join(',\n') + `\nON CONFLICT (id) DO NOTHING;\n\n`;

fs.writeFileSync('scripts/out_stage3.sql', stage3);
