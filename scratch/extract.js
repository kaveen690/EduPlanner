const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../server.ts'), 'utf8');
const lines = content.split(/\r?\n/);
const sliced = lines.slice(1460, 1850).map((l, i) => `${i + 1461}: ${l}`).join('\n');
fs.writeFileSync(path.join(__dirname, 'proposal_routes.txt'), sliced);
console.log('Extracted lines 1461 to 1850');
