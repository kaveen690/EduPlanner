const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '../server.ts');
let code = fs.readFileSync(serverPath, 'utf8');

console.log('--- Updating server.ts ---');

// 1. Ensure normalizeOutputLanguage & validateSemanticTopicProfile are defined properly
if (!code.includes('function normalizeOutputLanguage')) {
  const helpers = `function normalizeOutputLanguage(lang: string | undefined): 'kurdish' | 'arabic' | 'english' {
  if (!lang) return 'english';
  const l = String(lang).toLowerCase().trim();
  if (l === 'kurdish' || l === 'badini' || l === 'bad' || l === 'sorani' || l === 'ku' || l === 'ckb' || l === 'کوردی') {
    return 'kurdish';
  }
  if (l === 'arabic' || l === 'ar' || l === 'العربية') {
    return 'arabic';
  }
  return 'english';
}

function validateSemanticTopicProfile(text: string, topic: string): {
  isRelevant: boolean;
  score: number;
  offTopicTermsFound: string[];
} {
  if (!text || !topic) return { isRelevant: true, score: 100, offTopicTermsFound: [] };

  const textLower = text.toLowerCase();
  const topicLower = topic.toLowerCase();

  const offTopicTriggers = [
    { term: 'artificial intelligence', flag: !topicLower.includes('artificial intelligence') && !topicLower.includes('الذكاء الاصطناعي') && !topicLower.includes('ژیرییا دەستکرد') },
    { term: 'higher education', flag: !topicLower.includes('higher education') && !topicLower.includes('جامعي') && !topicLower.includes('التعليم العالي') && !topicLower.includes('خوێندنا بڵند') && !topicLower.includes('باخچەی منداڵان') && !topicLower.includes('kindergarten') },
    { term: 'university students', flag: !topicLower.includes('university') && !topicLower.includes('جامع') && !topicLower.includes('قوتابیانی زانکۆ') },
    { term: 'university teachers', flag: !topicLower.includes('university') && !topicLower.includes('جامع') },
    { term: 'automated grading', flag: !topicLower.includes('grading') },
    { term: 'predictive student modelling', flag: !topicLower.includes('modelling') },
    { term: 'ai literacy', flag: !topicLower.includes('literacy') && !topicLower.includes('هۆشیاری داهێنان') },
    { term: 'inflation', flag: !topicLower.includes('inflation') && !topicLower.includes('تضخم') }
  ];

  const found: string[] = [];
  offTopicTriggers.forEach(item => {
    if (item.flag && textLower.includes(item.term)) {
      found.push(item.term);
    }
  });

  const isRelevant = found.length === 0;
  const score = isRelevant ? 100 : 30;

  return {
    isRelevant,
    score,
    offTopicTermsFound: found
  };
}\n\n`;

  const pos = code.indexOf('function validateLanguageConsistency');
  if (pos !== -1) {
    code = code.substring(0, pos) + helpers + code.substring(pos);
    console.log('Added normalizeOutputLanguage and validateSemanticTopicProfile helpers');
  }
}

// 2. Fix generateDynamicProposalFallback introKeyTerms (Line ~1335)
code = code.replace(
  `: \`1. Technology Acceptance: The operational commitment and behavioral intention of faculty members to incorporate digital and AI-driven tools into academic workflows (Davis, 1989).\\n2. Perceived Usefulness: The degree to which an educator believes that utilizing educational technology tools will enhance instructional performance and productivity (Venkatesh et al., 2003).\\n3. Perceived Ease of Use: The extent to which an educator anticipates that using a specific technological system will be free from effort.\\n4. AI Literacy: The technical competence, pedagogical awareness, and ethical reflection required to effectively leverage artificial intelligence models in academic settings.\`;`,
  `: \`1. Primary Independent Construct: Operational conceptualization and baseline measurement of core independent dimensions governing "\${cleanTopic}".\\n2. Dependent Outcome Variable: Primary empirical outcome and performance indicators analyzed across sample cohorts.\\n3. Contextual Dynamics: Environmental and structural parameters moderating the relationships within the target context.\`;`
);
console.log('Cleaned hardcoded Davis/Venkatesh/AI Literacy from introKeyTerms in generateDynamicProposalFallback');

// 3. Fix generateFallbackMethodology (Line ~2969)
code = code.replace(
  `const topicStr = topic || "University Teachers' Acceptance and Perceptions of Artificial Intelligence in Higher Education";`,
  `if (!topic || !topic.trim()) { throw new Error('Research topic is required for methodology generation'); }\n  const topicStr = topic.trim();`
);
code = code.replace(
  `const sec_3_5 = \`The primary research instrument is a structured self-administered quantitative questionnaire using a 5-point Likert scale (1 = Strongly Disagree to 5 = Strongly Agree). The instrument contains two core sections: Section A (Demographic Profile: Gender, Academic Rank, Teaching Experience) and Section B (Construct Items measuring AI Literacy, Performance Expectancy, Effort Expectancy, and Behavioral Intention).\`;`,
  `const sec_3_5 = \`The primary research instrument is a structured self-administered quantitative questionnaire using a 5-point Likert scale (1 = Strongly Disagree to 5 = Strongly Agree). The instrument contains two core sections: Section A (Demographic Profile & Contextual Metadata) and Section B (Construct Items measuring core variables governing "\${topicStr}").\`;`
);
console.log('Cleaned hardcoded fallback topic and AI Literacy constructs from generateFallbackMethodology');

// 4. Update /api/generate-litreview route to return explicit HTTP error on failure without fallback contamination
const litRouteStart = "app.post('/api/generate-litreview', async (req, res) => {";
const litRouteStartIdx = code.indexOf(litRouteStart);
const litRouteEndMarker = "// 2.4 Dynamic Proposal Fallback Generator";
const litRouteEndIdx = code.indexOf(litRouteEndMarker, litRouteStartIdx);

if (litRouteStartIdx !== -1 && litRouteEndIdx !== -1) {
  const strictLitRoute = `app.post('/api/generate-litreview', async (req, res) => {
  const {
    topic,
    field,
    citationStyle,
    language,
    academicLevel,
    targetLength,
    researchQuestions,
    researchObjectives,
    papersContext,
    papers,
    researchContext,
    researchId
  } = req.body;

  const currentResearchId = researchId || researchContext?.researchId || \`res_\${Date.now()}_\${Math.random().toString(36).substring(7)}\`;
  const rawTopic = (researchContext?.title || topic || '').trim();
  if (!rawTopic) {
    return res.status(400).json({ error: 'Core Research Title / Topic is required for Literature Review generation.' });
  }

  const cleanTopic = rawTopic;
  const normalizedLang = normalizeOutputLanguage(language || researchContext?.outputLanguage || researchContext?.language);
  const langInstruction = getLanguageInstructions(language || 'en');
  const levelStr = academicLevel || researchContext?.academicLevel || "Master's Thesis";
  const reqQuestionsText = researchQuestions ? (Array.isArray(researchQuestions) ? researchQuestions.map((q: any) => typeof q === 'string' ? q : (q.text || '')).join('; ') : String(researchQuestions)) : '';
  const reqObjText = researchObjectives ? (Array.isArray(researchObjectives) ? researchObjectives.map((o: any) => typeof o === 'string' ? o : (o.text || '')).join('; ') : String(researchObjectives)) : '';

  // Filter papers strictly for current topic relevance
  const cleanTopicLower = cleanTopic.toLowerCase();
  const topicWords = cleanTopicLower.replace(/[^\\w\\s\\u0600-\\u06FF]/g, '').split(/\\s+/).filter(w => w.length > 3);
  
  const relevantPapers = Array.isArray(papers) ? papers.filter(p => {
    if (topicWords.length === 0) return true;
    const pTitle = (p.title || '').toLowerCase();
    const pAbs = (p.abstractText || '').toLowerCase();
    return topicWords.some(w => pTitle.includes(w) || pAbs.includes(w));
  }) : [];

  const papersText = relevantPapers.length > 0
    ? relevantPapers.map((p, i) => \`Source #\${i + 1}: \${p.author} (\${p.year}). "\${p.title}". Journal: \${p.journalOrSource || 'Academic Journal'}. Abstract: \${p.abstractText || 'N/A'}\`).join('\\n')
    : (papersContext || 'No verified external paper corpus provided for this topic.');

  console.log('[LR DEBUG] 4. Immediately before Gemini API request:', { researchId: currentResearchId, researchTopic: cleanTopic, outputLanguage: normalizedLang });

  const prompt = \`
You are a Senior Academic Literature Review Chair and Meta-Synthesis Director.
Generate an EXHAUSTIVE, CRITICAL ACADEMIC LITERATURE REVIEW for the MASTER RESEARCH TOPIC: "\${cleanTopic}".

CRITICAL MANDATES & SINGLE SOURCE OF TRUTH:
1. SINGLE SOURCE OF TRUTH (STRICT TOPIC LOCK):
   - Generate this Literature Review ONLY for the research topic: "\${cleanTopic}".
   - Do NOT introduce any other research topic, unrelated population, or unrelated variables.
   - Do NOT force TAM, UTAUT, technology acceptance models, or AI literacy unless the user's topic explicitly addresses technology adoption.
   - RESEARCH QUESTIONS: \${reqQuestionsText || 'Examine core empirical relationships governing the topic.'}
   - RESEARCH OBJECTIVES: \${reqObjText || 'Analyze theoretical and empirical evidence.'}

2. STRUCTURED SUBSECTION REQUIREMENTS:
   Generate detailed academic paragraphs for all 10 structured Literature Review subsections:
   - sec_2_1 (Introduction): Scope, relevance, boundaries of literature review for "\${cleanTopic}".
   - sec_2_2 (Concept Definitions): Academic definitions & operational conceptualization of core constructs in "\${cleanTopic}".
   - sec_2_3 (Thematic Literature): Synthesis organized into themes derived directly from title and research questions.
   - sec_2_4 (Empirical Studies): Comparative synthesis across previous empirical studies (Study A vs Study B; author, year, sample, methodology, findings, limitations).
   - sec_2_5 (International Literature): Global research relevant to "\${cleanTopic}".
   - sec_2_6 (Regional Literature): Research from Middle East, Kurdistan Region, Iraq, or neighboring contexts.
   - sec_2_7 (Local Context): Literature regarding local geographical/institutional setting if present in title. Do NOT invent fake local studies.
   - sec_2_8 (Methodological Patterns): Patterns in previous research (quantitative, qualitative, mixed methods, survey, SPSS).
   - sec_2_9 (Theoretical Perspectives): Relevant theoretical frameworks used in previous research, strengths, limitations.
   - sec_2_10 (Research Gap): Evidence-based gap emerging naturally from the literature synthesis.

3. CRITICAL SYNTHESIS (NOT ANNOTATED BIBLIOGRAPHY):
   - Synthesize evidence across studies ("Study A found X, whereas Study B reported Y...").
   - Highlight agreements, disagreements, contradictions, and methodological differences.

4. CITATION SAFETY & SOURCE METADATA:
   - STRICT RULE: Do NOT invent fake authors, fake DOIs, or fake URLs.
   - Use provided paper corpus where available: \${papersText}

5. SINGLE LANGUAGE MANDATE:
   - \${langInstruction}
   - Output ALL generated explanatory prose 100% strictly in target language (\${language || 'en'}).
   - Academic source titles in citations may remain in original published language, but ALL surrounding explanatory prose MUST be 100% in target language.

Return a strict JSON object with this exact structure:
{
  "title": "\${cleanTopic}",
  "sec_2_1": "Introduction text...",
  "sec_2_2": "Concept definitions text...",
  "sec_2_3": "Thematic literature text...",
  "sec_2_4": "Empirical studies comparative synthesis text...",
  "sec_2_5": "International literature text...",
  "sec_2_6": "Regional literature text...",
  "sec_2_7": "Local context literature text...",
  "sec_2_8": "Methodological patterns text...",
  "sec_2_9": "Theoretical perspectives text...",
  "sec_2_10": "Synthesized research gap statement text...",
  "executiveSynthesis": "Full synthesized chapter overview...",
  "themes": [
    {
      "themeName": "Theme 1 Title",
      "synthesis": "Synthesis text for theme 1...",
      "keyStudies": ["Author (Year)"],
      "researchGap": "Gap in this theme..."
    }
  ],
  "similaritiesAndConsensus": "Points of consensus text...",
  "methodologicalDifferences": "Methodological differences text...",
  "researchGaps": "Empirical research gaps text...",
  "futureResearchDirections": "Future research directions text...",
  "criticalAppraisal": "Critical appraisal text...",
  "references": [
    "Author, A. (Year). Title. Journal. https://doi.org/..."
  ]
}
\`;

  try {
    const response = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.6 });
    console.log('[LR DEBUG] 5. Immediately after Gemini API response:', { researchId: currentResearchId, researchTopic: cleanTopic, outputLanguage: normalizedLang, status: 'Success' });
    const parsed = JSON.parse(response.text?.trim() || '{}');
    if (!parsed.sec_2_1 || !parsed.sec_2_4) {
      throw new Error('Incomplete structure from Gemini API');
    }

    const fullText = \`\${parsed.sec_2_1}\\n\\n\${parsed.sec_2_2}\\n\\n\${parsed.sec_2_3}\\n\\n\${parsed.sec_2_4}\\n\\n\${parsed.sec_2_5}\\n\\n\${parsed.sec_2_6}\\n\\n\${parsed.sec_2_7}\\n\\n\${parsed.sec_2_8}\\n\\n\${parsed.sec_2_9}\\n\\n\${parsed.sec_2_10}\`;

    const topicVal = validateSemanticTopicProfile(fullText, cleanTopic);
    if (!topicVal.isRelevant) {
      console.warn(\`[LitReview Relevance Audit Warning]: Off-topic contamination detected (\${topicVal.offTopicTermsFound.join(', ')}).\`);
      throw new Error(\`Off-topic content contamination detected: \${topicVal.offTopicTermsFound.join(', ')}\`);
    }

    const langVal = validateLanguageConsistency(fullText, language || 'en');
    if (!langVal.isValid) {
      console.warn(\`[LitReview Language Audit Warning]: Language mixing detected.\`);
      throw new Error(\`Language inconsistency detected: \${langVal.details}\`);
    }

    const scores = computeLitReviewQualityScores(fullText, cleanTopic, language || 'en', levelStr, relevantPapers, researchQuestions);

    return res.json({
      id: \`litreview_\${Date.now()}\`,
      researchId: currentResearchId,
      topic: cleanTopic,
      title: cleanTopic,
      field: field || 'Educational & Social Sciences',
      executiveSynthesis: parsed.executiveSynthesis || \`\${parsed.sec_2_1}\\n\\n\${parsed.sec_2_2}\\n\\n\${parsed.sec_2_3}\`,
      themes: parsed.themes || [
        {
          themeName: \`Empirical Synthesis of \${cleanTopic}\`,
          synthesis: parsed.sec_2_4,
          keyStudies: ['Reviewed Literature'],
          researchGap: parsed.sec_2_10
        }
      ],
      similaritiesAndConsensus: parsed.similaritiesAndConsensus || parsed.sec_2_4,
      methodologicalDifferences: parsed.methodologicalDifferences || parsed.sec_2_8,
      researchGaps: parsed.researchGaps || parsed.sec_2_10,
      futureResearchDirections: parsed.futureResearchDirections || parsed.sec_2_10,
      criticalAppraisal: parsed.criticalAppraisal || parsed.sec_2_10,
      references: parsed.references || [],
      verifiedSources: relevantPapers.map(p => ({ ...p, verified: true })),
      qualityScores: scores,
      wordCount: fullText.split(/\\s+/).length,
      structuredSubsections: {
        introduction: parsed.sec_2_1,
        conceptDefinitions: parsed.sec_2_2,
        thematicLiterature: parsed.sec_2_3,
        empiricalSynthesis: parsed.sec_2_4,
        internationalLit: parsed.sec_2_5,
        regionalLit: parsed.sec_2_6,
        localContext: parsed.sec_2_7,
        methodologicalPatterns: parsed.sec_2_8,
        theoreticalPerspectives: parsed.sec_2_9,
        gapSummary: parsed.sec_2_10
      },
      language: language || 'en',
      createdAt: new Date().toISOString(),
      isFallback: false
    });
  } catch (err: any) {
    console.warn('[LitReview Engine Warning]: Generation failed.', err?.message || err);
    if (!getGeminiApiKey()) {
      return res.status(400).json({ error: 'GEMINI_API_KEY is missing from server environment. Please set GEMINI_API_KEY in your .env file.' });
    }
    return res.status(422).json({
      error: \`Literature Review generation could not be completed for "\${cleanTopic}". Reason: \${err?.message || 'AI service error'}. Please verify topic context or API settings and retry.\`
    });
  }
});\n\n`;

  code = code.substring(0, litRouteStartIdx) + strictLitRoute + code.substring(litRouteEndIdx);
  console.log('Replaced /api/generate-litreview route with strict zero-fallback-contamination handler');
}

fs.writeFileSync(serverPath, code, 'utf8');
console.log('Successfully updated server.ts!');
