# Your catalog, without editing website code

## Open the editor

Start the supplied project with `npm run dev`, then open `http://127.0.0.1:5173/editor/`. The storefront is at the same address without `/editor/`.

The sidebar contains Products, Categories, Collections, Store settings, and Export & publish. The top bar reports whether this browser's draft is saved. A large draft can exceed browser storage; if that happens, the editor displays a warning and keeps the open draft available for export.

## Add and change products

Choose **Add product**, fill in the name, unique SKU, price, unit, and category, and save to draft. A product URL is created once; editing the display name keeps its URL. Use the pencil beside a product to change it. Duplicate creates a separate product with new identifiers. Archive hides it from shoppers after publishing; restore puts it back. Delete downloads a catalog backup first.

For pack sizes, add variants within the product form. Every sellable pack needs its own SKU, label, price, and availability. An empty stock count means unknown; zero means unavailable. Stock is a manually updated snapshot and is not reserved by baskets.

Use table checkboxes for bulk editing. You can select the current 25-item page or all products matching a search. Price changes apply to variants as well as individual products. Moving categories clears old subcategory selections.

## Import a spreadsheet

Choose **Import**, download the example CSV, and use its columns or match your own names. A price-only file can contain just `sku,price` to update existing products. For new products, provide a name, price, selling unit, category, and unique SKU. Use one row per sellable pack. See [catalog-format.md](catalog-format.md) for variants.

After choosing your file, match columns and choose **Preview import**. Review additions, updates, and rejected rows. You can download the full error report, fix the spreadsheet, and try again. Valid rows can be applied while invalid ones are left out.

**Merge** is the default: missing products remain. **Replace** removes products absent from the imported file and requires explicit confirmation; a backup downloads first. Partial CSV updates preserve unlisted pack sizes within a product. To remove a variant, use the product form or a full JSON record.

## Add photos and links

Paste an HTTPS image URL into a product's image field, or use a local path such as `/images/products/apples.webp`. The optional external product link is a separate field.

For many photos, name each file after its SKU, such as `VEG-001.webp`, then choose **Images** and select the files together. The matching report identifies accepted and unmatched files. Names are matched without case sensitivity. Variants can have different photos. PNG, JPG, WebP, AVIF, and GIF files up to 20 MB each are supported; optimized WebP files are preferable for loading speed.

New image bytes remain in the open tab until exported. Download an update pack before closing it. If you reopen a draft with unexported image paths, reselect the missing files; the editor prevents exporting a pack that would omit those images. Previously published images stay in the project and are not duplicated in each update pack.

For the two hero images, use matching transparent square compositions and similar lighting. Local assets avoid cross-origin image restrictions. The hero also works as an ordinary image while the brush initializes. On phones or with reduced motion, use the reveal button.

## Make your draft public

1. In **Export & publish**, download the update pack.
2. Run `npm run publish:prepare -- "path/to/update.zip"` from this project folder.
3. Extract `release/storefront.zip` and upload its contents through your static host's dashboard. Open the public website in a fresh browser and check an edited product and its image.

The helper saves previous catalog/settings files and any replaced images in `catalog/backups/`. Keep your update packs with your business backups. Publishing requires this file step because there is no shared write server.

For a developer-managed Git workflow, the developer can run the same helper, commit the updated source files, and publish the generated public files. Do not give browser code a GitHub token.

## Store settings

Replace the temporary brand, announcement, colours, fonts, hero text, and contact details here. Add the WhatsApp number with country code and digits only, without spaces or a plus sign. Add the confirmed service area and website address. Demo mode must remain on until these are supplied.

The default prices, products, and pictures demonstrate the design. Replace them with the client's actual stock and prices. Images generated for the concept are listed separately from sample photos in the image source documentation.
