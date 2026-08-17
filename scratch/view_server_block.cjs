const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../server.ts'), 'utf8');
const lines = content.split(/\r?\n/);
console.log('Total lines:', lines.length);
fs.writeFileSync(path.join(__dirname, 'server_block.txt'), lines.slice(1460, 1860).map((l, i) => `${i + 1461}: ${l}`).join('\n'));
console.log('Wrote lines 1461 to 1860 to scratch/server_block.txt');
