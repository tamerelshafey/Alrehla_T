const fs = require('fs');

const path = 'src/app/dashboard/admin/finance/instructor-payouts/[id]/AdminPayoutClient.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import { InstructorPayout, Instructor } from '@/types';",
  "import { InstructorPayout, Instructor } from '@/types';\nimport { markInstructorPayoutAsPaid } from '@/actions/finance';"
);

content = content.replace(
  `  const handleMarkAsPaid = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setStatus('paid');
      setIsProcessing(false);
    }, 1500);
  };`,
  `  const handleMarkAsPaid = async () => {
    setIsProcessing(true);
    try {
      await markInstructorPayoutAsPaid(payout.id, payout.instructorId);
      setStatus('paid');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ');
    } finally {
      setIsProcessing(false);
    }
  };`
);

fs.writeFileSync(path, content);
