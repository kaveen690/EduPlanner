const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../server.ts'), 'utf8');
const lines = code.split(/\r?\n/);

console.log('--- generateDynamicLiteratureReviewSynthesis (lines 2545 to 2640) ---');
for (let i = 2544; i < 2640; i++) {
  if (lines[i]) console.log(`${i + 1}: ${lines[i]}`);
}
