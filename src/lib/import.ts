import Papa from 'papaparse';
import { productSchema, slugify, validateCatalog } from './catalog';
import type { Catalog, Product, Variant } from '../types';

export const csvFields = ['productId','sku','slug','title','description','price','compareAtPrice','image','imageAlt','category','subcategory','unit','stock','availability','featured','active','tags','variantId','variantLabel','variantImage','externalUrl','variableWeight','gallery'] as const;
export type RawRow = Record<string, string>;
export type ImportReport = { products: Product[]; errors: { row: number; message: string }[]; accepted: number; added: number; updated: number };
export function parseCSV(text: string) { const result = Papa.parse<RawRow>(text, { header: true, skipEmptyLines: 'greedy', transformHeader: h => h.trim().replace(/^\uFEFF/, '') }); if (result.errors.length) throw new Error(`CSV row ${(result.errors[0].row ?? 0) + 2}: ${result.errors[0].message}`); return { rows: result.data, fields: result.meta.fields ?? [] }; }
function bool(value: string | undefined, fallback: boolean) { if (value === undefined || value === '') return fallback; if (/^(true|1|yes)$/i.test(value)) return true; if (/^(false|0|no)$/i.test(value)) return false; throw new Error(`Invalid true/false value: ${value}`); }
function numeric(value: string | undefined, fallback: number | null) { if (value === undefined) return fallback; if (value.trim() === '') return null; const n = Number(value); if (!Number.isFinite(n)) throw new Error(`Invalid number: ${value}`); return n; }
export function importRows(rows: RawRow[], mapping: Record<string, string>, current: Catalog): ImportReport {
  const bySku = new Map<string, { p: Product; v?: Variant }>();
  const byId = new Map(current.products.map(p => [p.id, p]));
  for (const p of current.products) { if (p.variants.length) for (const v of p.variants) bySku.set(v.sku.toLowerCase(), { p, v }); else bySku.set(p.sku.toLowerCase(), { p }); }
  const groups = new Map<string, Product>(); const seen = new Set<string>(); const errors: ImportReport['errors'] = []; let accepted = 0;
  const slugOwners = new Map(current.products.map(p => [p.slug, p.id]));
  const categoryIds = new Map(current.categories.flatMap(c => [[c.id.toLowerCase(), c.id], [c.name.toLowerCase(), c.id]]));
  for (let i = 0; i < rows.length; i++) {
    try {
      const row: RawRow = {}; for (const [field, column] of Object.entries(mapping)) if (column && rows[i][column] !== undefined) row[field] = rows[i][column].trim();
      if (!row.sku) throw new Error('SKU is required.');
      const key = row.sku.toLowerCase(); if (seen.has(key)) throw new Error(`Duplicate SKU in import: ${row.sku}`);
      const match = bySku.get(key); const existing = match?.p;
      if (existing && row.productId && row.productId !== existing.id) throw new Error(`SKU ${row.sku} already belongs to ${existing.id}. Keep its stable product ID.`);
      const id = row.productId || existing?.id || `prod-${slugify(row.sku)}`;
      const base = groups.get(id) || existing || byId.get(id);
      const category = categoryIds.get((row.category ?? base?.category ?? '').toLowerCase()) ?? row.category ?? '';
      const variantId = row.variantId || match?.v?.id || (row.variantLabel ? `var-${slugify(row.sku)}` : '');
      const selected = match?.v ?? base;
      const p: Product = {
        id, sku: row.sku, slug: row.slug || base?.slug || slugify(row.title || row.sku), title: row.title ?? base?.title ?? '',
        description: row.description ?? base?.description ?? '', price: numeric(row.price, selected?.price ?? null) as number,
        compareAtPrice: numeric(row.compareAtPrice, base?.compareAtPrice ?? null), image: row.image ?? base?.image ?? '',
        imageAlt: row.imageAlt ?? base?.imageAlt ?? row.title ?? '', images: row.gallery === undefined ? base?.images ?? [] : row.gallery.split('|').filter(Boolean),
        category, subcategory: row.subcategory ?? base?.subcategory ?? '', unit: row.unit ?? (match?.v?.label || base?.unit) ?? '',
        stock: numeric(row.stock, selected?.stock ?? null), availability: (row.availability || selected?.availability || 'unknown') as Product['availability'],
        featured: bool(row.featured, base?.featured ?? false), active: bool(row.active, base?.active ?? true),
        tags: row.tags === undefined ? base?.tags ?? [] : row.tags.split('|').filter(Boolean), externalUrl: row.externalUrl === undefined ? base?.externalUrl ?? null : row.externalUrl || null,
        variableWeight: bool(row.variableWeight, base?.variableWeight ?? false), variants: [...(base?.variants ?? [])],
      };
      if (variantId) {
        const variantImage = row.variantImage === undefined ? match?.v?.image : row.variantImage;
        const v: Variant = { id: variantId, sku: row.sku, label: row.variantLabel || match?.v?.label || row.unit || '', price: p.price, stock: p.stock, availability: p.availability, ...(variantImage ? { image: variantImage } : {}) };
        const idx = p.variants.findIndex(x => x.id === variantId || x.sku.toLowerCase() === key);
        if (idx >= 0) p.variants[idx] = v; else p.variants.push(v);
      } else if (base?.variants.length) throw new Error('This product has variants. Include variantId or variantLabel for each SKU.');
      const parsed = productSchema.safeParse(p); if (!parsed.success) throw new Error(parsed.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join('; '));
      const c = current.categories.find(c => c.id === category); if (!c) throw new Error(`Unknown category: ${category || '(empty)'}`);
      if (p.subcategory && !c.subcategories.some(s => s.id === p.subcategory)) throw new Error(`Unknown subcategory: ${p.subcategory}`);
      const owner = slugOwners.get(p.slug);
      if (owner && owner !== id) throw new Error(`Product URL ${p.slug} already belongs to another product.`);
      groups.set(id, parsed.data); slugOwners.set(p.slug, id); seen.add(key); accepted++;
    } catch (e) { errors.push({ row: i + 2, message: e instanceof Error ? e.message : 'Invalid row.' }); }
  }
  const products = [...groups.values()];
  return { products, errors, accepted, added: products.filter(p => !byId.has(p.id)).length, updated: products.filter(p => byId.has(p.id)).length };
}
export function mergeImport(current: Catalog, products: Product[], replace = false, imported?: Pick<Catalog, 'categories' | 'collections'>): Catalog {
  const map = new Map((replace ? [] : current.products).map(p => [p.id, p])); products.forEach(p => map.set(p.id, p));
  const result = { ...current, ...(imported ?? {}), updatedAt: new Date().toISOString(), products: [...map.values()] };
  result.collections = result.collections.map(c => ({ ...c, productIds: c.productIds.filter(id => map.has(id)) }));
  return validateCatalog(result);
}
function safeCell(v: string) { return /^[=+@\t\r]/.test(v) ? `'${v}` : v; }
export function exportCSV(products: Product[]) {
  const rows = products.flatMap(p => (p.variants.length ? p.variants : [null]).map(v => ({
    productId: p.id, sku: safeCell(v?.sku ?? p.sku), slug: p.slug, title: safeCell(p.title), description: safeCell(p.description),
    price: v?.price ?? p.price, compareAtPrice: p.compareAtPrice ?? '', image: p.image, imageAlt: safeCell(p.imageAlt),
    category: p.category, subcategory: p.subcategory, unit: v?.label ?? p.unit, stock: (v ? v.stock : p.stock) ?? '',
    availability: v?.availability ?? p.availability, featured: p.featured, active: p.active, tags: p.tags.join('|'),
    variantId: v?.id ?? '', variantLabel: v?.label ?? '', variantImage: v?.image ?? '', externalUrl: p.externalUrl ?? '', variableWeight: p.variableWeight ?? false, gallery: p.images.join('|'),
  })));
  return Papa.unparse(rows, { columns: [...csvFields], newline: '\r\n' });
}
