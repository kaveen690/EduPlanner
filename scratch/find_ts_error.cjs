const fs = require('fs');
const path = require('path');
const typescript = require('typescript');

const serverPath = path.join(__dirname, '../server.ts');
const code = fs.readFileSync(serverPath, 'utf8');

const result = typescript.transpileModule(code, {
  compilerOptions: { module: typescript.ModuleKind.CommonJS }
});

const diagnostics = result.diagnostics || [];
console.log('Transpile diagnostics count:', diagnostics.length);
diagnostics.slice(0, 10).forEach(d => {
  console.log('Diagnostic:', d.messageText, 'at pos:', d.start);
});

// Count braces
let openBraces = 0;
const lines = code.split(/\r?\n/);
lines.forEach((l, i) => {
  for (let char of l) {
    if (char === '{') openBraces++;
    if (char === '}') openBraces--;
  }
  if (openBraces < 0) {
    console.log(`Extra closing brace at line ${i + 1}`);
    openBraces = 0;
  }
});
console.log('Final openBraces count at EOF:', openBraces);
