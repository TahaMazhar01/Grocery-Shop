import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
const config=JSON.parse(await readFile('public/store-config.json','utf8'));
const catalog=JSON.parse(await readFile('public/data/catalog.json','utf8'));
const template=await readFile('dist/index.html','utf8');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const domain=config.siteUrl.replace(/\/$/,'');
const paths=[];
async function page(path,title,description,content,image=config.hero.image,product=null){
 const canonical=domain?`${domain}${path}`:'';
 const metadata=`<meta name="robots" content="${config.demo?'noindex,nofollow':'index,follow'}"/><meta property="og:title" content="${esc(title)}"/><meta property="og:description" content="${esc(description)}"/><meta property="og:type" content="website"/>${canonical?`<link rel="canonical" href="${esc(canonical)}"/><meta property="og:url" content="${esc(canonical)}"/>`:''}${image?`<meta property="og:image" content="${esc(image.startsWith('https://')?image:domain+image)}"/>`:''}`;
 let schema='';if(product&&!config.demo&&domain){const data={'@context':'https://schema.org','@type':'Product',name:product.title,description:product.description,sku:product.sku,url:canonical,image:[product.image,...product.images].filter(Boolean).map(x=>x.startsWith('https://')?x:domain+x)};schema=`<script type="application/ld+json">${JSON.stringify(data).replace(/</g,'\\u003c')}</script>`;}
 const html=template.replace(/<title>.*?<\/title>/,`<title>${esc(title)}</title>`).replace(/<meta name="description"[^>]+>/,`<meta name="description" content="${esc(description)}"/>`).replace('</head>',`${metadata}${schema}</head>`).replace('<div id="root"></div>',`<div id="root"><main class="section-shell info-page"><a href="/">${esc(config.brand)}</a><h1>${esc(title)}</h1><p>${esc(description)}</p>${content}<p><a href="/shop">Explore the shelves</a> · <a href="/contact">Contact the store</a></p></main></div>`);
 const folder=join('dist',path);await mkdir(folder,{recursive:true});await writeFile(join(folder,'index.html'),html);paths.push(path);
}
const listing=products=>`<ul>${products.slice(0,24).map(p=>`<li><a href="/product/${esc(p.slug)}">${esc(p.title)} — ${esc(p.unit)}</a></li>`).join('')}</ul>`;
const active=catalog.products.filter(p=>p.active);
await page('/',config.tagline,`The things you love. The staples you need. Explore ${config.brand}.`,`<img src="${esc(config.hero.image)}" alt="A basket of fresh groceries" width="768" height="512"/><nav>${catalog.categories.map(c=>`<a href="/category/${esc(c.id)}">${esc(c.name)}</a> `).join('')}</nav>${listing(active.filter(p=>p.featured))}`);
await page('/shop','The grocery shelves',`Browse groceries at ${config.brand}.`,listing(active));
for(const c of catalog.categories){await page(`/category/${c.id}`,c.name,c.description,listing(active.filter(p=>p.category===c.id)),c.image);for(const s of c.subcategories)await page(`/category/${c.id}/${s.id}`,s.name,c.description,listing(active.filter(p=>p.category===c.id&&p.subcategory===s.id)),c.image);}
for(let i=0;i<active.length;i+=50)await Promise.all(active.slice(i,i+50).map(p=>page(`/product/${p.slug}`,`${p.title} | ${config.brand}`,p.description,`${p.image?`<img src="${esc(p.image)}" alt="${esc(p.imageAlt)}" width="500" height="500"/>`:''}<p>${esc(p.unit)} · ${esc(new Intl.NumberFormat(config.locale,{style:'currency',currency:config.currency}).format(p.price))}</p><p>Contact the store to confirm availability and the final total.</p>`,p.image,p)));
for(const [path,title,description]of [['about','Good food belongs in everyday life.','A simple place to find your groceries, with a little inspiration along the way.'],['contact','Let’s talk groceries.','Contact the store to ask about groceries and delivery.'],['delivery','A simple way to shop.','Build your basket, share it on WhatsApp, and confirm the details with the store.'],['faq','A few useful little answers.','Find out how ordering, availability, delivery, and saved baskets work.'],['privacy','A little about your data.','Your basket and favourites are stored in this browser. The storefront does not collect payment details.'],['cart','Your basket.','A few good things for your kitchen.']])await page(`/${path}`,title,description,'');
await writeFile('dist/404.html',template.replace(/<title>.*?<\/title>/,`<title>That shelf isn’t here | ${esc(config.brand)}</title>`));
await writeFile('dist/_redirects','/* /index.html 200\n');
await writeFile('dist/robots.txt',config.demo?'User-agent: *\nDisallow: /\n':`User-agent: *\nAllow: /\nDisallow: /editor/\n${domain?`Sitemap: ${domain}/sitemap.xml\n`:''}`);
if(domain)await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.filter(p=>p!='/cart').sort().map(p=>`<url><loc>${esc(domain+p)}</loc></url>`).join('')}</urlset>`);
console.log(`Prerendered ${paths.length} static pages. ${config.demo?'Preview indexing is disabled.':domain?'Sitemap generated.':'Set siteUrl to generate a sitemap.'}`);
