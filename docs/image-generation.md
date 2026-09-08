# Original demo imagery

Generated with the built-in imagegen tool. Hero scenes and the four featured product illustrations are original generated demo assets, not client product photographs. WebP copies are stored in `public/images/`; source paths are recorded in `generated-image-sources.json`.

## Market hero prompt

Use case: photorealistic-natural. Asset type: premium independent grocery storefront hero, landscape 3:2 photo. Create a beautifully art-directed food photograph of an overflowing natural woven market basket, fresh deep green kale, leafy carrots, ripe heirloom tomatoes, a golden crusty baguette protruding diagonally, aubergine, oranges and small radishes, resting on a warm honey-colored wooden kitchen table. A few ripe tomatoes and half a lemon are casually placed beside the basket, soft cream linen napkin. Composition: basket centered in frame, camera at table height slightly above, full basket visible, no human, generous but not empty space around, softly blurred olive green wall behind with warm afternoon window light and soft botanical shadows. Magazine food photography with rich natural textures, warm nostalgic film tones, crisp appetizing produce. Camera 50mm, natural shallow depth of field. This is an original unbranded demo lifestyle image. No text, no logo, no watermark, no graphics.

## Meal reveal prompt

Use case: precise-object-edit. Asset type: second image in a grocery website cursor brush reveal. Transform the provided grocery basket photograph into a complementary prepared meal scene. Keep the exact same kitchen, olive wall, window lighting, warm wooden table, camera position and landscape 3:2 framing. Replace the large central woven grocery basket with an inviting large cream ceramic platter of roasted carrots and aubergine, leafy salad, sliced heirloom tomatoes, and pieces of toasted baguette; add a small bowl of lemon dressing and two simple plates. Keep the cream linen napkin at right and half lemon near left. The meal occupies the same central area as the basket. Natural magazine food photography, warm afternoon light, delicious realistic textures, sophisticated rustic styling. No people, text, watermark, logos or branded packaging. This is original unbranded demo lifestyle art.

## Product prompts

Each subject below was requested as a separate square image: a centered, entirely visible, original unbranded grocery product on a very pale warm ivory seamless background, natural soft daylight from the upper left, delicate contact shadow, sharp realistic texture, no packaging, text, logo, or watermark. Final files: `public/images/products/tomatoes.webp`, `avocado.webp`, `bread.webp`, and `carrots.webp`.

- tomatoes: A loose cluster of five ripe red vine tomatoes with green stems, one tomato slightly forward.
- avocado: One whole dark green Hass avocado and one half avocado with a beautiful brown pit, arranged casually.
- bread: One beautifully scored round sourdough loaf, with two slices leaning naturally beside it, golden crisp crust.
- carrots: A small bunch of five fresh orange carrots, with feathery green tops angled gently to the upper left.


## Animated hero grocery cutout

Use case: product-mockup. Asset type: large transparent hero cutout for a modern grocery ecommerce website. Create a gorgeous photorealistic unbranded reusable natural jute shopping tote overflowing abundantly with fresh groceries: vivid leafy broccoli and kale at top, pineapple leaves and pineapple at upper left, bright orange carrots, ripe red vine tomatoes, a yellow bell pepper, one orange and a long golden baguette angled upward to the right. Bag placed at a natural three-quarter angle, subtly leaning as if just set down, full handles visible. Whole arrangement fits completely within frame with 8% clear margin. No basket or wooden table, no room, no background. GENUINELY TRANSPARENT BACKGROUND with preserved alpha, not a checkerboard pattern. Soft subtle contact shadow under tote only. Bright fresh supermarket campaign photography, high-end art direction, lifelike richly detailed produce, soft daylight from upper left, saturated but natural green and orange accents. Square composition. No text, no logo, no watermark, no packaging labels. All ingredients and tote must look physically realistic. Independent layers will animate this cutout in the website.

## Animated hero meal cutout

Use case: product-mockup. Asset type: second transparent image for an interactive grocery-to-dinner brush reveal on an ecommerce hero. Create a photorealistic generous cream ceramic serving platter of colourful roasted carrots, roasted aubergine, fresh tomato and leafy salad, with slices of golden crusty bread arranged at the back. A small cream bowl of lemon dressing and lemon half sit closely at the front side. Camera three-quarter low overhead, appetizing and abundant, the entire collection arranged as one compact unified cutout centered in a square frame, occupying 80% of frame. Bright natural daylight from upper left, vivid lifelike textures and natural greens, orange and tomato red, premium food campaign art direction. All objects entirely inside the frame, 8% clear margins. GENUINELY TRANSPARENT BACKGROUND with alpha; no floor, table, setting, checkerboard, backdrop, graphics, text, logo, packaging or watermark. Soft contact shadows underneath only. This is original unbranded demo meal artwork.

The optimized transparent WebP versions are included as `hero-grocery-tote.webp` and `hero-meal-cutout.webp`. Original PNG filenames are recorded for provenance; they are not needed to build or run the site. `prepare-images.mjs` is an optional production helper requiring a supplied PNG source directory and the sharp package.
