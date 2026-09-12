const fs = require('fs');
const glob = require('glob');

function processFiles(files) {
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace imports and usages of getBookings -> getSessions
    content = content.replace(/getBookings/g, 'getSessions');
    
    // If the file imports or uses Booking, replace with SessionWithDetails
    if (content.includes('Booking') && !file.includes('types/index.ts')) {
      content = content.replace(/Booking\[\]/g, 'SessionWithDetails[]');
      content = content.replace(/Booking\b/g, 'SessionWithDetails');
      content = content.replace(/SessionWithDetailsStatus/g, 'BookingStatus'); // careful!
    }
    
    // Rename variable allBookings to sessions if needed, but not strictly necessary. Let's just leave variables.

    fs.writeFileSync(file, content);
  }
}

const files = glob.sync('src/app/**/*.tsx');
processFiles(files);
