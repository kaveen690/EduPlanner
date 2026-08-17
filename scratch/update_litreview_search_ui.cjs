const fs = require('fs');
const path = require('path');

const litPath = path.join(__dirname, '../src/components/LitReviewGenerator.tsx');
let code = fs.readFileSync(litPath, 'utf8');

// 1. Add state variables for searchExplanation & expandedConcepts
const stateMarker = "const [scholarError, setScholarError] = useState<string | null>(null);";
if (code.includes(stateMarker)) {
  const replacementState = `const [scholarError, setScholarError] = useState<string | null>(null);
  const [searchExplanation, setSearchExplanation] = useState<string | null>(null);
  const [expandedConcepts, setExpandedConcepts] = useState<string[]>([]);`;
  code = code.replace(stateMarker, replacementState);
  console.log("Updated state variables");
}

// 2. Update handleScholarSearch
const handleStart = "const handleScholarSearch = async (e?: React.FormEvent) => {";
const handleEnd = "  const handleAddScholarPaperToQueue = (item: AcademicSearchResultItem) => {";

const startIdx = code.indexOf(handleStart);
const endIdx = code.indexOf(handleEnd);

if (startIdx !== -1 && endIdx !== -1) {
  const newHandleCode = `const handleScholarSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const queryToSearch = scholarQuery.trim() || topic.trim() || 'Academic Literature Synthesis';

    setSearchingScholar(true);
    setScholarError(null);
    setSearchExplanation(null);

    try {
      const res = await aiService.searchAcademicPapers({
        query: queryToSearch,
        source: scholarSource,
        year: scholarYear,
        language: outputLang,
        researchContext: {
          title: topic || queryToSearch,
          field,
          academicLevel,
          researchType: 'Quantitative',
          proposalDepth: 'Standard',
          language: outputLang
        }
      });

      if (res && res.results && res.results.length > 0) {
        setScholarResults(res.results);
        if (res.searchExplanation) setSearchExplanation(res.searchExplanation);
        if (res.expandedConcepts) setExpandedConcepts(res.expandedConcepts);
      } else {
        setScholarResults([]);
        setScholarError(\`No peer-reviewed publications found matching "\${queryToSearch}". Multiple academic query variations were attempted across CrossRef & OpenAlex databases.\`);
      }
    } catch (err: any) {
      console.error('[Scholar Search Error]:', err);
      setScholarError(err?.message || 'Failed to retrieve academic search results.');
    } finally {
      setSearchingScholar(false);
    }
  };\n\n`;

  code = code.substring(0, startIdx) + newHandleCode + code.substring(endIdx);
  console.log("Updated handleScholarSearch");
}

// 3. Add Search Explanation Banner & Badges in Search Modal
const modalResultsStart = "{scholarResults.map(item => {";
if (code.includes(modalResultsStart)) {
  const replacementModalResults = `{searchExplanation && !searchingScholar && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{searchExplanation}</span>
                  </div>
                </div>
              )}

              {scholarResults.map(item => {`;
  code = code.replace(modalResultsStart, replacementModalResults);
  console.log("Added Search Explanation Banner");
}

fs.writeFileSync(litPath, code, 'utf8');
console.log("Successfully updated LitReviewGenerator.tsx!");
