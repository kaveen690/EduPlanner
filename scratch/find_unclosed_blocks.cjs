const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../server.ts'), 'utf8');
const lines = code.split(/\r?\n/);

let openBraces = 0;
let lastZeroLine = 0;

lines.forEach((l, i) => {
  const prevBraces = openBraces;
  for (let char of l) {
    if (char === '{') openBraces++;
    if (char === '}') openBraces--;
  }
  if (prevBraces === 0 && openBraces > 0) {
    console.log(`Block start at line ${i + 1}: ${l.trim().slice(0, 60)}`);
  }
  if (prevBraces > 0 && openBraces === 0) {
    lastZeroLine = i + 1;
  }
});

console.log('Last line where openBraces hit 0:', lastZeroLine);
console.log('Total lines:', lines.length);
console.log('Remaining open braces at EOF:', openBraces);
