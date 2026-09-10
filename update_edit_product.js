const fs = require('fs');

const path = 'src/app/dashboard/admin/products/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import { getCurrentUser, getPersonalizedProducts, getPublishers } from '@/data/mock';",
  "import { getCurrentUser, getPersonalizedProducts, getPublishers } from '@/data/mock';\nimport { getPublisherPricingSettings } from '@/data/domains/admin';\nimport { ProductEditFormClient } from '../ProductEditFormClient';"
);

const formRegex = /<form action=\{saveProduct\}([\s\S]*?)<\/form>/m;

content = content.replace(
  "const publishers = await getPublishers();",
  "const publishers = await getPublishers();\n  const pricingSettings = await getPublisherPricingSettings();"
);

content = content.replace(
  formRegex,
  "<ProductEditFormClient product={target} publishers={publishers} pricingSettings={pricingSettings} />"
);

fs.writeFileSync(path, content);
