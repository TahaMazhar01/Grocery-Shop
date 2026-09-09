# Revision verification — 9 September 2026

- TypeScript compilation and production build passed. The build generated 89 static entry pages and separate storefront / Catalog Studio ZIPs.
- All 12 catalog unit tests passed, including variant image round trips, malformed links, price/stock handling, and 10,000-record import and reimport.
- The 11 shopping and editor browser checks passed. These cover filters, product URLs, favourites, variants, saved baskets, refreshed prices, intercepted WhatsApp enquiries, mobile navigation, reduced motion, missing images, editing, imports, image export packs, categories, collections, and settings.
- The separate hero browser check passed: a real pointer movement changed the canvas pixels, and both reveal-toggle states worked. Trace recording is disabled for this time-sensitive canvas check; other browser checks retain failure traces.
- A 10,000-row browser CSV import completed in approximately 5.8 seconds on the test machine. The resulting 10,048 products remained paginated and were exported. This is an observed local result, not a performance guarantee for every device.
- Visual inspection at 1440 px desktop and 390 px mobile found no browser errors, broken image requests, or horizontal overflow. Hero motion, pause behavior, and hover transformations were measured directly.

The active artwork uses the `*-rich.webp` campaign images. Previous demo assets remain available locally. Business details and real client stock/images still require configuration as described in the launch notes.
