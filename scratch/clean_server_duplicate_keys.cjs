const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '../server.ts');
let code = fs.readFileSync(serverPath, 'utf8');

// Remove duplicate keys from generateDynamicLiteratureReviewSynthesis
const duplicateChunk = `    sec_2_1: parsed.sec_2_1 || parsed.executiveSynthesis || '',
      sec_2_2: parsed.sec_2_2 || '',
      sec_2_3: parsed.sec_2_3 || '',
      sec_2_4: parsed.sec_2_4 || parsed.similaritiesAndConsensus || '',
      sec_2_5: parsed.sec_2_5 || '',
      sec_2_6: parsed.sec_2_6 || '',
      sec_2_7: parsed.sec_2_7 || '',
      sec_2_8: parsed.sec_2_8 || parsed.methodologicalDifferences || '',
      sec_2_9: parsed.sec_2_9 || parsed.criticalAppraisal || '',
      sec_2_10: parsed.sec_2_10 || parsed.researchGaps || '',
      sec_2_11: parsed.sec_2_11 || parsed.sec_2_9 || parsed.criticalAppraisal || '',
      sec_2_12: parsed.sec_2_12 || parsed.sec_2_10 || parsed.futureResearchDirections || ',\n`;

if (code.includes(duplicateChunk)) {
  code = code.replace(duplicateChunk, '');
  console.log('Removed duplicate keys chunk from generateDynamicLiteratureReviewSynthesis');
}

// Add sec_2_1 through sec_2_12 to /api/generate-litreview response object
const litResMarker = "sec_2_10: parsed.sec_2_10";
if (code.includes(litResMarker) && !code.includes("sec_2_11: parsed.sec_2_11")) {
  const replacement = `sec_2_1: parsed.sec_2_1 || '',
      sec_2_2: parsed.sec_2_2 || '',
      sec_2_3: parsed.sec_2_3 || '',
      sec_2_4: parsed.sec_2_4 || '',
      sec_2_5: parsed.sec_2_5 || '',
      sec_2_6: parsed.sec_2_6 || '',
      sec_2_7: parsed.sec_2_7 || '',
      sec_2_8: parsed.sec_2_8 || '',
      sec_2_9: parsed.sec_2_9 || '',
      sec_2_10: parsed.sec_2_10 || '',
      sec_2_11: parsed.sec_2_11 || parsed.sec_2_9 || parsed.criticalAppraisal || '',
      sec_2_12: parsed.sec_2_12 || parsed.sec_2_10 || parsed.futureResearchDirections || ''`;

  code = code.replace(litResMarker, replacement);
  console.log('Added top-level sec_2_1 through sec_2_12 in /api/generate-litreview route');
}

fs.writeFileSync(serverPath, code, 'utf8');
console.log('Successfully cleaned server.ts!');
