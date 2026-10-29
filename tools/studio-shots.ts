/**
 * Screenshot every character in the Character Workshop next to its concept image.
 * Usage: pnpm --filter @bb/studio dev   (other shell), then  pnpm studio:shots [id…]
 * Writes docs/progress/studio/<id>-<view>.png. Used by the visual-review / character-studio loop.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const url = process.env.STUDIO_URL ?? 'http://localhost:5174';
const only = process.argv.slice(2);
const out = 'docs/progress/studio';
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (e) => console.error('page error:', e.message));
await page.goto(url);
await page.waitForSelector('.chars button');
const names = await page.$$eval('.chars button', (bs) => bs.map((b) => b.textContent?.trim() ?? ''));
const ids = await page.evaluate(() => [...document.querySelectorAll('.chars button')].map((_, i) => i));
for (const i of ids) {
  await page.locator('.chars button').nth(i).click();
  await page.waitForTimeout(900);
  const name = names[i]!.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (only.length && !only.some((o) => name.includes(o))) continue;
  await page.screenshot({ path: `${out}/${name}-hero.png` });
  await page.getByRole('radio', { name: 'Both' }).click();
  await page.waitForTimeout(700);
  await page.locator('.stage').screenshot({ path: `${out}/${name}-both.png` });
  await page.getByRole('radio', { name: 'Battle' }).click();
}
await browser.close();
console.log(`saved to ${out}`);
