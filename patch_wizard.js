const fs = require('fs');
let code = fs.readFileSync('src/components/enha-lak/PersonalizationWizard.tsx', 'utf8');

code = code.replace(
`      customizationData: {
        childName,
        childPhotoFile: data.facePhotoFile ? data.facePhotoFile.name : undefined,
        heroDescription: data.heroDescription,
        storyGoal: data.storyGoal,
        familyMemberNames: data.familyMemberNames,
        selectedAddonIds: data.selectedAddonIds,
      }`,
`      customizationData: {
        recipientType: 'child',
        childId: finalChildId,
        childName,
        childPhotoFile: data.facePhotoFile ? data.facePhotoFile.name : undefined,
        heroDescription: data.heroDescription,
        storyGoal: data.storyGoal,
        familyMemberNames: data.familyMemberNames,
        selectedAddonIds: data.selectedAddonIds,
      }`);
fs.writeFileSync('src/components/enha-lak/PersonalizationWizard.tsx', code);
