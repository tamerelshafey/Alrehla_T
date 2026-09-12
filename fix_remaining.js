const fs = require('fs');

let wiz = fs.readFileSync('src/components/enha-lak/PersonalizationWizard.tsx', 'utf8');
wiz = wiz.replace(
`      if (data.newChildName && data.newChildBirthDate) {
        const age = Math.floor((new Date().getTime() - new Date(data.newChildBirthDate).getTime()) / 31557600000);
        const newMember = await createFamilyMember(data.newChildName, age, data.newChildGender || 'male');
        finalChildId = newMember.id;
      }`,
`      if (data.newChildName && data.newChildBirthDate) {
        const age = Math.floor((new Date().getTime() - new Date(data.newChildBirthDate).getTime()) / 31557600000);
        const newMember = await createFamilyMember(data.newChildName, age, data.newChildGender || 'male');
        if (newMember) {
          finalChildId = newMember.id;
        }
      }`);
wiz = wiz.replace(/childId: finalChildId,/g, "childId: finalChildId || undefined,");
fs.writeFileSync('src/components/enha-lak/PersonalizationWizard.tsx', wiz);

let ordersTs = fs.readFileSync('src/data/domains/orders.ts', 'utf8');
ordersTs = ordersTs.replace(/dependentParticipantId: 'dep-child-2',/g, "");
ordersTs = ordersTs.replace(/independentParticipantId: 'student-1',/g, "");
ordersTs = ordersTs.replace(/dependentParticipantId: order\.dependent_participant_id \|\| undefined,/g, "");
ordersTs = ordersTs.replace(/independentParticipantId: order\.independent_participant_id \|\| undefined,/g, "");
fs.writeFileSync('src/data/domains/orders.ts', ordersTs);

let writingTs = fs.readFileSync('src/data/domains/writing.ts', 'utf8');
writingTs = writingTs.replace(/guardianProfileId: 'current-user',/g, "userId: 'current-user',\n    participantType: 'child',\n    childId: 'dep-child-1',");
writingTs = writingTs.replace(/dependentParticipantId: 'dep-child-1',/g, "");
writingTs = writingTs.replace(/independentParticipantId: 'student-1',/g, "userId: 'student-1',\n    participantType: 'self',");
writingTs = writingTs.replace(/dependentParticipantId: bkg.dependent_participant_id \|\| undefined,/g, "");
writingTs = writingTs.replace(/independentParticipantId: bkg.independent_participant_id \|\| undefined,/g, "");
fs.writeFileSync('src/data/domains/writing.ts', writingTs);

