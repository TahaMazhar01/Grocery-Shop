import { mkdir, writeFile } from 'node:fs/promises';
import type { Catalog, Category, Product } from '../src/types';
import { slugify } from '../src/lib/catalog';

const categories: Category[] = [
  { id: 'fruit', name: 'Fresh fruit', description: 'A little colour for your fruit bowl.', image: '/images/products/apple.webp', color: '#f3e6d9', subcategories: [{ id: 'everyday-fruit', name: 'Everyday fruit' }, { id: 'citrus', name: 'Citrus' }, { id: 'seasonal-fruit', name: 'Seasonal fruit' }] },
  { id: 'vegetables', name: 'Vegetables', description: 'The start of something good.', image: '/images/products/carrots.webp', color: '#edf0df', subcategories: [{ id: 'everyday-vegetables', name: 'Everyday vegetables' }, { id: 'greens-herbs', name: 'Greens & herbs' }] },
  { id: 'dairy-eggs', name: 'Dairy & eggs', description: 'For breakfast, baking, and in between.', image: '/images/products/eggs.webp', color: '#f5edda', subcategories: [{ id: 'milk', name: 'Milk' }, { id: 'eggs', name: 'Eggs' }, { id: 'cheese-yogurt', name: 'Cheese & yogurt' }] },
  { id: 'bakery', name: 'The bakery', description: 'Something worth making toast for.', image: '/images/products/bread.webp', color: '#eee4d5', subcategories: [{ id: 'bread', name: 'Bread' }, { id: 'pastries', name: 'Pastries & buns' }, { id: 'wraps', name: 'Wraps' }] },
  { id: 'pantry', name: 'Pantry staples', description: 'Keep the cupboard ready.', image: '/images/products/rice.webp', color: '#e9ebdb', subcategories: [{ id: 'rice-grains', name: 'Rice & grains' }, { id: 'oils-spices', name: 'Oils & spices' }, { id: 'pulses', name: 'Pulses' }] },
  { id: 'drinks', name: 'Drinks', description: 'Put the kettle on. Or the ice in.', image: '/images/products/juice.webp', color: '#efe5d8', subcategories: [{ id: 'tea-coffee', name: 'Tea & coffee' }, { id: 'juice-water', name: 'Juice & water' }] },
  { id: 'snacks', name: 'Snacks', description: 'For the just-one-more moments.', image: '/images/products/nuts.webp', color: '#ece3d5', subcategories: [{ id: 'nuts', name: 'Nuts & dried fruit' }, { id: 'biscuits', name: 'Biscuits' }, { id: 'savory', name: 'Savory snacks' }] },
  { id: 'frozen', name: 'Frozen favourites', description: 'Good things to have on standby.', image: '/images/products/ice-cream.webp', color: '#e7ebee', subcategories: [{ id: 'frozen-vegetables', name: 'Vegetables' }, { id: 'frozen-prepared', name: 'Prepared foods' }, { id: 'desserts', name: 'Desserts' }] },
  { id: 'household', name: 'Around the home', description: 'The useful little essentials.', image: '/images/products/tissue-paper-box.webp', color: '#e9e5ed', subcategories: [{ id: 'kitchen', name: 'Kitchen essentials' }, { id: 'cleaning', name: 'Cleaning' }] },
];
// Demo prices, pack sizes and availability. Replace with the client's verified catalog.
const records: [string, string, string, number, string, string, string][] = [
  ['Vine tomatoes','vegetables','everyday-vegetables',180,'500 g','tomatoes','For salads, sandwiches, and the start of a good sauce.'],
  ['Hass avocados','fruit','everyday-fruit',420,'2 pieces','avocado','Slice onto toast, tuck into a sandwich, or mash with a squeeze of lemon.'],
  ['Sourdough loaf','bakery','bread',650,'1 loaf','bread','A good reason to make soup. An even better reason to make toast.'],
  ['Everyday eggs','dairy-eggs','eggs',360,'6 pieces','eggs','Scrambled, baked, or sunny side up. Make breakfast your own.'],
  ['Carrots with tops','vegetables','everyday-vegetables',160,'500 g','carrots','Roast with dinner or chop into something warming.'],
  ['Red apples','fruit','everyday-fruit',320,'1 kg','apple','One for the fruit bowl. One for your bag.'],
  ['Crisp cucumbers','vegetables','everyday-vegetables',120,'500 g','cucumber','Slice for a salad or a quick lunchtime sandwich.'],
  ['Breakfast milk','dairy-eggs','milk',290,'1 litre','milk','For the first cup of tea and the last bowl of cereal.'],
  ['Lemons','fruit','citrus',150,'4 pieces','lemon','A squeeze for your salad, a slice for your water.'],
  ['Strawberries','fruit','seasonal-fruit',480,'250 g','strawberry','A bowlful for breakfast or something sweet after dinner.'],
  ['Kiwi fruit','fruit','everyday-fruit',390,'4 pieces','kiwi','Scoop with a spoon or add a little green to your fruit salad.'],
  ['Mulberries','fruit','seasonal-fruit',350,'250 g','mulberry','For a bowl of yogurt or a handful on their own.'],
  ['Bananas','fruit','everyday-fruit',240,'6 pieces','bananas','Breakfast, lunchboxes, or that loaf you have been meaning to bake.'],
  ['Oranges','fruit','citrus',350,'1 kg','oranges','Peel one for a break between the busy bits.'],
  ['Green peppers','vegetables','everyday-vegetables',180,'500 g','green-bell-pepper','Dice for a stir-fry or roast in generous wedges.'],
  ['Green chillies','vegetables','greens-herbs',80,'100 g','green-chili-pepper','A little goes a long way in your next pot of something good.'],
  ['Everyday potatoes','vegetables','everyday-vegetables',180,'1 kg','potatoes','Mash, roast, or tuck into a curry. Your call.'],
  ['Red onions','vegetables','everyday-vegetables',150,'1 kg','red-onions','For the pan, the salad, and just about everything else.'],
  ['Baby spinach','vegetables','greens-herbs',140,'200 g','','A handful for your omelette, pasta, or lunchtime salad.'],
  ['Plain yogurt','dairy-eggs','cheese-yogurt',240,'400 g','','Spoon over breakfast or stir into a quick dressing.'],
  ['Cheddar cheese','dairy-eggs','cheese-yogurt',550,'200 g','','For sandwiches, toasties, and a little grating over dinner.'],
  ['Salted butter','dairy-eggs','cheese-yogurt',520,'200 g','','Keep a little ready for toast and the baking tin.'],
  ['Butter croissant','bakery','pastries',280,'1 piece','croissant','A quiet moment with coffee, preferably somewhere sunny.'],
  ['Sandwich bread','bakery','bread',260,'1 loaf','','For lunchboxes and easy late-night toast.'],
  ['Plain wraps','bakery','wraps',300,'6 pieces','','Wrap around yesterday’s leftovers or today’s big idea.'],
  ['Dinner rolls','bakery','pastries',240,'6 pieces','','Pass them around with soup or the Sunday meal.'],
  ['Everyday rice','pantry','rice-grains',420,'1 kg','rice','A dependable starting point for dinner.'],
  ['Cooking oil','pantry','oils-spices',580,'1 litre','cooking-oil','For the everyday cooking that keeps the kitchen going.'],
  ['Honey','pantry','oils-spices',680,'250 g','honey-jar','A spoonful for porridge, toast, or a simple dressing.'],
  ['Red lentils','pantry','pulses',320,'500 g','','Make a pot of daal and save some for tomorrow.'],
  ['Chickpeas','pantry','pulses',300,'500 g','','For a weekend pot, a crunchy roast, or a bowl of hummus.'],
  ['Plain flour','pantry','rice-grains',200,'1 kg','','For the next batch of something homemade.'],
  ['Orange juice','drinks','juice-water',320,'1 litre','juice','A glass alongside breakfast or a splash over ice.'],
  ['Drinking water','drinks','juice-water',90,'1.5 litres','water','A useful extra for the fridge or your day out.'],
  ['Everyday black tea','drinks','tea-coffee',520,'200 g','tea','Put the kettle on. There is always time for a cup.'],
  ['Ground coffee','drinks','tea-coffee',890,'200 g','','For the mornings that call for a little ritual.'],
  ['Mixed nuts','snacks','nuts',650,'250 g','nuts','Keep a bowl nearby for the afternoon pause.'],
  ['Oat biscuits','snacks','biscuits',230,'200 g','','Made for the side of your cup.'],
  ['Salted crackers','snacks','savory',180,'150 g','','Set out with cheese or a spoonful of your favourite dip.'],
  ['Raisins','snacks','nuts',300,'250 g','','Stir into porridge or tuck a handful into a lunchbox.'],
  ['Ice cream','frozen','desserts',620,'500 ml','ice-cream','A bowl, a spoon, and a moment to yourself.'],
  ['Frozen peas','frozen','frozen-vegetables',280,'500 g','','A useful standby for rice, pasta, and quick dinners.'],
  ['Frozen mixed vegetables','frozen','frozen-vegetables',320,'500 g','','A little help when the vegetable drawer is looking quiet.'],
  ['Frozen parathas','frozen','frozen-prepared',450,'5 pieces','','For an easy breakfast or something to scoop up dinner.'],
  ['Facial tissues','household','kitchen',180,'1 box','tissue-paper-box','A small essential to keep within reach.'],
  ['Kitchen paper','household','kitchen',280,'2 rolls','','For spills, splashes, and the daily kitchen reset.'],
  ['Dishwashing liquid','household','cleaning',260,'500 ml','','For the dishes after the good part.'],
  ['Kitchen sponges','household','cleaning',160,'3 pieces','','A little restock for the sink-side essentials.'],
];
const products: Product[] = records.map((r, i) => ({
  id: `prod-${String(i + 1).padStart(3, '0')}`, sku: `${r[1].slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, '0')}`, slug: slugify(r[0]), title: r[0], description: r[6], price: r[3], compareAtPrice: null,
  image: r[5] ? `/images/products/${r[5]}.webp` : '', images: [], imageAlt: r[0], category: r[1], subcategory: r[2], unit: r[4], stock: null, availability: 'available', featured: i < 8, active: true, tags: [r[1], r[2]], externalUrl: null, variants: [], variableWeight: ['1 kg','500 g'].includes(r[4]) && ['fruit','vegetables'].includes(r[1]),
}));
for (const index of [0,4,5,16,17,26]) { const p = products[index]; p.variants = [{ id: `${p.id}-standard`, sku: p.sku, label: p.unit, price: p.price, stock: null, availability: 'available' }, { id: `${p.id}-large`, sku: `${p.sku}-L`, label: p.unit === '500 g' ? '1 kg' : '2 kg', price: p.price * 2, stock: null, availability: 'available' }]; }
products[11].availability = 'unavailable'; products[11].stock = 0;
const catalog: Catalog = { version: 1, updatedAt: new Date().toISOString(), categories, products, collections: [
  { id: 'slow-mornings', title: 'For slower mornings.', description: 'Good bread, something to spread, and your first cup.', productIds: ['prod-003','prod-004','prod-008','prod-029','prod-035'] },
  { id: 'tonights-dinner', title: 'What’s cooking tonight?', description: 'A few useful things. Plenty of possibilities.', productIds: ['prod-001','prod-005','prod-015','prod-017','prod-018','prod-027'] },
  { id: 'cupboard-essentials', title: 'A well-stocked cupboard.', description: 'Little essentials that make the week easier.', productIds: ['prod-027','prod-028','prod-030','prod-031','prod-032','prod-037'] },
] };
await mkdir('catalog', { recursive: true }); await writeFile('catalog/catalog.json', JSON.stringify(catalog, null, 2));
console.log(`Created ${products.length} demo products in ${categories.length} categories.`);
