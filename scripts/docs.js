import fs from 'fs/promises'
// insert the library into the docs using Skypack

const fn = 'docs/assets/main.js';
const js = await fs.readFile(fn, 'utf8');

const footer = `

(async () => {
    try {
        await Promise.all([(async () => {
            const linq = await import('https://cdn.skypack.dev/@adamburgess/linq?min');
            window.linq = window.from = linq.from;
        })(), (async () => {
            const Enumerable = await import('https://cdn.skypack.dev/@adamburgess/linq/enumerable?min');
            window.Enumerable = Enumerable;
        })()]);
    } catch(e) {
        console.error("Couldn't add linq to window, reason:", e);
    }
})();
`;

await fs.writeFile(fn, js + footer);
