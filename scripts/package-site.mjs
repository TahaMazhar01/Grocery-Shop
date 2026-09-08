import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { zipSync } from 'fflate';
const files={};
async function walk(folder,prefix=''){for(const entry of await readdir(folder,{withFileTypes:true})){const path=join(folder,entry.name);const key=prefix+entry.name;if(entry.isDirectory())await walk(path,key+'/');else files[key]=new Uint8Array(await readFile(path));}}
await walk('dist');
const storefront=Object.fromEntries(Object.entries(files).filter(([name])=>!name.startsWith('editor/')&&name!=='data/catalog.json'&&name!=='data/catalog-template.csv'));
const editor={...files}; // Standalone editor retains the storefront for preview and all compiled shared assets.
await mkdir('release',{recursive:true});
await writeFile('release/storefront.zip',zipSync(storefront,{level:6}));
await writeFile('release/catalog-studio.zip',zipSync(editor,{level:6}));
console.log('Ready: release/storefront.zip and release/catalog-studio.zip. No site was deployed.');
