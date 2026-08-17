const fs = require('fs');
const path = require('path');

const litPath = path.join(__dirname, '../src/components/LitReviewGenerator.tsx');
let code = fs.readFileSync(litPath, 'utf8');

// 1. Add currentResearchId state & useEffect to sync outputLang with lang prop
const stateMarker = "const [outputLang, setOutputLang] = useState<Language>(lang);";
if (code.includes(stateMarker)) {
  const newStateCode = `const [outputLang, setOutputLang] = useState<Language>(lang);
  const [currentResearchId, setCurrentResearchId] = useState<string>(() => \`res_\${Date.now()}_\${Math.random().toString(36).substring(7)}\`);

  useEffect(() => {
    setOutputLang(lang);
  }, [lang]);

  const handleTopicChange = (newTopic: string) => {
    setTopic(newTopic);
    // Automatically generate a new research session ID and purge old review content on topic change
    const newId = \`res_\${Date.now()}_\${Math.random().toString(36).substring(7)}\`;
    setCurrentResearchId(newId);
    setReview(null);
    setGapData(null);
    setMethodologyData(null);
  };`;

  code = code.replace(stateMarker, newStateCode);
  console.log("Added currentResearchId and handleTopicChange");
}

// 2. Replace setTopic in topic input onChange
code = code.replace("onChange={e => setTopic(e.target.value)}", "onChange={e => handleTopicChange(e.target.value)}");

// 3. Update handleGenerateLitReview to pass researchId
const genMarker = "const data = await aiService.generateLitReview({";
if (code.includes(genMarker)) {
  const newGenCode = `const data = await aiService.generateLitReview({
        researchId: currentResearchId,
        researchContext: {
          title: topic.trim(),
          field,
          academicLevel: (academicLevel as any) || "Master's",
          researchType: 'Quantitative',
          proposalDepth: 'Standard',
          language: outputLang,
          outputLanguage: outputLang
        },`;
  code = code.replace(genMarker, newGenCode);
  console.log("Updated handleGenerateLitReview with researchId");
}

// 4. Add Frontend Display Guard before rendering generated Literature Review
const renderReviewMarker = "{review && (";
if (code.includes(renderReviewMarker)) {
  const guardCode = `{review && (review.researchId === currentResearchId || review.topic?.toLowerCase().trim() === topic.toLowerCase().trim() || review.title?.toLowerCase().trim() === topic.toLowerCase().trim()) && (`;
  code = code.replace(renderReviewMarker, guardCode);
  console.log("Added Frontend Display Validation Guard");
}

fs.writeFileSync(litPath, code, 'utf8');
console.log("Successfully updated LitReviewGenerator.tsx!");
