import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const workspaceRoot = resolve(__dirname, '..');
const releaseAppFolderName = 'Diablo2Pets-win32-x64';
const vendorRuntimeRoot = join(workspaceRoot, 'vendor', 'python-runtime', 'win32-x64');
const electronCacheDir =
  process.platform === 'win32' && process.env.LOCALAPPDATA
    ? join(process.env.LOCALAPPDATA, 'electron', 'Cache')
    : null;
const packagerCommand = join(
  workspaceRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'electron-packager.cmd' : 'electron-packager'
);

function run(command, args, cwd = workspaceRoot) {
  const isBatchFile = /\.(cmd|bat)$/i.test(command);
  const result = spawnSync(isBatchFile ? 'cmd.exe' : command, isBatchFile ? ['/d', '/s', '/c', command, ...args] : args, {
    cwd,
    stdio: 'inherit',
    shell: false
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with code ${result.status ?? 'unknown'}`);
  }
}

function copyBundledRuntime(outputRoot) {
  const targetRoot = join(outputRoot, releaseAppFolderName, 'resources', 'python');
  run('powershell.exe', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-Command',
    [
      `$target = [System.IO.Path]::GetFullPath('${targetRoot.replace(/\\/g, '\\\\')}')`,
      `$source = [System.IO.Path]::GetFullPath('${vendorRuntimeRoot.replace(/\\/g, '\\\\')}')`,
      'if (Test-Path $target) { Remove-Item -Path $target -Recurse -Force }',
      'New-Item -ItemType Directory -Path (Split-Path $target) -Force | Out-Null',
      'Copy-Item -Path $source -Destination $target -Recurse -Force'
    ].join('; ')
  ]);
  return targetRoot;
}

run('npm.cmd', ['run', 'make:icon']);
run('npm.cmd', ['run', 'build']);
run('npm.cmd', ['run', 'prepare:python-runtime']);

const packagerBaseArgs = [
  '.',
  'Diablo2Pets',
  '--platform=win32',
  '--arch=x64',
  '--icon',
  'build/icon.ico',
  '--prune=true',
  '--asar.unpackDir=automation/python_runtime',
  '--ignore=^/release',
  '--ignore=^/release-fixed',
  '--ignore=^/src',
  '--ignore=^/docs',
  '--ignore=^/scripts',
  '--ignore=^/vendor',
  '--ignore=^/.git',
  '--ignore=^/node_modules'
];

if (electronCacheDir && existsSync(electronCacheDir)) {
  packagerBaseArgs.push('--electron-zip-dir', electronCacheDir);
}

let outputRoot = join(workspaceRoot, 'release');

try {
  run(packagerCommand, [...packagerBaseArgs, '--out', outputRoot, '--overwrite']);
} catch (error) {
  outputRoot = join(workspaceRoot, 'release-fixed');
  run(packagerCommand, [...packagerBaseArgs, '--out', outputRoot, '--overwrite']);
}

if (!existsSync(vendorRuntimeRoot)) {
  throw new Error(`Bundled Python runtime is missing: ${vendorRuntimeRoot}`);
}

const copiedRuntimeRoot = copyBundledRuntime(outputRoot);
process.stdout.write(`Bundled runtime copied to ${copiedRuntimeRoot}\n`);
