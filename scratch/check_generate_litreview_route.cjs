const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../server.ts'), 'utf8');
const lines = code.split(/\r?\n/);

console.log('--- /api/generate-litreview route (lines 2680 to 2860) ---');
for (let i = 2680; i < 2860; i++) {
  if (lines[i]) console.log(`${i + 1}: ${lines[i]}`);
}
