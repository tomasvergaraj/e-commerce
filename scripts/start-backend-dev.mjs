import { execFileSync, spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const backendDir = path.join(repoRoot, 'backend');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const backendPort = getBackendPort();

await freeBackendPort(backendPort);
await startBackend();

function getBackendPort() {
  const envFiles = [
    path.join(backendDir, '.env'),
    path.join(repoRoot, '.env'),
  ];

  for (const filePath of envFiles) {
    const value = readEnvValue(filePath, 'PORT');
    if (value) {
      const parsed = Number.parseInt(value, 10);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  const processPort = Number.parseInt(process.env.PORT || '', 10);
  return Number.isNaN(processPort) ? 3000 : processPort;
}

function readEnvValue(filePath, key) {
  if (!existsSync(filePath)) {
    return null;
  }

  const fileContent = readFileSync(filePath, 'utf8');
  const lines = fileContent.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const currentKey = trimmed.slice(0, separatorIndex).trim();
    if (currentKey !== key) {
      continue;
    }

    return trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
  }

  return null;
}

async function freeBackendPort(port) {
  const pids = getListeningPids(port);

  if (pids.length === 0) {
    return;
  }

  for (const pid of pids) {
    const processName = getProcessName(pid);

    if (!processName) {
      throw new Error(`No pudimos identificar el proceso que usa el puerto ${port} (PID ${pid}).`);
    }

    if (!isNodeProcess(processName)) {
      throw new Error(`El puerto ${port} esta siendo usado por ${processName} (PID ${pid}). Liberalo manualmente o cambia PORT.`);
    }

    console.log(`[backend] Cerrando proceso previo en puerto ${port} (PID ${pid})...`);
    killProcess(pid);
  }

  await wait(400);
}

function getListeningPids(port) {
  if (process.platform === 'win32') {
    const output = execFileSync('netstat', ['-ano', '-p', 'tcp'], { encoding: 'utf8' });
    const pids = new Set();

    for (const line of output.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('TCP')) {
        continue;
      }

      const columns = trimmed.split(/\s+/);
      if (columns.length < 5) {
        continue;
      }

      const localAddress = columns[1];
      const state = columns[3];
      const pid = columns[4];

      if (state !== 'LISTENING' || !localAddress.endsWith(`:${port}`) || pid === '0') {
        continue;
      }

      pids.add(Number.parseInt(pid, 10));
    }

    return Array.from(pids).filter((pid) => !Number.isNaN(pid) && pid !== process.pid);
  }

  try {
    const output = execFileSync('lsof', ['-ti', `tcp:${port}`], { encoding: 'utf8' });
    return output
      .split(/\r?\n/)
      .map((value) => Number.parseInt(value.trim(), 10))
      .filter((pid) => !Number.isNaN(pid) && pid !== process.pid);
  } catch {
    return [];
  }
}

function getProcessName(pid) {
  if (process.platform === 'win32') {
    const output = execFileSync('tasklist', ['/FI', `PID eq ${pid}`, '/FO', 'CSV', '/NH'], { encoding: 'utf8' }).trim();
    if (!output || output.startsWith('INFO:')) {
      return null;
    }

    const match = output.match(/^"([^"]+)"/);
    return match ? match[1] : null;
  }

  try {
    return execFileSync('ps', ['-p', String(pid), '-o', 'comm='], { encoding: 'utf8' }).trim() || null;
  } catch {
    return null;
  }
}

function isNodeProcess(processName) {
  return processName.toLowerCase().includes('node');
}

function killProcess(pid) {
  if (process.platform === 'win32') {
    execFileSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
    return;
  }

  process.kill(pid, 'SIGTERM');
}

async function startBackend() {
  console.log(`[backend] Iniciando Nest en puerto ${backendPort}...`);

  const child =
    process.platform === 'win32'
      ? spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `${npmCommand} run start:dev:raw`], {
          cwd: backendDir,
          env: process.env,
          stdio: 'inherit',
          shell: false,
        })
      : spawn(npmCommand, ['run', 'start:dev:raw'], {
          cwd: backendDir,
          env: process.env,
          stdio: 'inherit',
          shell: false,
        });

  const shutdown = () => terminateChild(child);
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  await new Promise((resolve, reject) => {
    child.on('exit', (code, signal) => {
      process.off('SIGINT', shutdown);
      process.off('SIGTERM', shutdown);

      if (signal === 'SIGTERM' || code === 0) {
        resolve();
        return;
      }

      reject(new Error(`El backend termino con codigo ${code ?? 'desconocido'}.`));
    });

    child.on('error', (error) => {
      process.off('SIGINT', shutdown);
      process.off('SIGTERM', shutdown);
      reject(error);
    });
  });
}

function terminateChild(child) {
  if (!child || child.killed || child.exitCode !== null) {
    return;
  }

  if (process.platform === 'win32') {
    try {
      execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    } catch {}
    return;
  }

  child.kill('SIGTERM');
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
