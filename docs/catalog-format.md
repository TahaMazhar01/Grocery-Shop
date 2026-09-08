# Catalog format

The published source is `catalog/catalog.json`, containing `version: 1`, `updatedAt`, `categories`, `collections`, and `products`. Catalog Studio produces this structure for you. JSON imports accept the full catalog or an array of full product records using existing categories.

## Product example

```json
{
  "id": "prod-tomatoes",
  "sku": "TOM-500",
  "slug": "vine-tomatoes",
  "title": "Vine tomatoes",
  "description": "For salads, sauces, and a slice of toast.",
  "price": 180,
  "compareAtPrice": null,
  "image": "/images/products/tomatoes.webp",
  "images": [],
  "imageAlt": "Red tomatoes on the vine",
  "category": "vegetables",
  "subcategory": "everyday-vegetables",
  "unit": "500 g",
  "stock": null,
  "availability": "unknown",
  "featured": true,
  "active": true,
  "tags": ["salad", "cooking"],
  "externalUrl": null,
  "variableWeight": true,
  "variants": []
}
```

IDs, URLs, and sellable SKUs must be unique. Keep IDs and URLs stable after publishing. Prices are non-negative numbers in the configured currency. Availability is `available`, `unavailable`, or `unknown`. Stock is a non-negative integer or `null`. `active: false` archives the product. No data field is a live inventory integration.

## CSV mapping

| Column | Meaning |
| --- | --- |
| `productId` | Groups rows into the same product; keep stable |
| `sku` | Unique sellable SKU; required; used to match updates |
| `slug`, `title`, `description` | Product URL and display text |
| `price`, `compareAtPrice` | Current price; optional previous price |
| `category`, `subcategory` | Existing category ID/name and subcategory ID |
| `unit`, `stock`, `availability` | Selling unit, stock snapshot, availability |
| `image`, `imageAlt`, `gallery` | Main image, alt text, pipe-separated gallery paths |
| `featured`, `active`, `variableWeight` | Boolean values: true/false, yes/no, or 1/0 |
| `tags` | Pipe-separated terms, e.g. `salad\|cooking` |
| `variantId`, `variantLabel`, `variantImage` | Pack identity, display label, optional pack-specific photo |
| `externalUrl` | Optional HTTPS product link, separate from the image |

All variants share a productId. Repeat the product-level fields on each row and use different SKUs and variant IDs. Example:

```csv
productId,sku,title,price,category,unit,variantId,variantLabel
prod-tomatoes,TOM-500,Vine tomatoes,180,vegetables,500 g,tom-500,500 g
prod-tomatoes,TOM-1000,Vine tomatoes,360,vegetables,1 kg,tom-1000,1 kg
```

The first variant supplies the product's default displayed SKU, price, unit, stock, and availability. The selected variant is authoritative in the cart. `image` always describes the product; `variantImage` overrides it for one pack.

Unmapped fields preserve existing data when updating a SKU. A mapped empty optional field clears it, except boolean blanks preserve their previous/default value. A blank stock field becomes unknown. New products still require their necessary fields. Merge does not delete absent products or variants. Replace removes absent products; use a full JSON record or the product form to remove a variant.

The build validates category references, subcategory references, collection product IDs, image/link formats, product URLs, IDs, and SKUs before writing public files. External image availability is not guaranteed by URL syntax validation; check the rendered image and use the missing-photo state when necessary.
