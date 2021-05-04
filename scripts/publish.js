import fs from 'fs/promises'

const pkgjson = 'publish/package.json';
const pkg = JSON.parse(await fs.readFile(pkgjson, 'utf8'));
// delete stuff we don't need.
delete pkg.scripts;
await fs.writeFile(pkgjson, JSON.stringify(pkg, null, 2));

// for the CJS build, linq.cjs still requires's "enumerable.js". Rename this to cjs.
const linqCjs = 'publish/linq.cjs';
const replaceFrom = 'require("./enumerable.js")';
const replaceTo = replaceFrom.replace('.js', '.cjs');
await fs.writeFile(linqCjs, (await fs.readFile(linqCjs, 'utf8')).replace(replaceFrom, replaceTo));
