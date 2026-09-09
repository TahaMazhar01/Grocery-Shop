# Market & Basket

A grocery storefront with a sunlit photographic hero, subtle camera movement, a shelf of quick-add products, and a separate catalog editor. React, TypeScript, and Vite produce static files; there is no application server or database.

## Run locally

Install Node.js 22.14 or later, then open a terminal in this folder:

```sh
npm ci
npm run dev
```

- Store: http://127.0.0.1:5173/
- Catalog Studio: http://127.0.0.1:5173/editor/

Keep the terminal running while using either page. Open the site through this address, not by double-clicking `index.html`.

## What is included

- 48 demo products, nine categories, subcategories, variants, and three collections.
- A single grocery photograph with gentle camera movement and pointer depth, a moving note, quick-add hero picks, a moving ribbon, scroll entrances, image parallax, and product hover effects. A pause control and reduced-motion support are built in.
- Search, filters, sorting, pagination, stable product URLs, favourites, saved baskets, and useful empty states.
- WhatsApp contact and complete order enquiries with selected SKUs, pack sizes, quantities, notes, and estimated totals. The store confirms availability and final prices in the conversation.
- A local editor with add/edit/duplicate/archive/restore/delete, category and collection management, bulk editing, CSV/JSON imports, column mapping, validation reports, and export packs.
- SKU-based image matching. Uploaded bytes go into the exported ZIP; temporary browser URLs never go into product records.
- A small homepage feed, compact search index, 64 detail shards, and a separate 10,000-product fixture.

## Update products

1. Open Catalog Studio. Add or edit products, or use **Import** for a CSV/JSON file. Start with the supplied CSV template.
2. Review the draft. In **Export & publish**, download an update pack. Export before closing the tab if you selected new images.
3. From the project folder, run:

```sh
npm run publish:prepare -- "path/to/your-update.zip"
```

This validates the pack, backs up the previous source files, imports the changes, builds the site, and creates `release/storefront.zip` and `release/catalog-studio.zip`. It does not deploy anything.

Upload the extracted contents of **storefront.zip** to the root of your static host. Keep **catalog-studio.zip** local. The public package excludes the editor entry page and full editor catalog. For Git-based hosting, commit the changed source catalog, settings, and images, and rebuild the public package in the hosting workflow.

**Saving an editor draft does not change the public website.** Drafts are held in one browser. They are not shared between devices; exports are the durable backup. Existing published image files remain in this project, while update packs include newly selected images.

## Build and check

```sh
npm test
npm run fixture
npm run test:e2e
npm run publish:prepare
```

Browser tests use Microsoft Edge by default and start the preview automatically. Set `PLAYWRIGHT_CHANNEL=chrome` for an installed Chrome browser. For a fresh Playwright environment, install the selected browser with Playwright first. The fixture stays outside the visible catalog. Generated builds, test outputs, and fixtures are ignored by Git.

`npm run build` creates `dist/` for development previews, including the editor. Use the separate public ZIP for customer hosting. Serve at a domain root or configure a custom domain; the current absolute routes are not configured for a GitHub Pages `/Grocery-Shop/` subpath.

## Files you will use

| File | Purpose |
| --- | --- |
| `catalog/catalog.json` | Source products, categories, collections |
| `public/store-config.json` | Brand, colours, typography, hero, navigation, contact and delivery settings |
| `public/images/` | Included artwork and product photos |
| `public/data/` | Generated storefront feeds and editor template |
| `src/editor/` | Catalog Studio |
| `src/components/HeroExperience.tsx` | Single-scene hero and quick-add picks |
| `src/daily-hero.css` | Hero composition, motion, and responsive styling |
| `src/campaign.css` | Forest/citrus campaign styling and rich image treatments |
| `src/redesign.css` | Shared motion and responsive foundation |
| `docs/client-guide.md` | Everyday editing and publishing instructions |
| `docs/catalog-format.md` | JSON/CSV field and variant reference |
| `docs/launch-notes.md` | Demo details and deployment boundaries |

The temporary brand is **Market & Basket**, with illustrative PKR prices. WhatsApp contact and order enquiries use **+1 (737) 307-5495**. Email, service area, and public domain still need the client's confirmed details before launch. Bot integration is deferred.

## Client product-listing files

Send the files in `outputs/client-listing-01a08159/` to the client. `Product-listing.xlsx` has a blank Products table, examples, category dropdowns, and a Help sheet. `current-products.csv` and `current-products.json` contain the complete current demo catalog. The pack also includes a blank CSV and short import examples.

The editor accepts CSV and JSON. Save the Products sheet as **CSV UTF-8** before importing it. Use Merge to update existing SKUs without removing omitted products. `START-HERE.txt` explains photos, pack sizes, hiding products, and publishing.
