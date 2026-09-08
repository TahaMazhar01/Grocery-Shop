import { z } from 'zod';
import { isHTTPS, isLocalPath } from './settings';
import type { Catalog, CartItem, Product, SearchItem, Variant } from '../types';

const safeImage = z.string().refine(v => v === '' || isHTTPS(v) || isLocalPath(v), 'Use a valid HTTPS image URL or a /images/ path.');
const availability = z.enum(['available', 'unavailable', 'unknown']);
const price = z.number().finite().min(0).max(1_000_000_000);
const stock = z.number().int().min(0).nullable();
const variantSchema = z.object({ id: z.string().min(1), sku: z.string().min(1), label: z.string().min(1), price, stock, availability, image: safeImage.optional() });
export const productSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]+$/, 'Use letters, numbers, dashes, or underscores for the ID.'),
  sku: z.string().min(1).max(100), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1).max(200), description: z.string().max(5000), price,
  compareAtPrice: price.nullable(), image: safeImage, images: z.array(safeImage), imageAlt: z.string(),
  category: z.string().min(1), subcategory: z.string(), unit: z.string().min(1), stock,
  availability, featured: z.boolean(), active: z.boolean(), tags: z.array(z.string()),
  externalUrl: z.string().refine(isHTTPS, 'External links must be valid HTTPS URLs.').nullable(),
  variants: z.array(variantSchema), variableWeight: z.boolean().optional(),
});
export const categorySchema = z.object({ id: z.string().regex(/^[a-z0-9-]+$/), name: z.string().min(1), description: z.string(), image: safeImage, color: z.string().regex(/^#[0-9a-f]{6}$/i), subcategories: z.array(z.object({ id: z.string().regex(/^[a-z0-9-]+$/), name: z.string().min(1) })) });
export const catalogSchema = z.object({ version: z.literal(1), updatedAt: z.string(), products: z.array(productSchema), categories: z.array(categorySchema), collections: z.array(z.object({ id: z.string().min(1), title: z.string().min(1), description: z.string(), productIds: z.array(z.string()) })) });

export function validateCatalog(value: unknown): Catalog {
  const catalog = catalogSchema.parse(value);
  const ids = new Set<string>(), slugs = new Set<string>(), skus = new Set<string>();
  const cats = new Map(catalog.categories.map(c => [c.id, c]));
  if (cats.size !== catalog.categories.length) throw new Error('Category IDs must be unique.');
  for (const c of catalog.categories) if (new Set(c.subcategories.map(s => s.id)).size !== c.subcategories.length) throw new Error(`Duplicate subcategory ID in ${c.name}.`);
  for (const p of catalog.products) {
    if (ids.has(p.id)) throw new Error(`Duplicate product ID: ${p.id}`);
    if (slugs.has(p.slug)) throw new Error(`Duplicate product URL: ${p.slug}`);
    ids.add(p.id); slugs.add(p.slug);
    const cat = cats.get(p.category);
    if (!cat) throw new Error(`${p.title}: unknown category ${p.category}.`);
    if (p.subcategory && !cat.subcategories.some(s => s.id === p.subcategory)) throw new Error(`${p.title}: unknown subcategory ${p.subcategory}.`);
    const options = p.variants.length ? p.variants : [p];
    const variantIds = new Set<string>();
    for (const v of options) {
      if (skus.has(v.sku.toLowerCase())) throw new Error(`Duplicate SKU: ${v.sku}`);
      if (variantIds.has(v.id)) throw new Error(`${p.title}: duplicate variant ID ${v.id}.`);
      skus.add(v.sku.toLowerCase()); variantIds.add(v.id);
    }
    if (p.variants.length) {
      // The first variant is authoritative; parent fields are display conveniences.
      const first = p.variants[0];
      p.sku = first.sku; p.price = first.price; p.unit = first.label; p.stock = first.stock; p.availability = first.availability;
    }
  }
  const collectionIds = new Set<string>();
  for (const c of catalog.collections) {
    if (collectionIds.has(c.id)) throw new Error(`Duplicate collection ID: ${c.id}`);
    collectionIds.add(c.id);
    if (c.productIds.some(id => !ids.has(id))) throw new Error(`Collection ${c.title} references a missing product.`);
  }
  return catalog;
}

export function slugify(s: string) { return s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'product'; }
export function bucketFor(id: string) { let hash = 0; for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) >>> 0; return String(hash % 64).padStart(2, '0'); }
export function canBuy(p: Pick<Product, 'availability' | 'stock'>) { return p.availability !== 'unavailable' && p.stock !== 0; }
export function optionFor(p: Product | SearchItem, variantId?: string | null): Variant | Product | SearchItem | undefined { return p.variants.length ? p.variants.find(v => v.id === variantId) ?? (!variantId ? p.variants[0] : undefined) : variantId ? undefined : p; }
export function lineFor(p: Product | SearchItem, variantId?: string | null, quantity = 1): CartItem | null {
  const v = optionFor(p, variantId); if (!v || !p.active || !canBuy(v)) return null;
  return { productId: p.id, variantId: 'label' in v ? v.id : null, title: p.title, sku: v.sku, unit: 'label' in v ? v.label : v.unit, price: v.price, image: v.image || p.image, quantity: Math.max(1, Math.min(Math.floor(quantity), v.stock ?? 999)) };
}
export function cartKey(item: Pick<CartItem, 'productId' | 'variantId'>) { return `${item.productId}::${item.variantId ?? ''}`; }
export function reconcileCart(cart: CartItem[], products: (Product | SearchItem)[]) {
  const map = new Map(products.map(p => [p.id, p])); const next: CartItem[] = []; const changes: string[] = [];
  for (const old of cart) {
    const p = map.get(old.productId); const fresh = p && lineFor(p, old.variantId, old.quantity);
    if (!fresh) { changes.push(`${old.title} is no longer available and was removed.`); continue; }
    if (fresh.price !== old.price) changes.push(`The price of ${old.title} has been updated.`);
    if (fresh.quantity !== old.quantity) changes.push(`The quantity of ${old.title} was adjusted to available stock.`);
    next.push(fresh);
  }
  return { items: next, changes };
}
export function money(value: number, currency = 'PKR', locale = 'en-PK') { return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: Number.isInteger(value) ? 0 : 2 }).format(value); }
export function cartTotal(cart: CartItem[]) { return Math.round(cart.reduce((n, x) => n + Math.round(x.price * 100) * x.quantity, 0)) / 100; }
export function orderMessage(cart: CartItem[], brand: string, currency: string, notes = '') { return `Hello ${brand}! I'd like to enquire about:\n\n${cart.map((x, i) => `${i + 1}. ${x.title} — ${x.unit}\nSKU: ${x.sku} | Qty: ${x.quantity}\n${money(x.price, currency)} each · ${money(x.price * x.quantity, currency)}`).join('\n\n')}\n\nEstimated subtotal: ${money(cartTotal(cart), currency)}${notes.trim() ? `\n\nNotes: ${notes.trim()}` : ''}\n\nPlease confirm availability, delivery charges, and the final total.`; }
export function whatsappLink(number: string, message: string) { const digits = number.replace(/[\s()+-]/g, ''); return /^[1-9]\d{6,14}$/.test(digits) ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null; }
