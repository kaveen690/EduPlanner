const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../server.ts'), 'utf8');
const lines = content.split(/\r?\n/);
const sliced = lines.slice(1500, 1600).map((l, i) => `${i + 1501}: ${l}`).join('\n');
fs.writeFileSync(path.join(__dirname, 'fallback_head.txt'), sliced);
console.log('Extracted lines 1501 to 1600');
