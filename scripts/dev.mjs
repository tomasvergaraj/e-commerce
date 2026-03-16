import { spawn } from 'node:child_process';
import process from 'node:process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const processes = [
  runProcess('backend', ['run', 'start:dev'], 'backend'),
  runProcess('frontend', ['run', 'dev'], 'frontend'),
];

let shuttingDown = false;

function runProcess(name, args, cwd) {
  const child =
    process.platform === 'win32'
      ? spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `${npmCommand} ${args.join(' ')}`], {
          cwd,
          env: process.env,
          shell: false,
          stdio: ['inherit', 'pipe', 'pipe'],
        })
      : spawn(npmCommand, args, {
          cwd,
          env: process.env,
          shell: false,
          stdio: ['inherit', 'pipe', 'pipe'],
        });

  pipeOutput(child.stdout, name);
  pipeOutput(child.stderr, name);

  child.on('exit', (code, signal) => {
    if (shuttingDown) {
      return;
    }

    if (code === 0 || signal === 'SIGTERM') {
      shutdown(0);
      return;
    }

    console.error(`[${name}] exited with code ${code ?? 'unknown'}`);
    shutdown(code ?? 1);
  });

  child.on('error', (error) => {
    console.error(`[${name}] failed to start: ${error.message}`);
    shutdown(1);
  });

  return child;
}

function pipeOutput(stream, name) {
  let buffer = '';

  stream.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.length > 0) {
        console.log(`[${name}] ${line}`);
      }
    }
  });

  stream.on('end', () => {
    if (buffer.length > 0) {
      console.log(`[${name}] ${buffer}`);
    }
  });
}

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  const terminations = processes.map((child) => terminateProcess(child));
  Promise.allSettled(terminations).finally(() => {
    process.exit(exitCode);
  });
}

function terminateProcess(child) {
  if (!child || child.killed || child.exitCode !== null) {
    return Promise.resolve();
  }

  if (process.platform === 'win32') {
    return new Promise((resolve) => {
      const killer = spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
        stdio: 'ignore',
        shell: false,
      });
      killer.on('exit', () => resolve());
      killer.on('error', () => resolve());
    });
  }

  child.kill('SIGTERM');
  return Promise.resolve();
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
