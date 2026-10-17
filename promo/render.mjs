// Renders promo/index.html to an MP4, one frame at a time.
// Usage: node promo/render.mjs <out-dir> [--stills t1,t2,...]
// Needs the repo served at http://localhost:8765 (python3 -m http.server 8765),
// Playwright and ffmpeg with libx264. The soundtrack is promo/soundtrack.song.js.
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const out = process.argv[2] ?? 'promo-out';
const stillsArg = process.argv.indexOf('--stills');
const FPS = 30;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });
page.on('pageerror', (e) => console.error('page error:', e.message));
await page.goto('http://localhost:8765/promo/', { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.ready === true);

const shoot = async (t, file) => {
  await page.evaluate((t) => window.at(t), t);
  await page.screenshot({ path: file });
};

if (stillsArg > 0) {
  mkdirSync(out, { recursive: true });
  for (const t of process.argv[stillsArg + 1].split(',').map(Number)) await shoot(t, join(out, `still-${t}.png`));
} else {
  const frames = join(out, 'frames');
  rmSync(frames, { recursive: true, force: true });
  mkdirSync(frames, { recursive: true });
  const total = Math.round((await page.evaluate(() => window.DURATION)) * FPS);
  for (let i = 0; i < total; i++) {
    await shoot(i / FPS, join(frames, `${String(i).padStart(5, '0')}.png`));
    if (i % 60 === 0) console.log(`frame ${i}/${total}`);
  }
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(frames, '%05d.png'),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    join(out, 'splatform-promo.mp4')], { stdio: 'inherit' });
  execFileSync('node', [new URL('./soundtrack.mjs', import.meta.url).pathname, join(out, 'soundtrack.wav')], { stdio: 'inherit' });
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', join(out, 'splatform-promo.mp4'), '-i', join(out, 'soundtrack.wav'),
    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000',
    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', join(out, 'splatform-promo-music.mp4')], { stdio: 'inherit' });
  console.log('wrote', join(out, 'splatform-promo.mp4'), 'and', join(out, 'splatform-promo-music.mp4'));
}
await browser.close();
