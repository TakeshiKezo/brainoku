/**
 * Kopiert die statischen Web-Dateien nach www/ — das ist der webDir,
 * den Capacitor in den iOS/Android-Wrapper bündelt.
 */
import { promises as fs } from 'fs';
import path from 'path';

const SRC_FILES = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'icon.svg',
  'sakura.jpeg',
  'sakuradark.jpeg',
];

const OUT_DIR = 'www';

async function copyIfExists(src, dst) {
  try {
    await fs.copyFile(src, dst);
    console.log(`  ✓ ${src}`);
  } catch (e) {
    if (e.code === 'ENOENT') console.warn(`  ⚠ ${src} fehlt — übersprungen`);
    else throw e;
  }
}

async function main() {
  await fs.rm(OUT_DIR, { recursive: true, force: true });
  await fs.mkdir(OUT_DIR, { recursive: true });
  console.log(`Build → ${OUT_DIR}/`);
  for (const f of SRC_FILES) {
    await copyIfExists(f, path.join(OUT_DIR, f));
  }
  console.log('Web-Build fertig.');
}

main().catch((e) => { console.error(e); process.exit(1); });
