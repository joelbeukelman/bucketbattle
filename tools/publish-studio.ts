/**
 * Build the Character Workshop and turn it into an Artifact-ready page:
 *   apps/studio/dist/artifact.html  (page fragment: title, styles, root, module script)
 *   apps/studio/dist/assets/*       (JS, CSS, concept images, published alongside)
 * Usage: pnpm studio:publish, then publish artifact.html with the files under dist/assets.
 */
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

execSync('pnpm --filter @bb/studio build', { stdio: 'inherit' });
const dist = 'apps/studio/dist';
const html = readFileSync(`${dist}/index.html`, 'utf8');
const tags = [...html.matchAll(/<(?:script|link)[^>]+(?:src|href)="\.\/assets\/[^"]+"[^>]*>(?:<\/script>)?/g)].map((m) => m[0]);
const fonts = html.match(/<link rel="stylesheet" href="https:\/\/fonts[^>]+>/)?.[0] ?? '';
const page = [
  '<title>Character Workshop</title>',
  '<meta name="claude:viewport-fit-sides" content="cover">',
  fonts,
  ...tags,
  '<style>html,body,#root{height:100%}</style>',
  '<div id="root"></div>',
].join('\n');
writeFileSync(`${dist}/artifact.html`, page + '\n');
const assets = readdirSync(`${dist}/assets`).map((f) => `assets/${f}`);
writeFileSync(`${dist}/artifact-files.json`, JSON.stringify(assets, null, 2));
console.log(`artifact.html + ${assets.length} assets ready in ${dist}`);
