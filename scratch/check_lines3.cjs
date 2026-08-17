const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../server.ts'), 'utf8');
const lines = content.split(/\r?\n/);
for (let i = 1530; i < 1545; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
