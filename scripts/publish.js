import fs from 'fs/promises'

const pkgjson = 'publish/package.json';
const pkg = JSON.parse(await fs.readFile(pkgjson, 'utf8'));
// delete stuff we don't need.
delete pkg.scripts;
await fs.writeFile(pkgjson, JSON.stringify(pkg, null, 2));
