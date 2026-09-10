const fs = require('fs');

const path = 'src/app/dashboard/instructor/students/[id]/portfolio/[docId]/InstructorDocumentClient.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import { PortfolioDocument } from '@/types';",
  "import { PortfolioDocument } from '@/types';\nimport { submitInstructorFeedback } from '@/actions/portfolio';"
);

content = content.replace(
  `  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    // Simulate API call
    setTimeout(() => {
      setStatus('reviewed');
      setIsSaving(false);
      setSaveMessage('تم حفظ الملاحظات بنجاح وإرسالها للمتدرب.');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 1000);
  };`,
  `  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    try {
      await submitInstructorFeedback(document.id, feedback);
      setStatus('reviewed');
      setSaveMessage('تم حفظ الملاحظات بنجاح وإرسالها للمتدرب.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };`
);

fs.writeFileSync(path, content);
