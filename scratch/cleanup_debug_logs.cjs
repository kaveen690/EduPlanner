const fs = require('fs');
const path = require('path');

// 1. Clean LitReviewGenerator.tsx
const litPath = path.join(__dirname, '../src/components/LitReviewGenerator.tsx');
let litCode = fs.readFileSync(litPath, 'utf8');

litCode = litCode.replace(/console\.log\('\[LR REAL FLOW\].*?\);\n?/g, '');
litCode = litCode.replace(/console\.log\('\[LR DEBUG\].*?\);\n?/g, '');

fs.writeFileSync(litPath, litCode, 'utf8');
console.log('Cleaned debug logs from LitReviewGenerator.tsx');

// 2. Clean server.ts
const serverPath = path.join(__dirname, '../server.ts');
let serverCode = fs.readFileSync(serverPath, 'utf8');

serverCode = serverCode.replace(/console\.log\('\[LR REAL FLOW\].*?\);\n?/g, '');
serverCode = serverCode.replace(/console\.log\('\[LR DEBUG\].*?\);\n?/g, '');

fs.writeFileSync(serverPath, serverCode, 'utf8');
console.log('Cleaned debug logs from server.ts');
