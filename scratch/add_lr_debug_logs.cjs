const fs = require('fs');
const path = require('path');

// 1. Update LitReviewGenerator.tsx with [LR DEBUG] logs
const litPath = path.join(__dirname, '../src/components/LitReviewGenerator.tsx');
let litCode = fs.readFileSync(litPath, 'utf8');

// Debug Log 1: Topic change
if (!litCode.includes('[LR DEBUG] Topic changed')) {
  litCode = litCode.replace(
    'const handleTopicChange = (newTopic: string) => {',
    `const handleTopicChange = (newTopic: string) => {
    console.log('[LR DEBUG] 1. Topic changed:', { researchId: currentResearchId, researchTopic: newTopic, outputLanguage: outputLang });`
  );
}

// Debug Log 2: Output language change
if (!litCode.includes('[LR DEBUG] Output language changed')) {
  litCode = litCode.replace(
    'setOutputLang(lang);',
    `setOutputLang(lang);
    console.log('[LR DEBUG] 2. Output language changed:', { researchId: currentResearchId, researchTopic: topic, outputLanguage: lang });`
  );
}

// Debug Log 3: Generation start
if (!litCode.includes('[LR DEBUG] Generation start')) {
  litCode = litCode.replace(
    'setProgressStep(\'Stage 1/7: Initializing research context & literature boundaries...\');',
    `setProgressStep('Stage 1/7: Initializing research context & literature boundaries...');
    console.log('[LR DEBUG] 3. Generation start:', { researchId: currentResearchId, researchTopic: topic, outputLanguage: outputLang });`
  );
}

// Debug Log 6: Before LitReview state update
if (!litCode.includes('[LR DEBUG] State update')) {
  litCode = litCode.replace(
    'setReview(data);',
    `console.log('[LR DEBUG] 6. State update before setReview:', { researchId: data.researchId || currentResearchId, researchTopic: data.title || topic, outputLanguage: data.language || outputLang });
      setReview(data);`
  );
}

// Debug Log 7: Before LitReview render
if (!litCode.includes('[LR DEBUG] Rendering LitReview')) {
  litCode = litCode.replace(
    '{review && (review.researchId === currentResearchId || review.topic?.toLowerCase().trim() === topic.toLowerCase().trim() || review.title?.toLowerCase().trim() === topic.toLowerCase().trim()) && (',
    `{(() => {
        if (review) {
          console.log('[LR DEBUG] 7. Rendering LitReview UI:', { researchId: review.researchId, reviewTitle: review.title, currentTopic: topic, outputLanguage: review.language });
        }
        return null;
      })()}
      {review && (review.researchId === currentResearchId || review.topic?.toLowerCase().trim() === topic.toLowerCase().trim() || review.title?.toLowerCase().trim() === topic.toLowerCase().trim()) && (`
  );
}

fs.writeFileSync(litPath, litCode, 'utf8');
console.log('Added [LR DEBUG] logs to LitReviewGenerator.tsx');

// 2. Update server.ts with [LR DEBUG] logs 4 & 5
const serverPath = path.join(__dirname, '../server.ts');
let serverCode = fs.readFileSync(serverPath, 'utf8');

if (!serverCode.includes('[LR DEBUG] 4. Immediately before Gemini API request')) {
  serverCode = serverCode.replace(
    'const prompt = `',
    `console.log('[LR DEBUG] 4. Immediately before Gemini API request:', { researchId: currentResearchId, researchTopic: cleanTopic, outputLanguage: normalizedLang });
  const prompt = \``
  );
}

if (!serverCode.includes('[LR DEBUG] 5. Immediately after Gemini API response')) {
  serverCode = serverCode.replace(
    'const response = await callGemini(prompt, { responseMimeType: \'application/json\', temperature: 0.6 });',
    `const response = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.6 });
    console.log('[LR DEBUG] 5. Immediately after Gemini API response:', { researchId: currentResearchId, researchTopic: cleanTopic, outputLanguage: normalizedLang, status: 'Success' });`
  );
}

fs.writeFileSync(serverPath, serverCode, 'utf8');
console.log('Added [LR DEBUG] logs to server.ts');
