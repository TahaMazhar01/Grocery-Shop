import { readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import { resolve, dirname, sep } from 'node:path';
import { unzipSync, strFromU8 } from 'fflate';
import { validateCatalog } from '../src/lib/catalog';
import { validateSettings } from '../src/lib/settings';
export async function importCatalog(file:string){
 const buffer=await readFile(file);const packed=file.toLowerCase().endsWith('.zip')?unzipSync(buffer):null;
 const raw=packed?.['catalog/catalog.json']??buffer;if(packed&&!packed['catalog/catalog.json'])throw new Error('This ZIP is missing catalog/catalog.json. Export an update pack from Catalog Studio.');
 const catalog=validateCatalog(JSON.parse(strFromU8(new Uint8Array(raw))));
 const images=Object.entries(packed??{}).filter(([path])=>path.startsWith('public/images/'));
 const workspace=resolve('.');for(const [path]of images){if(!/^public\/images\/[a-zA-Z0-9_./-]+\.(png|jpe?g|webp|avif|gif)$/i.test(path)||path.split('/').includes('..'))throw new Error(`Unsafe image path in ZIP: ${path}`);const target=resolve(path);if(!target.startsWith(workspace+sep))throw new Error('Image path is outside the project.');}
 let settings:string|undefined;if(packed?.['public/store-config.json']){settings=JSON.stringify(validateSettings(JSON.parse(strFromU8(packed['public/store-config.json']))),null,2);}
 const backup=`catalog/backups/${new Date().toISOString().replace(/[:.]/g,'-')}`;await mkdir(backup,{recursive:true});
 for(const path of ['catalog/catalog.json','public/store-config.json']){try{await access(path);await copyFile(path,`${backup}/${path.replaceAll('/','-')}`);}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}}
 for(const [path,bytes]of images){const target=resolve(path);await mkdir(dirname(target),{recursive:true});try{await access(target);const backupImage=resolve(backup,path);await mkdir(dirname(backupImage),{recursive:true});await copyFile(target,backupImage);}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}await writeFile(target,bytes);}
 await writeFile('catalog/catalog.json',JSON.stringify(catalog,null,2));if(settings)await writeFile('public/store-config.json',settings);
 console.log(`Imported ${catalog.products.length} products and ${images.length} images. Previous files are backed up in ${backup}.`);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/import-catalog.ts')){const file=process.argv[2];if(!file)throw new Error('Usage: npm run catalog:import -- path/to/catalog.json (or update.zip)');await importCatalog(file);}
