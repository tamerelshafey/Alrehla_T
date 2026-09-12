const fs = require('fs');
let code = fs.readFileSync('src/app/creative-writing/booking/confirm/BookingConfirmClient.tsx', 'utf8');

code = code.replace(
`fetch('/api/family').then(res => res.json()).then(data => setChildren(data || []));`,
`import('@/app/actions/family').then(mod => mod.fetchFamilyMembers()).then(data => setChildren(data || []));`);
fs.writeFileSync('src/app/creative-writing/booking/confirm/BookingConfirmClient.tsx', code);
