const fs = require('fs');
const path = require('path');

const litPath = path.join(__dirname, '../src/components/LitReviewGenerator.tsx');
let code = fs.readFileSync(litPath, 'utf8');

console.log('--- Updating LitReviewGenerator.tsx ---');

// 1. Ensure React imports useEffect
if (!code.includes('import React, { useState, useEffect }')) {
  code = code.replace('import React, { useState } from \'react\';', 'import React, { useState, useEffect } from \'react\';');
  console.log('Added useEffect to React import');
}

// 2. Update handleTopicChange to purge inputPapers, rawPastedAbstracts, and review state
const handleTopicMarker = 'const handleTopicChange = (newTopic: string) => {';
if (code.includes(handleTopicMarker)) {
  const newTopicHandler = `const handleTopicChange = (newTopic: string) => {
    console.log('[LR DEBUG] 1. Topic changed:', { researchId: currentResearchId, researchTopic: newTopic, outputLanguage: outputLang });
    setTopic(newTopic);
    const newId = \`res_\${Date.now()}_\${Math.random().toString(36).substring(7)}\`;
    setCurrentResearchId(newId);
    setReview(null);
    setInputPapers([]);
    setRawPastedAbstracts('');
    setGapData(null);
    setMethodologyData(null);
    setScholarResults([]);
  };`;
  code = code.substring(0, code.indexOf(handleTopicMarker)) + newTopicHandler + code.substring(code.indexOf('};', code.indexOf(handleTopicMarker)) + 2);
  console.log('Updated handleTopicChange to purge old topic papers and state');
}

// 3. Add race condition check in handleGenerateLitReview
const genStartMarker = "const handleGenerateLitReview = async (e?: React.FormEvent) => {";
const genStartIdx = code.indexOf(genStartMarker);

if (genStartIdx !== -1) {
  const raceCode = `const handleGenerateLitReview = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim() && inputPapers.length === 0) return;

    const requestResearchId = currentResearchId;
    const requestTopic = topic.trim();

    setReview(null);
    setLoading(true);
    setError(null);
    setProgressPercent(10);
    setProgressStep('Stage 1/7: Initializing research context & literature boundaries...');
    console.log('[LR DEBUG] 3. Generation start:', { researchId: requestResearchId, researchTopic: requestTopic, outputLanguage: outputLang });`;

  const targetSub = code.substring(genStartIdx, code.indexOf('setProgressStep(\'Stage 1/7: Initializing research context & literature boundaries...\');', genStartIdx) + 87);
  code = code.replace(targetSub, raceCode);
  console.log('Updated handleGenerateLitReview with race condition tracking');
}

// 4. Update setReview call in handleGenerateLitReview to check race condition
const setReviewMarker = "setReview(data);";
const setReviewIdx = code.indexOf(setReviewMarker);
if (setReviewIdx !== -1) {
  const raceCheckSetReview = `if (requestResearchId !== currentResearchId || topic.trim() !== requestTopic) {
        console.warn('[LR DEBUG] Race condition prevented: topic changed during generation.');
        return;
      }
      console.log('[LR DEBUG] 6. State update before setReview:', { researchId: data.researchId || requestResearchId, researchTopic: data.title || requestTopic, outputLanguage: data.language || outputLang });
      setReview(data);`;
  code = code.replace(setReviewMarker, raceCheckSetReview);
  console.log('Added race condition check before setReview');
}

// 5. Update render guard for LitReview UI
const oldGuard = "{review && (review.researchId === currentResearchId || review.topic?.toLowerCase().trim() === topic.toLowerCase().trim() || review.title?.toLowerCase().trim() === topic.toLowerCase().trim()) && (";
if (code.includes(oldGuard)) {
  const strictGuard = `{review && review.researchId === currentResearchId && (review.topic?.toLowerCase().trim() === topic.trim().toLowerCase() || review.title?.toLowerCase().trim() === topic.trim().toLowerCase()) && (`;
  code = code.replace(oldGuard, strictGuard);
  console.log('Updated strict UI display validation guard');
}

fs.writeFileSync(litPath, code, 'utf8');
console.log('Successfully updated LitReviewGenerator.tsx!');
