// Static assembly adapted from connectedGraph/zhihu-immersive-reader build.js (MIT, v5.1.6).
const fs = require('node:fs');
const path = require('node:path');
const { Script } = require('node:vm');

const scripts = [
  'src/adapters/route.js',
  'src/adapters/dom.js',
  'src/core/state.js',
  'src/renderer/reader-shell.js',
  'src/core/lifecycle.js',
  'src/core/start.js',
];

const stylesheets = [
  'src/styles/tokens.css',
  'src/styles/layout.css',
  'src/styles/typography.css',
  'src/styles/components.css',
];

function readSource(file) {
  return fs.readFileSync(path.join(__dirname, file), 'utf8').replace(/\r\n/g, '\n').trimEnd();
}

const output = [
  readSource('src/core/userscript.meta.js'),
  '',
  '/*',
  readSource('LICENSE'),
  '*/',
  '',
  '(() => {',
  "  'use strict';",
  'const READER_CSS = ' + JSON.stringify(stylesheets.map(readSource).join('\n\n')) + ';',
  ...scripts.map(file => '\n// ' + file + '\n' + readSource(file)),
  '})();',
  '',
].join('\n');

const filename = 'bundle.user.js';
new Script(output, { filename });
const dist = path.join(__dirname, 'dist');
fs.mkdirSync(dist, { recursive: true });
const workingDirectory = fs.mkdtempSync(path.join(dist, '.build-'));
try {
  const temporary = path.join(workingDirectory, filename);
  fs.writeFileSync(temporary, output, 'utf8');
  fs.renameSync(temporary, path.join(dist, filename));
} finally {
  fs.rmSync(workingDirectory, { recursive: true, force: true });
}
console.log('Built dist/' + filename);
