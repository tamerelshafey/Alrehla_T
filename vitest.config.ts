import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * إعداد الاختبارات.
 *
 * الاختصار `@/` معرَّف هنا بالإيد بدل حزمة تقرأه من tsconfig — الحزمة دي
 * ESM والمشروع CJS، والتوفيق بينهم بيضيف تعقيدًا أكتر من اللي بيوفره.
 * لو الاختصار اتغيّر في tsconfig.json يومًا، لازم يتغيّر هنا كمان.
 *
 * الاختبارات جنب الكود في `src/**\/*.test.ts` عن قصد: الاختبار البعيد
 * عن الملف اللي بيختبره بيتنسى.
 */
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
