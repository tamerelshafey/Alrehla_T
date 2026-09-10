const fs = require('fs');

const path = 'src/app/dashboard/student/portfolio/[id]/DocumentEditorClient.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import { PortfolioDocument } from '@/types';",
  "import { PortfolioDocument } from '@/types';\nimport { saveDocumentDraft, submitDocumentForReview } from '@/actions/portfolio';"
);

content = content.replace(
  `  const handleSave = (newStatus: 'draft' | 'submitted') => {
    setIsSaving(true);
    setSaveMessage('');
    // Simulate API call
    setTimeout(() => {
      setStatus(newStatus);
      setIsSaving(false);
      setSaveMessage(newStatus === 'draft' ? 'تم حفظ المسودة بنجاح' : 'تم الإرسال للمدرب للمراجعة');
      setTimeout(() => setSaveMessage(''), 3000);
    }, 1000);
  };`,
  `  const handleSave = async (newStatus: 'draft' | 'submitted') => {
    setIsSaving(true);
    setSaveMessage('');
    if (!initialDocument) return;
    try {
      if (newStatus === 'draft') {
        await saveDocumentDraft(initialDocument.id, content);
      } else {
        await submitDocumentForReview(initialDocument.id, content);
      }
      setStatus(newStatus);
      setSaveMessage(newStatus === 'draft' ? 'تم حفظ المسودة بنجاح' : 'تم الإرسال للمدرب للمراجعة');
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
