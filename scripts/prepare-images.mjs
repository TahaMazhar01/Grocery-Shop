import { createRequire } from 'node:module';
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
// Optional asset-production helper; it is not part of the site build.
// Install sharp separately and supply the folder containing the original PNGs.
const sourceDirectory=process.argv[2];
if(!sourceDirectory)throw new Error('Usage: node scripts/prepare-images.mjs path/to/original-pngs (requires sharp)');
const require = createRequire(import.meta.url);
const sharp = require('sharp');
const sources = JSON.parse(await readFile('docs/generated-image-sources.json','utf8'));
for (const asset of sources) {
  const output = `public/images/${asset.name}.webp`;
  await mkdir(dirname(output),{recursive:true});
  const result = await sharp(resolve(sourceDirectory,asset.source)).resize({ width: asset.name.startsWith('hero') ? 1100 : 700, withoutEnlargement: true }).webp({quality:88}).toFile(output);
  console.log(`${output}: ${result.size} bytes`);
}
