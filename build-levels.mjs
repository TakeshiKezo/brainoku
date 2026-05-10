/**
 * Vor-generiert pro Schwierigkeit N Sudoku-Puzzles in levels/<diff>.json.
 *
 * Logik 1:1 aus index.html — gleiche Seeds → gleiche Puzzles → bestehende
 * Spielstände/Bestzeiten bleiben kompatibel.
 *
 * Resume-fähig: schreibt nach jedem Chunk. Wenn Datei existiert und enthält
 * bereits die ersten N Level, werden nur die fehlenden ergänzt.
 *
 * Aufruf:  node build-levels.mjs [count]    (Default: 4000)
 */
import { promises as fs } from 'fs';
import path from 'path';

const COUNT = parseInt(process.argv[2] || '4000', 10);
const DIFFS = ['leicht', 'mittel', 'schwer', 'experte'];
const HOLES = { leicht: 38, mittel: 46, schwer: 52, experte: 58 };
const OUT_DIR = 'levels';
const CHUNK = 100;

/* ---------- Seed / RNG / Solved-Grid (1:1 aus index.html) ---------- */
function hashSeed(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (((h << 5) + h) ^ str.charCodeAt(i)) >>> 0;
  return h >>> 0;
}
function seededRng(seed) {
  let s = (seed >>> 0) || 1;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
function shuffleArr(a, rand) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function generateSolved(rand) {
  const base = 3, side = 9;
  const pattern = (r, c) => (base * (r % base) + Math.floor(r / base) + c) % side;
  const rBase = [0, 1, 2];
  const rows = shuffleArr(rBase.slice(), rand).flatMap(g => shuffleArr(rBase.slice(), rand).map(r => g * base + r));
  const cols = shuffleArr(rBase.slice(), rand).flatMap(g => shuffleArr(rBase.slice(), rand).map(c => g * base + c));
  const nums = shuffleArr([1,2,3,4,5,6,7,8,9], rand);
  const board = [];
  for (let r = 0; r < 9; r++) {
    const row = [];
    for (let c = 0; c < 9; c++) row.push(nums[pattern(rows[r], cols[c])]);
    board.push(row);
  }
  return board;
}

/* ---------- Solver / Eindeutigkeitsprüfung ---------- */
function isAllowedAt(b, r, c, n) {
  for (let i = 0; i < 9; i++) if (b[r][i] === n || b[i][c] === n) return false;
  const br = Math.floor(r/3)*3, bc = Math.floor(c/3)*3;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (b[br+i][bc+j] === n) return false;
  return true;
}
function countSolutionsUpTo(board, limit) {
  const b = board.map(r => r.slice());
  let count = 0;
  function recurse() {
    let bestR = -1, bestC = -1, bestCands = null;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (b[r][c] !== 0) continue;
        const cands = [];
        for (let n = 1; n <= 9; n++) if (isAllowedAt(b, r, c, n)) cands.push(n);
        if (cands.length === 0) return;
        if (bestCands === null || cands.length < bestCands.length) {
          bestR = r; bestC = c; bestCands = cands;
          if (cands.length === 1) break;
        }
      }
      if (bestCands && bestCands.length === 1) break;
    }
    if (bestCands === null) { count++; return; }
    for (const n of bestCands) {
      b[bestR][bestC] = n;
      recurse();
      b[bestR][bestC] = 0;
      if (count >= limit) return;
    }
  }
  recurse();
  return count;
}

function generatePuzzle(difficulty, levelNum) {
  const rand = seededRng(hashSeed(`${difficulty}-v2-${levelNum}`));
  const solved = generateSolved(rand);
  const puzzle = solved.map(r => r.slice());
  const positions = [];
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) positions.push([r, c]);
  shuffleArr(positions, rand);
  const holesTarget = HOLES[difficulty] || 46;
  let removed = 0;
  for (const [r, c] of positions) {
    if (removed >= holesTarget) break;
    const save = puzzle[r][c];
    puzzle[r][c] = 0;
    if (countSolutionsUpTo(puzzle, 2) !== 1) {
      puzzle[r][c] = save;
    } else {
      removed++;
    }
  }
  return { solved, puzzle };
}

/* ---------- Encode / Decode ---------- */
function gridToStr(g) {
  let s = '';
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) s += g[r][c];
  return s;
}

/* ---------- Build ---------- */
async function buildDifficulty(diff) {
  const outFile = path.join(OUT_DIR, `${diff}.json`);
  let existing = [];
  try {
    const raw = await fs.readFile(outFile, 'utf8');
    existing = JSON.parse(raw);
    if (!Array.isArray(existing)) existing = [];
  } catch {}

  const startIdx = existing.length;
  if (startIdx >= COUNT) {
    console.log(`  ✓ ${diff}: bereits ${startIdx}/${COUNT} (skip)`);
    return;
  }
  console.log(`  → ${diff}: starte bei ${startIdx + 1}/${COUNT}`);

  const t0 = Date.now();
  for (let i = startIdx; i < COUNT; i++) {
    const levelNum = i + 1;
    const { solved, puzzle } = generatePuzzle(diff, levelNum);
    existing.push({ p: gridToStr(puzzle), s: gridToStr(solved) });
    if ((existing.length % CHUNK === 0) || existing.length === COUNT) {
      await fs.writeFile(outFile, JSON.stringify(existing));
      const elapsed = (Date.now() - t0) / 1000;
      const perPuzzle = elapsed / (existing.length - startIdx);
      const remaining = (COUNT - existing.length) * perPuzzle;
      console.log(`     ${diff} ${existing.length}/${COUNT} — ${perPuzzle.toFixed(2)}s/Puzzle — ETA ${(remaining / 60).toFixed(1)}min`);
    }
  }
  console.log(`  ✓ ${diff}: ${existing.length} Level fertig`);
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  console.log(`Build → ${OUT_DIR}/  (${COUNT} Level pro Schwierigkeit)`);
  const T0 = Date.now();
  for (const d of DIFFS) {
    await buildDifficulty(d);
  }
  console.log(`Fertig in ${((Date.now() - T0) / 60000).toFixed(1)} min.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
