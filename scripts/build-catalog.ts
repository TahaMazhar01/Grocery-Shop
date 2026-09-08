import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { bucketFor, validateCatalog } from '../src/lib/catalog';
import { exportCSV } from '../src/lib/import';
import { validateSettings } from '../src/lib/settings';
validateSettings(JSON.parse(await readFile('public/store-config.json','utf8')));
const source = process.env.CATALOG_SOURCE || 'catalog/catalog.json';
const catalog = validateCatalog(JSON.parse(await readFile(source, 'utf8')));
await mkdir('public/data/products', { recursive: true });
const active = catalog.products.filter(p => p.active);
const buckets = new Map<string, typeof active>();
for (let i = 0; i < 64; i++) buckets.set(String(i).padStart(2, '0'), []);
for (const p of active) buckets.get(bucketFor(p.slug))!.push(p);
await Promise.all([...buckets].map(([key, products]) => writeFile(`public/data/products/${key}.json`, JSON.stringify(products))));
const index = active.map(({ description, images, externalUrl, ...p }) => ({ ...p, search: `${p.title} ${p.sku} ${p.variants.map(v => v.sku).join(' ')} ${p.category} ${p.tags.join(' ')}`.toLowerCase() }));
await Promise.all([
  writeFile('public/data/index.json', JSON.stringify({ updatedAt: catalog.updatedAt, products: index, categories: catalog.categories, collections: catalog.collections })),
  writeFile('public/data/meta.json', JSON.stringify({ updatedAt: catalog.updatedAt, categories: catalog.categories, collections: catalog.collections, count: active.length })),
  writeFile('public/data/home.json', JSON.stringify(active.filter(p => p.featured).slice(0, 8))),
  writeFile('public/data/catalog.json', JSON.stringify(catalog)),
  writeFile('public/data/catalog-template.csv', exportCSV(catalog.products.slice(0, 4))),
]);
console.log(`Catalog ready: ${active.length} active products, 64 detail shards. Source: ${source}`);
