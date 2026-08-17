const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '../server.ts');
let content = fs.readFileSync(serverPath, 'utf8');
const lines = content.split(/\r?\n/);

const startIdx = 1922; // 0-indexed 1922 is line 1923
const endIdx = 2086;   // 0-indexed 2085 is line 2086

console.log('Removing lines', startIdx + 1, 'to', endIdx);
console.log('Line 1922:', lines[1921]);
console.log('Line 2088:', lines[2087]);

const newLines = [...lines.slice(0, startIdx), ...lines.slice(endIdx)];
fs.writeFileSync(serverPath, newLines.join('\n'), 'utf8');
console.log('Successfully cleaned server.ts!');
