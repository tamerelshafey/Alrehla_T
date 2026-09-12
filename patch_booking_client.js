const fs = require('fs');
let code = fs.readFileSync('src/app/creative-writing/booking/confirm/BookingConfirmClient.tsx', 'utf8');

if (!code.includes('participantType')) {
  // We need to add UI for selecting the participant. Since the prompt says "Preserve existing visual design... wherever possible", we'll just add a simple selector.
  code = code.replace(
`  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'instapay'>('credit_card');`,
`  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'instapay'>('credit_card');
  const [participantType, setParticipantType] = useState<'self' | 'child'>('self');
  const [childId, setChildId] = useState<string>('');
  const [children, setChildren] = useState<{id:string, name:string}[]>([]);

  React.useEffect(() => {
    fetch('/api/family').then(res => res.json()).then(data => setChildren(data || []));
  }, []);
`);
  // Add participant selector UI
  code = code.replace(
`        <h2 className="mb-4 text-3xl font-black text-slate-800">
          {paymentMethod === 'instapay' ? 'بانتظار تأكيد الدفع' : 'تم تأكيد الحجز بنجاح!'}
        </h2>`,
`        <h2 className="mb-4 text-3xl font-black text-slate-800">
          {paymentMethod === 'instapay' ? 'بانتظار تأكيد الدفع' : 'تم تأكيد الحجز بنجاح!'}
        </h2>`);

  // Update form submit
  code = code.replace(
`const orderId = await createDummyBookingServiceOrder(250, packageId, instructorId);`,
`if (participantType === 'child' && !childId) { alert('الرجاء اختيار الطفل'); return; }
const orderId = await createDummyBookingServiceOrder(250, packageId, instructorId, participantType, childId);`);

  // Add the UI to the form:
  code = code.replace(
`          <div className="space-y-4">
            <label className="flex cursor-pointer items-center justify-between rounded-xl border-2 border-emerald-500 bg-emerald-50 p-4">`,
`          <div className="space-y-6">
            <div>
              <h3 className="mb-3 font-bold text-slate-800">المشارك في البرنامج</h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={participantType === 'self'} onChange={() => setParticipantType('self')} />
                  <span>لنفسي</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={participantType === 'child'} onChange={() => setParticipantType('child')} />
                  <span>لطفلي</span>
                </label>
              </div>
              {participantType === 'child' && (
                <select className="mt-2 w-full p-2 border rounded" value={childId} onChange={e => setChildId(e.target.value)}>
                  <option value="">اختر طفلاً...</option>
                  {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <label className="flex cursor-pointer items-center justify-between rounded-xl border-2 border-emerald-500 bg-emerald-50 p-4">`);

  fs.writeFileSync('src/app/creative-writing/booking/confirm/BookingConfirmClient.tsx', code);
}
