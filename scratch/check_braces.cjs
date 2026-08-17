const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../server.ts'), 'utf8');

let openBraces = 0;
let closeBraces = 0;

for (let i = 0; i < code.length; i++) {
  if (code[i] === '{') openBraces++;
  if (code[i] === '}') closeBraces++;
}

console.log(`Open Braces: ${openBraces}, Close Braces: ${closeBraces}`);
