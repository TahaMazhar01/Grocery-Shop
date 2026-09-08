import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { exportCSV } from '../src/lib/import';
import { validateCatalog } from '../src/lib/catalog';
const seed = validateCatalog(JSON.parse(await readFile('catalog/catalog.json', 'utf8')));
const products = Array.from({ length: 10000 }, (_, i) => { const base = seed.products[i % seed.products.length]; return { ...base, id: `test-${i}`, sku: `TEST-${i}`, slug: `${base.slug}-${i}`, title: `${base.title} ${i + 1}`, variants: [], featured: i < 8 }; });
const catalog = { ...seed, products, collections: [] };
await mkdir('fixtures', { recursive: true });
await writeFile('fixtures/catalog-10000.json', JSON.stringify(catalog)); await writeFile('fixtures/catalog-10000.csv', exportCSV(products));
console.log('Created 10,000 products in fixtures/catalog-10000.json and .csv. The demo catalog is unchanged.');
