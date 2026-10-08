import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';

// A classic inline script can also run when the HTML is opened as a local file.
const result = await build({
  entryPoints: ['src/main.jsx'], bundle: true, write: false, minify: true,
  external: ['/assets/*'], format: 'iife', outfile: 'game.js', define: { 'process.env.NODE_ENV': '"production"' }
});
const js = result.outputFiles.find(file => file.path.endsWith('.js')).text;
let theme = await readFile('src/theme.css', 'utf8');
for (const name of ['russia-scenes-1-4.png', 'russia-scenes-5-8.png']) {
  const artwork = await readFile('public/assets/backgrounds/' + name);
  theme = theme.replaceAll('/assets/backgrounds/' + name, 'data:image/png;base64,' + artwork.toString('base64'));
}
// Font imports must precede all other CSS rules to work in an inline stylesheet.
const imports = theme.match(/^@import[^;]+;/gm) || [];
const css = imports.join('\n') + '\n' + await readFile('src/styles.css', 'utf8') + '\n' + theme.replace(/^@import[^;]+;/gm, '');
const html = `<!doctype html>
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta name="theme-color" content="#FFF9F5"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><title>1917 러시아를 구하라 · 바로 열기</title><style>${css}</style></head>
<body><div id="root"></div><script>${js.replace(/<\/script/gi, '<\\/script')}</script></body></html>`;
await writeFile('russia-1917-prototype.html', html);
await writeFile('index.html', html);
console.log('Created russia-1917-prototype.html (game bundled; web fonts load online)');
