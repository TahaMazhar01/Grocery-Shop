import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { CartItem, CatalogIndex, Category, Collection, Product, SearchItem, StoreConfig } from './types';
import { bucketFor, cartKey, lineFor, reconcileCart } from './lib/catalog';
import { readLocal, writeLocal } from './lib/files';

type Meta = { updatedAt: string; categories: Category[]; collections: Collection[]; count: number };
type Store = { config: StoreConfig; meta: Meta; home: Product[]; getIndex: () => Promise<CatalogIndex>; getProduct: (slug: string) => Promise<Product | undefined>; cart: CartItem[]; add: (p: Product | SearchItem, variantId?: string | null, quantity?: number) => void; setQuantity: (key: string, quantity: number) => void; remove: (key: string) => void; favorites: string[]; toggleFavorite: (id: string) => void; recent: CartItem[]; rememberBasket: () => void; cartOpen: boolean; setCartOpen: (open: boolean) => void; notify: (text: string) => void; format: (n: number) => string; refreshCart: () => Promise<CartItem[]> };
const Context = createContext<Store | null>(null);
export function useStore() { const value = useContext(Context); if (!value) throw new Error('Store is unavailable.'); return value; }
async function json<T>(path: string): Promise<T> { const res = await fetch(path); if (!res.ok) throw new Error('The shelves could not load. Please try again.'); return res.json(); }
function loadCart(key: string) { const raw = readLocal<unknown>(key, []); return Array.isArray(raw) ? raw.filter(x => x && typeof x.productId === 'string' && typeof x.title === 'string' && typeof x.price === 'number' && Number.isFinite(x.price) && Number.isInteger(x.quantity) && x.quantity > 0) as CartItem[] : []; }
export function StoreProvider({ children }: { children: ReactNode }) {
  const [initial, setInitial] = useState<{ config: StoreConfig; meta: Meta; home: Product[] }>(); const [error, setError] = useState('');
  const [cart, setCart] = useState<CartItem[]>(() => loadCart('mb-cart'));
  const [favorites, setFavorites] = useState<string[]>(() => { const raw = readLocal<unknown>('mb-favorites', []); return Array.isArray(raw) ? raw.filter(x => typeof x === 'string') : []; });
  const [recent, setRecent] = useState<CartItem[]>(() => loadCart('mb-recent'));
  const [cartOpen, setCartOpen] = useState(false); const [toast, setToast] = useState(''); const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const indexRef = useRef<Promise<CatalogIndex> | null>(null); const shardRef = useRef(new Map<string, Promise<Product[]>>()); const cartRef = useRef(cart); cartRef.current = cart;
  const notify = useCallback((message: string) => { setToast(message); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 4500); }, []);
  const getIndex = useCallback(() => { if (!indexRef.current) indexRef.current = json<CatalogIndex>('/data/index.json').catch(e => { indexRef.current = null; throw e; }); return indexRef.current; }, []);
  const getProduct = useCallback(async (slug: string) => { const key = bucketFor(slug); if (!shardRef.current.has(key)) shardRef.current.set(key, json<Product[]>(`/data/products/${key}.json`).catch(e => { shardRef.current.delete(key); throw e; })); return (await shardRef.current.get(key)!).find(p => p.slug === slug); }, []);
  useEffect(() => { Promise.all([json<StoreConfig>('/store-config.json'), json<Meta>('/data/meta.json'), json<Product[]>('/data/home.json')]).then(([config, meta, home]) => { setInitial({ config, meta, home }); const root = document.documentElement; root.style.setProperty('--green', config.colors.green); root.style.setProperty('--cream', config.colors.cream); root.style.setProperty('--accent', config.colors.accent); root.style.setProperty('--display-font', `"${config.fonts.display}"`); root.style.setProperty('--body-font', `"${config.fonts.body}"`); }).catch(e => setError(e.message)); }, []);
  useEffect(() => { writeLocal('mb-cart', cart); }, [cart]); useEffect(() => { writeLocal('mb-favorites', favorites); }, [favorites]);
  const refreshCart = useCallback(async () => { const response = await fetch('/data/index.json',{cache:'no-store'}); if(!response.ok)throw new Error('Reconnect to check current prices.'); const data:CatalogIndex = await response.json(); indexRef.current=Promise.resolve(data); const next = reconcileCart(cartRef.current, data.products); setCart(next.items); if (next.changes.length) notify(next.changes.join(' ')); return next.items; }, [notify]);
  useEffect(() => { if (cartRef.current.length) refreshCart().catch(() => notify('Saved basket loaded. Reconnect to check current prices.')); return () => clearTimeout(toastTimer.current); }, [refreshCart, notify]);
  const add = useCallback((p: Product | SearchItem, variantId?: string | null, quantity = 1) => {
    const newLine = lineFor(p, variantId, quantity); if (!newLine) { notify('This option is currently unavailable.'); return; }
    setCart(old => { const found = old.find(x => cartKey(x) === cartKey(newLine)); const combined = lineFor(p, variantId, (found?.quantity ?? 0) + quantity)!; return found ? old.map(x => cartKey(x) === cartKey(newLine) ? combined : x) : [...old, newLine]; }); notify(`${p.title} added to your basket.`);
  }, [notify]);
  const setQuantity = useCallback((key: string, quantity: number) => { if (quantity < 1) { setCart(old => old.filter(x => cartKey(x) !== key)); return; } getIndex().then(data => { setCart(old => old.flatMap(x => { if (cartKey(x) !== key) return [x]; const p = data.products.find(p => p.id === x.productId); const line = p && lineFor(p, x.variantId, Math.min(quantity, 999)); return line ? [line] : []; })); }).catch(e => notify(e.message)); }, [getIndex, notify]);
  if (error) return <main className="initial-screen"><h1>A little shelf trouble.</h1><p>{error}</p><button className="btn" onClick={() => location.reload()}>Try again</button></main>;
  if (!initial) return <main className="initial-screen"><div className="loading-sprout"/><p>Setting out the good things…</p></main>;
  const value: Store = { ...initial, getIndex, getProduct, cart, add, setQuantity, remove: key => setCart(old => old.filter(x => cartKey(x) !== key)), favorites, toggleFavorite: id => setFavorites(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id]), recent, rememberBasket: () => { setRecent(cart); writeLocal('mb-recent', cart); }, cartOpen, setCartOpen, notify, format: n => new Intl.NumberFormat(initial.config.locale, { style: 'currency', currency: initial.config.currency, maximumFractionDigits: Number.isInteger(n) ? 0 : 2 }).format(n), refreshCart };
  return <Context.Provider value={value}>{children}<div className={`toast ${toast ? 'visible' : ''}`} role="status" aria-live="polite">{toast}</div></Context.Provider>;
}
