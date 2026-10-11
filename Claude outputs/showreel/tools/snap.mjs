// Render selected timestamps to PNG for review: node snap.mjs out_dir t1 t2 ...
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH || 'playwright');
import path from 'path'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const [out, ...ts] = process.argv.slice(2);
const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--font-render-hinting=none'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('console', m => console.log('console:', m.text())); page.on('pageerror', e => console.log('ERR', e.message));
await page.goto('file://' + path.join(here, '..', 'showreel.html') + '?render');
await page.evaluate(() => window.__ready);
for (const t of ts) { await page.evaluate(t => window.__render(+t), t); await page.screenshot({ path: `${out}/t${String(t).padStart(5, '0')}.png` }); }
await browser.close();
