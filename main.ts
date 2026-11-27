// DompetKeluarga — program hand-in (program/v1, Node 22+, stdlib only).
// Menyalin app/ dan screenshots/ ke direktori output, lalu menulis
// dossier.json dengan buildDossier dari vendor/makefun-frontend.ts.
// Tidak pernah menghapus apa pun: /output di-mount oleh grader,
// perintah hapus di sana akan gagal dengan EBUSY.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const root = dirname(fileURLToPath(import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(root, 'app'), join(out, 'app'), { recursive: true });

mkdirSync(join(out, 'screenshots'), { recursive: true });
const shotsDir = join(root, 'screenshots');
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });
}

const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216
});

// buildDossier mengembalikan byte dossier (Uint8Array): tulis mentah
// apa adanya supaya cocok byte-per-byte dengan hasil build ulang grader.
writeFileSync(
  join(out, 'dossier.json'),
  typeof dossier === 'string' ? dossier : Buffer.from(dossier)
);

console.log('dossier.json ditulis ke ' + join(out, 'dossier.json'));
