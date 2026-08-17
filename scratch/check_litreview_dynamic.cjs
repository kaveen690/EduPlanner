const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../server.ts'), 'utf8');
const lines = code.split(/\r?\n/);

console.log('--- generateDynamicLiteratureReviewSynthesis ---');
for (let i = 2550; i < 2640; i++) {
  if (lines[i]) console.log(`${i + 1}: ${lines[i]}`);
}
