# Market & Basket

A grocery storefront with an animated produce scene, a two-image brush reveal, and a separate catalog editor. React, TypeScript, and Vite produce static files; there is no application server or database.

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
- Floating grocery artwork, pointer depth, fading brush trails, a rotating stamp, moving ribbon, scroll entrances, image parallax, and product hover effects. A pause control and reduced-motion support are built in.
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
| `src/components/HeroExperience.tsx` | Layered animated hero |
| `src/components/BrushReveal.tsx` | Canvas brush interaction |
| `src/redesign.css` | Visual design and motion |
| `docs/client-guide.md` | Everyday editing and publishing instructions |
| `docs/catalog-format.md` | JSON/CSV field and variant reference |
| `docs/launch-notes.md` | Demo details and deployment boundaries |

The temporary brand is **Market & Basket**, with illustrative PKR prices. The WhatsApp number, email, service area, and public domain are deliberately blank. Add the client's real details in Store settings before launch. Bot integration is deferred.
