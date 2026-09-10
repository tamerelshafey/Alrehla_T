const fs = require('fs');

const path = 'src/app/dashboard/admin/finance/publisher-payouts/[id]/AdminPublisherPayoutClient.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import { PublisherPayout, Publisher } from '@/types';",
  "import { PublisherPayout, Publisher } from '@/types';\nimport { markPublisherPayoutAsPaid } from '@/actions/finance';"
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
      await markPublisherPayoutAsPaid(payout.id, payout.publisherId);
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
