# Revision verification — 10 September 2026

- TypeScript compilation and production build passed. The build generated 89 static entry pages and rebuilt the separate storefront and Catalog Studio ZIPs.
- All 12 catalog unit tests passed, including variant handling, settings validation, and the 10,000-record import fixture.
- Four affected browser flows passed: the new hero's animation/pause/reduced-motion behavior and quick-add basket action; the configured WhatsApp number; mobile navigation/filters; and catalog categories/collections/settings/bulk editing.
- WhatsApp contact and basket enquiries were intercepted in the browser and verified to target `17373075495`. No message was sent, and the basket remained intact.
- The homepage has one hero photograph and no canvas, brush control, or second-image reveal. Old reveal settings and the brush component were removed.
- Visual inspection at 1440 px desktop and 390 px mobile found no browser errors, broken image requests, or horizontal overflow. Camera movement, pause behavior, and product hover transformations changed as expected.
- The client workbook was rendered and inspected. The saved XLSX contains three sheets, a blank 1,000-row Products table, frozen headers and identifying columns, five native validation rules, and numeric example prices.
- The example CSV imported four rows into three existing products. The complete CSV imported 54 rows into 48 existing products. Both retained pack sizes, default SKUs and prices, with no duplicate products. The blank CSV and full JSON catalog also validated.

The Excel workbook is a file for client data entry. Catalog Studio imports CSV and JSON; save the Products sheet as CSV UTF-8 for import. Draft changes still require export, build, and publication.

The active hero asset is `public/images/hero-everyday-market.webp` (approximately 198 KiB). The separate editorial section retains its meal photograph. Confirmed service area, email, domain, and remaining client product photos are still required before a public launch.
