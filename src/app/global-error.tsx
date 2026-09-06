'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <h2>عذراً، حدث خطأ فادح.</h2>
          <button onClick={() => reset()}>حاول مرة أخرى</button>
        </div>
      </body>
    </html>
  );
}
