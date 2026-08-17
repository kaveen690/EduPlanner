const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '../server.ts'), 'utf8');
const lines = code.split(/\r?\n/);

const stack = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '{') {
      stack.push({ line: i + 1, text: line.trim() });
    } else if (line[j] === '}') {
      if (stack.length > 0) {
        stack.pop();
      } else {
        console.log(`Extra close brace at line ${i + 1}`);
      }
    }
  }
}

console.log('Unclosed open braces count:', stack.length);
stack.slice(-5).forEach(item => {
  console.log(`Unclosed brace opened at line ${item.line}: "${item.text}"`);
});
