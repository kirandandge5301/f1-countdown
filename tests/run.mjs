// Runs "vitest run". On Windows, a terminal opened in "c:\..." (VS Code does this) instead of
// "C:\..." makes vitest load itself twice and fail, so the drive letter is normalised first.
import { spawnSync } from 'node:child_process';
const cwd = process.cwd().replace(/^[a-z]:/, d => d.toUpperCase());
const run = spawnSync(process.execPath, [`${cwd}/node_modules/vitest/vitest.mjs`, 'run'], { cwd, stdio: 'inherit' });
process.exit(run.status ?? 1);
