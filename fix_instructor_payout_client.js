const fs = require('fs');

const path = 'src/app/dashboard/instructor/payouts/InstructorPayoutsClient.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import { InstructorPayout } from '@/types';",
  "import { InstructorPayout } from '@/types';\nimport { submitWithdrawalRequest } from '@/actions/finance';"
);

content = content.replace(
  `  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('تم تقديم طلب السحب للمراجعة.');
    setShowWithdrawForm(false);
  };`,
  `  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Use the first payout's instructorId as the actor ID
      const instructorId = payouts[0]?.instructorId || 'unknown';
      await submitWithdrawalRequest(instructorId, pendingAmount, withdrawMethod);
      alert('تم تقديم طلب السحب للمراجعة بنجاح.');
      setShowWithdrawForm(false);
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء تقديم الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };`
);

content = content.replace(
  `              <button 
                type="submit"
                className="rounded-xl bg-slate-900 px-8 py-3 font-bold text-white hover:bg-slate-800"
              >
                تأكيد طلب السحب
              </button>`,
  `              <button 
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-slate-900 px-8 py-3 font-bold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {isSubmitting ? 'جاري التقديم...' : 'تأكيد طلب السحب'}
              </button>`
);

fs.writeFileSync(path, content);
