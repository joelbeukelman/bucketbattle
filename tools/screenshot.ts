/**
 * Visual-review capture (see .claude/skills/visual-review). Usage:
 *   pnpm dev   (in another shell)
 *   pnpm shots [url] [outDir]
 * Writes desktop + phone screenshots of key scenes and prints renderer stats.
 */
import { chromium, type Page } from 'playwright';
import { mkdirSync } from 'node:fs';

const url = process.argv[2] ?? 'http://localhost:5173';
const date = new Date().toISOString().slice(0, 10);
const out = process.argv[3] ?? `docs/progress/${date}`;
mkdirSync(out, { recursive: true });

const viewports = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } } as const;

async function settle(page: Page, ms = 1500) {
  await page.waitForTimeout(ms);
}

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const [name, viewport] of Object.entries(viewports)) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: name === 'phone' ? 2 : 1 });
  page.on('pageerror', (e) => console.error(`[${name}] page error:`, e.message));
  await page.goto(url);
  await page.waitForFunction(() => (window as any).__bb && (window as any).__bbStats, null, { timeout: 30000 });
  await settle(page, 2500);
  await page.screenshot({ path: `${out}/spawn-${name}.png` });

  const busker = await page.evaluate(() => (window as any).__bb.encounters[0].at as [number, number]);
  await page.evaluate(([x, z]) => (window as any).__bb.teleport(x + 2.5, z + 2.5), busker);
  await settle(page);
  await page.screenshot({ path: `${out}/busker-${name}.png` });

  // Behind a row of shops (north sidewalk of the busker's block): the cutaway (W11) must reveal the player.
  await page.evaluate(([x, z]) => (window as any).__bb.teleport(x - 1.5 + 27, z - 28.5 + 1.5), busker);
  await settle(page);
  await page.screenshot({ path: `${out}/occluded-${name}.png` });

  await page.evaluate(() => (window as any).__bb.teleport(...(window as any).__bb.spawn));
  await page.mouse.move(viewport.width / 2, viewport.height / 2);
  for (let i = 0; i < 8; i++) await page.mouse.wheel(0, 400);
  await settle(page);
  await page.screenshot({ path: `${out}/overview-${name}.png` });

  await page.keyboard.press('m');
  await settle(page, 600);
  await page.screenshot({ path: `${out}/map-${name}.png` });

  const stats = await page.evaluate(() => (window as any).__bbStats);
  console.log(name, JSON.stringify(stats));
  await page.close();
}
await browser.close();
console.log(`saved to ${out}`);
