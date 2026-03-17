import { spawn } from 'node:child_process';

function getEnvValue(...names) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) {
      return value;
    }
  }

  return '';
}

function buildDatabaseUrl(prefix) {
  const host = getEnvValue(`${prefix}HOST`);
  const port = getEnvValue(`${prefix}PORT`) || '5432';
  const user = getEnvValue(`${prefix}USER`);
  const password = getEnvValue(`${prefix}PASSWORD`);
  const database = getEnvValue(`${prefix}DATABASE`);
  const sslmode = getEnvValue(`${prefix}SSLMODE`);

  if (!host || !user || !password || !database) {
    return '';
  }

  const auth = `${encodeURIComponent(user)}:${encodeURIComponent(password)}`;
  const baseUrl = `postgresql://${auth}@${host}:${port}/${database}`;

  return sslmode ? `${baseUrl}?sslmode=${encodeURIComponent(sslmode)}` : baseUrl;
}

function resolveDatabaseUrl() {
  return (
    getEnvValue('DATABASE_URL', 'DATABASE_PRIVATE_URL', 'DATABASE_PUBLIC_URL', 'POSTGRES_URL') ||
    buildDatabaseUrl('PG') ||
    buildDatabaseUrl('POSTGRES_')
  );
}

function getCommandName(command) {
  return process.platform === 'win32' ? `${command}.cmd` : command;
}

function run(command, args, env) {
  return new Promise((resolve, reject) => {
    const useShell = process.platform === 'win32' && command.endsWith('.cmd');
    const child = spawn(command, args, {
      env,
      shell: useShell,
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (signal) {
        reject(new Error(`${command} exited due to signal ${signal}`));
        return;
      }

      resolve(code ?? 0);
    });
  });
}

async function main() {
  const databaseUrl = resolveDatabaseUrl();

  if (!databaseUrl) {
    console.error('[startup] Missing database connection configuration.');
    console.error(
      '[startup] Set DATABASE_URL in Railway or create a service variable reference like ${{Postgres.DATABASE_URL}}.',
    );
    console.error(
      '[startup] As a fallback, this container also accepts PGHOST, PGPORT, PGUSER, PGPASSWORD and PGDATABASE.',
    );
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = databaseUrl;
    console.log('[startup] DATABASE_URL was assembled from fallback database variables.');
  } else {
    console.log('[startup] DATABASE_URL detected.');
  }

  console.log('[startup] Running Prisma migrations...');
  const prismaExitCode = await run(
    getCommandName('npx'),
    ['prisma', 'migrate', 'deploy'],
    process.env,
  );

  if (prismaExitCode !== 0) {
    process.exit(prismaExitCode);
  }

  console.log('[startup] Launching NestJS application...');
  const appExitCode = await run('node', ['dist/src/main.js'], process.env);
  process.exit(appExitCode);
}

main().catch((error) => {
  console.error('[startup] Container startup failed.');
  console.error(error);
  process.exit(1);
});
