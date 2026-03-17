import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const compiledSeedPath = resolve(process.cwd(), 'dist/prisma/seed.js');
const sourceSeedPath = resolve(process.cwd(), 'prisma/seed.ts');

function runNode(args) {
  return new Promise((resolveExit, reject) => {
    const child = spawn(process.execPath, args, {
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`Seed process exited due to signal ${signal}`));
        return;
      }

      resolveExit(code ?? 0);
    });
  });
}

async function main() {
  const isRailway = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
  const preferCompiledSeed = isRailway || process.env.NODE_ENV === 'production';

  if (preferCompiledSeed && existsSync(compiledSeedPath)) {
    console.log('[seed] Running compiled seed from dist/prisma/seed.js');
    process.exit(await runNode([compiledSeedPath]));
  }

  if (existsSync(sourceSeedPath)) {
    console.log('[seed] Running TypeScript seed from prisma/seed.ts');
    process.exit(await runNode(['-r', 'ts-node/register', sourceSeedPath]));
  }

  if (existsSync(compiledSeedPath)) {
    console.log('[seed] Running compiled seed from dist/prisma/seed.js');
    process.exit(await runNode([compiledSeedPath]));
  }

  console.error('[seed] No seed entrypoint was found.');
  process.exit(1);
}

main().catch((error) => {
  console.error('[seed] Seed execution failed.');
  console.error(error);
  process.exit(1);
});
