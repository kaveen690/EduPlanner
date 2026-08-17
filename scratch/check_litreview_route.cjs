const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../server.ts'), 'utf8');
const lines = code.split(/\r?\n/);
for (let i = 2530; i < 2650; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
