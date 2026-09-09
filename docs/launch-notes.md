# Handover and launch notes

## Current configuration

Market & Basket is a temporary brand. There are 48 illustrative grocery products with PKR prices, nine categories, and three collections. Twenty products currently use the explicit “Photo coming soon” state. Original generated hero and featured product artwork are demonstration visuals; other included sample images are recorded in `stock-image-sources.json`.

The WhatsApp number is configured as +1 (737) 307-5495 for contact and complete basket enquiries. The service area, email, and website URL are still empty. Supply these remaining business details, replace demo content, and review prices, imagery, availability, and delivery copy before switching off demo mode. There are no invented reviews or certifications.

## Static deployment

`npm run publish:prepare` creates separate storefront and editor ZIPs. Upload the extracted public ZIP at the host's domain root. The current paths are absolute; a project subpath such as `username.github.io/Grocery-Shop/` requires a base-path change or custom domain before deployment.

The build includes individual static HTML entry pages for products, categories, and informational routes. After JavaScript loads, React supplies the shopping interactions. A `_redirects` fallback is supplied for hosts that support it. Other hosts should serve existing files first, then fall back to `index.html` for application routes and their own 404 response for missing static assets.

Configure a short cache or revalidation policy for `/data/*` and `/store-config.json`; fingerprinted `/assets/*` can be cached for longer. Product images uploaded with the same filename must also be refreshed by the host's deployment/cache policy. Basket enquiries fetch the current search data before preparing the message, but prices and stock still require store confirmation.

The complete development `dist/` includes Catalog Studio. The public ZIP omits its entry page and full editor catalog. There is no secure admin password screen; the editor has no permission to change the deployed site. Keep it local and publish exported files through the host or a developer-managed repository workflow.

## Search engines and privacy

Demo mode emits noindex metadata. With a real site URL and demo mode off, the build writes canonical URLs, Open Graph metadata, a sitemap, and basic Product structured data without invented reviews or offers. Configure actual production hosting before relying on public share previews.

Baskets, favourites, previous baskets, motion preference, and editor drafts use browser storage when available. There is no customer database, account system, payment processing, or live stock reservation. WhatsApp is a separate service; customers review and send the prepared message themselves. Very long lists have copy/download options so no items need to be omitted.

Bot integration is deferred. Product and basket enquiries are assembled in `src/lib/catalog.ts`; contact controls use the central configuration. A future shared editor or live inventory service would be an explicit architecture change.

## Verification

The project includes catalog unit tests, browser flows for shopping and editing, and a separate 10,000-record fixture. Browser tests use an intercepted sample WhatsApp number and capture the prepared URL; they do not send messages. The redesign inspection checks actual motion changes, pause behavior, hover transformations, mobile overflow, and image loading.

Run `npm test`, `npm run fixture`, and `npm run test:e2e` after functional changes. Run `npm run publish:prepare` to validate source files and rebuild the release packages.
