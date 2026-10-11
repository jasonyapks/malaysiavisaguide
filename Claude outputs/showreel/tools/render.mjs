// Render showreel.html to video, frame-exact, with sub-frame motion blur.
//
//   node render.mjs <out.mp4> [--fps 60] [--sub 3] [--workers 4] [--w 1920] [--from 0] [--to 25]
//
// Each output frame is the average of `sub` renders spread over a 180° shutter
// (half the frame interval), which is what a film camera would record. Workers
// each own a contiguous slice of frames and pipe JPEG sub-frames to their own
// ffmpeg, which averages them (tmix) and decimates back to the output rate.
// The slices are then concatenated losslessly.
import { createRequire } from 'module';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_PATH || 'playwright');
const here = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const out = path.resolve(args[0]);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i > 0 ? +args[i + 1] : d; };
const FPS = opt('fps', 60), SUB = opt('sub', 3), WORKERS = opt('workers', 4), OUTW = opt('w', 1920);
const FROM = opt('from', 0), TO = opt('to', 25);
const F0 = Math.round(FROM * FPS), F1 = Math.round(TO * FPS), total = F1 - F0;
const tmp = fs.mkdtempSync(path.join(path.dirname(out), '.render-'));
const html = 'file://' + path.join(here, '..', 'showreel.html') + '?render';

async function worker(id, a, b) {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--font-render-hinting=none', '--disable-gpu-vsync'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => console.error(`[w${id}] page error:`, e.message));
  await page.goto(html);
  await page.evaluate(() => window.__ready);
  const cdp = await page.context().newCDPSession(page);
  const seg = path.join(tmp, `seg${id}.mp4`);
  const vf = [SUB > 1 ? `tmix=frames=${SUB}` : null, SUB > 1 ? `select='eq(mod(n\\,${SUB})\\,${SUB - 1})'` : null, `setpts=N/${FPS}/TB`, OUTW !== 1920 ? `scale=${OUTW}:-2:flags=lanczos` : null, 'format=yuv420p'].filter(Boolean).join(',');
  const ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS * SUB), '-i', '-',
    '-vf', vf, '-r', String(FPS), '-c:v', 'libx264', '-preset', 'medium', '-crf', '12', '-pix_fmt', 'yuv420p', seg], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', c => c ? rej(new Error('ffmpeg ' + c)) : res()));
  const t0 = Date.now();
  for (let f = a; f < b; f++) {
    for (let s = 0; s < SUB; s++) {
      const t = (f + (SUB > 1 ? s / SUB * 0.5 : 0)) / FPS;
      await page.evaluate(t => window.__render(t), t);
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 95, optimizeForSpeed: true });
      if (!ff.stdin.write(Buffer.from(data, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    }
    if ((f - a) % 60 === 0) console.log(`[w${id}] frame ${f - a}/${b - a}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await done;
  await browser.close();
  return seg;
}

const per = Math.ceil(total / WORKERS);
const jobs = [];
for (let w = 0; w < WORKERS; w++) { const a = F0 + w * per, b = Math.min(F1, a + per); if (a < b) jobs.push(worker(w, a, b)); }
const segs = await Promise.all(jobs);
const list = path.join(tmp, 'list.txt');
fs.writeFileSync(list, segs.map(s => `file '${s}'`).join('\n'));
await new Promise((res, rej) => spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', out], { stdio: 'inherit' }).on('close', c => c ? rej(new Error('concat ' + c)) : res()));
fs.rmSync(tmp, { recursive: true, force: true });
console.log('wrote', out);
