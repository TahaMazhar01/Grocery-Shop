import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { importCatalog } from './import-catalog';
if(process.argv[2])await importCatalog(process.argv[2]);
const npm=process.env.npm_execpath||join(dirname(process.execPath),'node_modules/npm/bin/npm-cli.js');
const build=spawnSync(process.execPath,[npm,'run','build'],{stdio:'inherit'});if(build.status!==0)process.exit(build.status||1);
const pack=spawnSync(process.execPath,['scripts/package-site.mjs'],{stdio:'inherit'});if(pack.status!==0)process.exit(pack.status||1);
