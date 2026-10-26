// Syntax-check every .js file under src/, test/ and scripts/.
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const files = ['src', 'test', 'scripts'].flatMap((dir) =>
  readdirSync(dir).filter((f) => f.endsWith('.js')).map((f) => join(dir, f)),
);
for (const file of files) execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
console.log(`lint ok (${files.length} files)`);
