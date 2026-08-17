const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../server.ts'), 'utf8');
const lines = code.split(/\r?\n/);

console.log('--- Search route at line 1383 ---');
for (let i = 1380; i < 1540; i++) {
  if (lines[i]) console.log(`${i + 1}: ${lines[i]}`);
}
