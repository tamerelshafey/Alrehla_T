import { mockInstructors } from '../src/data/domains/writing';
import { mockPublishers, mockProducts } from '../src/data/domains/products';

function escapeSql(str: any) {
  if (str == null) return 'NULL';
  if (Array.isArray(str)) {
    return "ARRAY[" + str.map(s => escapeSql(s)).join(',') + "]::text[]";
  }
  return "'" + String(str).replace(/'/g, "''") + "'";
}

let sql = `-- ==========================================\n`;
sql += `-- المرحلة 2: المدربون والناشرون والمنتجات (Instructors & Products)\n`;
sql += `-- ==========================================\n\n`;

sql += `-- 1. Instructors (المدربون)\n`;
if (mockInstructors.length > 0) {
  sql += `INSERT INTO instructors (id, profile_id, display_name, bio, specialties, avatar_url, years_experience, status, training_passed, work_model, requested_price, approved_price, selected_pricing_option_id, monthly_hours_committed) VALUES\n`;
  const instValues = mockInstructors.map(i => 
    `(${escapeSql(i.id)}, ${escapeSql(i.id.replace('inst', 'usr'))}, ${escapeSql(i.name)}, ${escapeSql(i.bio)}, ${escapeSql(i.specialties)}, ${escapeSql(i.avatarUrl)}, ${i.yearsExperience || 0}, ${escapeSql(i.status || 'active')}, ${i.trainingPassed ? 'true' : 'false'}, ${escapeSql(i.workModel)}, ${i.requestedPrice || 'NULL'}, ${i.approvedPrice || 'NULL'}, ${escapeSql(i.selectedPricingOptionId)}, ${i.monthlyHoursCommitted || 'NULL'})`
  );
  sql += instValues.join(',\n') + `\nON CONFLICT (id) DO NOTHING;\n\n`;
}

sql += `-- 2. Publisher Profiles (الناشرون)\n`;
if (mockPublishers.length > 0) {
  sql += `INSERT INTO publisher_profiles (id, profile_id, slug, name, logo_url, bio, status) VALUES\n`;
  const pubValues = mockPublishers.map(p => 
    `(${escapeSql(p.id)}, 'usr-3', ${escapeSql(p.slug)}, ${escapeSql(p.name)}, ${escapeSql(p.logoUrl)}, ${escapeSql(p.bio)}, 'active')`
  );
  sql += pubValues.join(',\n') + `\nON CONFLICT (id) DO NOTHING;\n\n`;
}

sql += `-- 3. Personalized Products (المنتجات)\n`;
if (mockProducts.length > 0) {
  sql += `INSERT INTO personalized_products (id, slug, name, category, price, electronic_price, short_description, cover_image_url, publisher_id, owner_type) VALUES\n`;
  const prodValues = mockProducts.map(p => 
    `(${escapeSql(p.id)}, ${escapeSql(p.slug)}, ${escapeSql(p.name)}, ${escapeSql(p.category)}, ${p.price}, ${p.electronicPrice || 'NULL'}, ${escapeSql(p.shortDescription)}, ${escapeSql(p.coverImageUrl)}, ${escapeSql(p.publisherId)}, ${escapeSql(p.ownerType || 'platform')})`
  );
  sql += prodValues.join(',\n') + `\nON CONFLICT (id) DO NOTHING;\n\n`;
}

console.log(sql);
