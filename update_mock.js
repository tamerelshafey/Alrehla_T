const fs = require('fs');

let content = fs.readFileSync('src/data/mock.ts', 'utf8');

// Ensure Publisher is imported
if (!content.includes('Publisher,')) {
  content = content.replace('PersonalizedProduct,', 'PersonalizedProduct,\n  Publisher,');
}

// Add publishers if not exist
if (!content.includes('export const mockPublishers')) {
  const publishersCode = `
export const mockPublishers: Publisher[] = [
  {
    id: 'pub-1',
    slug: 'dar-alhekaya',
    name: 'دار الحكاية الصغيرة',
    logoUrl: 'https://picsum.photos/seed/pub1/200/200',
    bio: 'دار متخصصة في نشر القصص التعليمية والتربوية للأطفال لبناء جيل واعٍ ومبدع.',
    isSample: true
  },
  {
    id: 'pub-2',
    slug: 'khayal-akhdar',
    name: 'ناشر الخيال الأخضر',
    logoUrl: 'https://picsum.photos/seed/pub2/200/200',
    bio: 'ناشر رائد في كتب المغامرات والموسوعات العلمية المبسطة لتشجيع الخيال والابتكار.',
    isSample: true
  }
];

export const getPublishers = async (): Promise<Publisher[]> => mockPublishers;

export const getPublisherBySlug = async (slug: string): Promise<Publisher | null> => {
  return mockPublishers.find(p => p.slug === slug) || null;
};

export const getProductBySlug = async (slug: string): Promise<PersonalizedProduct | null> => {
  const product = mockProducts.find(p => p.slug === slug);
  if (product && !product.publisherId) {
    return product;
  }
  return null;
};
`;
  content = content + publishersCode;
}

// Update products to have publisherId
content = content.replace("id: 'prod-lib-1',", "id: 'prod-lib-1',\n    publisherId: 'pub-1',");
content = content.replace("id: 'prod-lib-2',", "id: 'prod-lib-2',\n    publisherId: 'pub-2',");
content = content.replace("id: 'prod-lib-3',", "id: 'prod-lib-3',\n    publisherId: 'pub-1',");
content = content.replace("id: 'prod-lib-4',", "id: 'prod-lib-4',\n    publisherId: 'pub-2',"); // Assuming prod-lib-4 exists

fs.writeFileSync('src/data/mock.ts', content, 'utf8');
console.log('Mock updated.');
