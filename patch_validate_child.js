const fs = require('fs');

let content = fs.readFileSync('src/actions/bookings.ts', 'utf8');

const validationLogic = 
`  if (participantType === 'child' && childId) {
    const { data: validChild, error: childError } = await supabase
      .from('child_profiles')
      .select('id')
      .eq('user_profile_id', user.id)
      .eq('id', childId)
      .single();
      
    if (childError || !validChild) {
      throw new Error(\`Invalid child ID: \${childId}. It does not belong to the current user.\`);
    }
  }

  // Insert course subscription`;

content = content.replace('  // Insert course subscription', validationLogic);
fs.writeFileSync('src/actions/bookings.ts', content);
