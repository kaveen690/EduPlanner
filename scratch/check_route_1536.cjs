const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../server.ts'), 'utf8');
const lines = code.split(/\r?\n/);

for (let i = 1534; i < 1590; i++) {
  if (lines[i]) console.log(`${i + 1}: ${lines[i]}`);
}
