export type Availability = 'available' | 'unavailable' | 'unknown';
export interface Variant { id: string; sku: string; label: string; price: number; stock: number | null; availability: Availability; image?: string; }
export interface Product {
  id: string; sku: string; slug: string; title: string; description: string;
  price: number; compareAtPrice: number | null; image: string; images: string[]; imageAlt: string;
  category: string; subcategory: string; unit: string; stock: number | null;
  availability: Availability; featured: boolean; active: boolean; tags: string[];
  externalUrl: string | null; variants: Variant[]; variableWeight?: boolean;
}
export interface Category { id: string; name: string; description: string; image: string; color: string; subcategories: { id: string; name: string }[]; }
export interface Collection { id: string; title: string; description: string; productIds: string[]; }
export interface Catalog { version: 1; updatedAt: string; products: Product[]; categories: Category[]; collections: Collection[]; }
export interface SearchItem extends Omit<Product, 'description' | 'images' | 'externalUrl'> { search: string; }
export interface CatalogIndex { updatedAt: string; products: SearchItem[]; categories: Category[]; collections: Collection[]; }
export interface CartItem { productId: string; variantId: string | null; quantity: number; title: string; unit: string; price: number; image: string; sku: string; }
export interface StoreConfig {
  brand: string; tagline: string; currency: string; locale: string; whatsapp: string; email: string;
  serviceArea: string; siteUrl: string; demo: boolean; announcement: string; deliveryNote: string;
  colors: { green: string; cream: string; accent: string }; fonts: { display: string; body: string };
  navigation: { label: string; href: string }[];
  sections: { categories: boolean; featured: boolean; editorial: boolean; collections: boolean; faq: boolean };
  hero: { eyebrow: string; title: string; italicTitle: string; description: string; image: string; revealImage: string; editorialImage?: string; brushFadeMs: number };
}
