import { mkdir, writeFile, readFile } from 'node:fs/promises';
const dummy = ['apple','cucumber','eggs','milk','lemon','strawberry','kiwi','mulberry','green-bell-pepper','green-chili-pepper','potatoes','red-onions','rice','cooking-oil','honey-jar','juice','water','ice-cream','tissue-paper-box'];
const unsplash = { bananas: 'photo-1571771894821-ce9b6c11b08e', oranges: 'photo-1547514701-42782101795e', croissant: 'photo-1555507036-ab1f4038808a', nuts: 'photo-1599599810769-bcde5a160d32', tea: 'photo-1544787219-7f47ccb76574' };
await mkdir('public/images/products', { recursive: true });
const urls = [...dummy.map(name => [name, `https://cdn.dummyjson.com/product-images/groceries/${name}/1.webp`]), ...Object.entries(unsplash).map(([name,id]) => [name,`https://images.unsplash.com/${id}?auto=format&fit=crop&w=700&q=85&fm=webp`])];
const results = [];
for (let i=0; i<urls.length; i+=5) await Promise.all(urls.slice(i,i+5).map(async ([name,url]) => { try { const res = await fetch(url); if (!res.ok) throw new Error(`${res.status}`); const bytes=Buffer.from(await res.arrayBuffer()); await writeFile(`public/images/products/${name}.webp`,bytes); results.push({name,url,bytes:bytes.length}); console.log(`${name}: ${bytes.length} bytes`); } catch(e) { console.error(`${name}: ${e.message}`); } }));
await mkdir('docs', { recursive: true }); await writeFile('docs/stock-image-sources.json',JSON.stringify(results,null,2));
