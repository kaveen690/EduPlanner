const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../server.ts'), 'utf8');
const lines = code.split(/\r?\n/);

console.log('--- Search route 1 (around 1536) ---');
for (let i = 1535; i < 1580; i++) {
  if (lines[i]) console.log(`${i + 1}: ${lines[i]}`);
}

console.log('\n--- Search route 2 (around 3850) ---');
for (let i = 3845; i < 3870; i++) {
  if (lines[i]) console.log(`${i + 1}: ${lines[i]}`);
}
