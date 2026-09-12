const fs = require('fs');
let code = fs.readFileSync('src/components/enha-lak/PersonalizationWizard.tsx', 'utf8');

code = code.replace(
`  const onSubmit = async (data: WizardFormValues) => {
    // 1. Create family member if new
    let childName = data.newChildName || '';
    if (data.newChildName && data.newChildBirthDate && data.newChildGender && !data.familyMemberId) {
      const newMember = await createFamilyMember(data.newChildName, parseInt(data.newChildBirthDate || '0', 10), data.newChildGender);
      childName = newMember.name;
    } else if (data.familyMemberId) {
       // In real app, we fetch the name. For now let's just use placeholder
       childName = 'مشارك موجود'; 
    }`,
`  const onSubmit = async (data: WizardFormValues) => {
    // 1. Create family member if new
    let childName = data.newChildName || '';
    let finalChildId = data.familyMemberId || '';
    if (data.newChildName && data.newChildBirthDate && data.newChildGender && !data.familyMemberId) {
      const newMember = await createFamilyMember(data.newChildName, parseInt(data.newChildBirthDate || '0', 10), data.newChildGender);
      if (newMember) {
        childName = newMember.name;
        finalChildId = newMember.id;
      }
    } else if (data.familyMemberId) {
       // In real app, we fetch the name. For now let's just use placeholder
       childName = 'مشارك موجود'; 
    }`);
    
code = code.replace(/childId: finalChildId \|\| undefined,/g, "childId: finalChildId || undefined,");

fs.writeFileSync('src/components/enha-lak/PersonalizationWizard.tsx', code);
