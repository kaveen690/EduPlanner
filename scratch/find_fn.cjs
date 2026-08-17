const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/lib/exportUtils.ts'), 'utf8');
const lines = content.split(/\r?\n/);
lines.forEach((l, i) => {
  if (l.includes('exportProposalToWord') || l.includes('exportProposalToPdf')) {
    console.log(`${i + 1}: ${l}`);
  }
});
