import { mockAllUsers } from '../src/data/domains/auth';
import { mockFamilyMembers } from '../src/data/domains/account';
import { mockInstructorPricingOptions, mockPricingFormulaSettings } from '../src/data/domains/writing';

function escapeSql(str: any) {
  if (str == null) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

let sql = `-- ==========================================\n`;
sql += `-- المرحلة 1: الهويات الأساسية والإعدادات (Profiles & Settings)\n`;
sql += `-- ==========================================\n\n`;

sql += `-- 1. Profiles (المستخدمين)\n`;
sql += `INSERT INTO profiles (id, full_name, email, role, is_guardian, created_at) VALUES\n`;
const profileValues = mockAllUsers.map(u => 
  `(${escapeSql(u.id)}, ${escapeSql(u.fullName)}, ${escapeSql(u.email)}, ${escapeSql(u.role)}, ${u.isGuardian ? 'true' : 'false'}, ${escapeSql(u.createdAt)})`
);
sql += profileValues.join(',\n') + `\nON CONFLICT (id) DO NOTHING;\n\n`;

sql += `-- 2. Child Profiles (الأطفال)\n`;
sql += `INSERT INTO child_profiles (id, guardian_profile_id, full_name, birth_date) VALUES\n`;
const childValues = mockFamilyMembers.map((fm, idx) => 
  `(${escapeSql(fm.id || 'child-'+idx)}, 'usr-7', ${escapeSql(fm.name)}, ${escapeSql(new Date(new Date().getFullYear() - (fm.age || 10), 0, 1).toISOString().split('T')[0])})`
);
sql += childValues.join(',\n') + `\nON CONFLICT (id) DO NOTHING;\n\n`;

sql += `-- 3. Instructor Pricing Options\n`;
if (mockInstructorPricingOptions.length > 0) {
  sql += `INSERT INTO instructor_pricing_options (id, label, base_price_per_session, is_active) VALUES\n`;
  const pricingOptValues = mockInstructorPricingOptions.map(o => 
    `(${escapeSql(o.id)}, ${escapeSql(o.label)}, ${o.basePricePerSession}, ${o.isActive !== false ? 'true' : 'false'})`
  );
  sql += pricingOptValues.join(',\n') + `\nON CONFLICT (id) DO NOTHING;\n\n`;
}

sql += `-- 4. Pricing Formula Settings\n`;
if (mockPricingFormulaSettings.length > 0) {
  sql += `INSERT INTO pricing_formula_settings (id, platform_multiplier, fixed_admin_fee) VALUES\n`;
  const formulaValues = mockPricingFormulaSettings.map(f => 
    `('default', ${f.platformMultiplier}, ${f.fixedAdminFee})`
  );
  sql += formulaValues.join(',\n') + `\nON CONFLICT (id) DO NOTHING;\n\n`;
}

console.log(sql);
