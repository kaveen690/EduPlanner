const fs = require('fs');
const path = require('path');

// 1. Add [LR REAL FLOW] to LitReviewGenerator.tsx
const litPath = path.join(__dirname, '../src/components/LitReviewGenerator.tsx');
let litCode = fs.readFileSync(litPath, 'utf8');

if (!litCode.includes('[LR REAL FLOW]')) {
  litCode = litCode.replace(
    'const handleGenerate = async (e?: React.FormEvent) => {',
    `const handleGenerate = async (e?: React.FormEvent) => {
    console.log('[LR REAL FLOW] 1. UI Topic:', topic);
    console.log('[LR REAL FLOW] 2. UI Language:', outputLang);
    console.log('[LR REAL FLOW] 3. UI researchId:', currentResearchId);
    console.log('[LR REAL FLOW] 4. inputPapers count:', inputPapers.length);
    console.log('[LR REAL FLOW] 5. First 3 paper titles:', inputPapers.slice(0, 3).map(p => p.title));`
  );

  litCode = litCode.replace(
    'const data = await aiService.generateLitReview({',
    `console.log('[LR REAL FLOW] 6. Request payload sent from frontend:', { topic: topic.trim(), outputLang, currentResearchId, relevantPapersCount: relevantPapers.length });
      const data = await aiService.generateLitReview({`
  );

  litCode = litCode.replace(
    'setReview(data);',
    `console.log('[LR REAL FLOW] 15. Final topic used for rendering:', data.title || data.topic);
      console.log('[LR REAL FLOW] 16. Final language used for rendering:', data.language);
      setReview(data);`
  );

  fs.writeFileSync(litPath, litCode, 'utf8');
  console.log('Added [LR REAL FLOW] logs to LitReviewGenerator.tsx');
}

// 2. Add [LR REAL FLOW] to server.ts
const serverPath = path.join(__dirname, '../server.ts');
let serverCode = fs.readFileSync(serverPath, 'utf8');

if (!serverCode.includes('[LR REAL FLOW]')) {
  serverCode = serverCode.replace(
    "app.post('/api/generate-litreview', async (req, res) => {",
    `app.post('/api/generate-litreview', async (req, res) => {
  console.log('[LR REAL FLOW] 7. Server received topic:', req.body.topic || req.body.researchContext?.title);
  console.log('[LR REAL FLOW] 8. Server received language:', req.body.language || req.body.researchContext?.outputLanguage);
  console.log('[LR REAL FLOW] 9. Server received researchId:', req.body.researchId || req.body.researchContext?.researchId);
  console.log('[LR REAL FLOW] 10. Server received papers count:', Array.isArray(req.body.papers) ? req.body.papers.length : 0);`
  );

  serverCode = serverCode.replace(
    "const response = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.6 });",
    `console.log('[LR REAL FLOW] 11. Actual Gemini prompt context (first 300 chars):', prompt.substring(0, 300));
    const response = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.6 });
    console.log('[LR REAL FLOW] 12. First 500 characters of Gemini response:', (response.text || '').substring(0, 500));`
  );

  serverCode = serverCode.replace(
    "const parsed = JSON.parse(response.text?.trim() || '{}');",
    `const parsed = JSON.parse(response.text?.trim() || '{}');
    console.log('[LR REAL FLOW] 13. Parsed response keys:', Object.keys(parsed));`
  );

  fs.writeFileSync(serverPath, serverCode, 'utf8');
  console.log('Added [LR REAL FLOW] logs to server.ts');
}
