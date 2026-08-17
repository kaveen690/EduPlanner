const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '../server.ts');
let code = fs.readFileSync(serverPath, 'utf8');

// 1. Add normalizeOutputLanguage and validateSemanticTopicProfile
const navMarker = "function validateLanguageConsistency";
const navIdx = code.indexOf(navMarker);

if (navIdx !== -1) {
  const newHelpers = `function normalizeOutputLanguage(lang: string | undefined): 'kurdish' | 'arabic' | 'english' {
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

  code = code.substring(0, navIdx) + newHelpers + code.substring(navIdx);
  console.log("Added normalizeOutputLanguage and validateSemanticTopicProfile helpers");
}

// 2. Overhaul /api/generate-litreview route
const routeStartMarker = "app.post('/api/generate-litreview', async (req, res) => {";
const routeStartIdx = code.indexOf(routeStartMarker);
const routeEndMarker = "// 2.4 Dynamic Proposal Fallback Generator"; // next section
const routeEndIdx = code.indexOf(routeEndMarker, routeStartIdx);

if (routeStartIdx !== -1 && routeEndIdx !== -1) {
  const upgradedRouteCode = `app.post('/api/generate-litreview', async (req, res) => {
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
    return res.status(400).json({ error: 'Research topic is required' });
  }

  const cleanTopic = rawTopic;
  const normalizedLang = normalizeOutputLanguage(language || researchContext?.outputLanguage || researchContext?.language);
  const langInstruction = getLanguageInstructions(language || 'en');
  const levelStr = academicLevel || "Master's Thesis";
  const reqQuestionsText = researchQuestions ? (Array.isArray(researchQuestions) ? researchQuestions.map((q: any) => typeof q === 'string' ? q : (q.text || '')).join('; ') : String(researchQuestions)) : '';
  const reqObjText = researchObjectives ? (Array.isArray(researchObjectives) ? researchObjectives.map((o: any) => typeof o === 'string' ? o : (o.text || '')).join('; ') : String(researchObjectives)) : '';

  // Filter sources for topic relevance before feeding into synthesis
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
    : (papersContext || 'No verified external paper corpus provided.');

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
    const parsed = JSON.parse(response.text?.trim() || '{}');
    if (!parsed.sec_2_1 || !parsed.sec_2_4) {
      throw new Error('Incomplete structure from Gemini API');
    }

    const fullText = \`\${parsed.sec_2_1}\\n\\n\${parsed.sec_2_2}\\n\\n\${parsed.sec_2_3}\\n\\n\${parsed.sec_2_4}\\n\\n\${parsed.sec_2_5}\\n\\n\${parsed.sec_2_6}\\n\\n\${parsed.sec_2_7}\\n\\n\${parsed.sec_2_8}\\n\\n\${parsed.sec_2_9}\\n\\n\${parsed.sec_2_10}\`;

    const topicVal = validateSemanticTopicProfile(fullText, cleanTopic);
    if (!topicVal.isRelevant) {
      console.warn(\`[LitReview Relevance Audit Warning]: Off-topic contamination detected (\${topicVal.offTopicTermsFound.join(', ')}). Engaging dynamic topic-locked synthesis.\`);
      throw new Error(\`Off-topic content detected: \${topicVal.offTopicTermsFound.join(', ')}\`);
    }

    const langVal = validateLanguageConsistency(fullText, language || 'en');
    if (!langVal.isValid) {
      console.warn(\`[LitReview Language Audit Warning]: Language mixing detected. Engaging dynamic single-language synthesis.\`);
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
    console.warn('[LitReview Engine Warning]: Engaging dynamic single-language synthesis.', err?.message || err);
    const fallbackData = generateDynamicLiteratureReviewSynthesis({
      cleanTopic,
      field,
      citationStyle,
      language,
      academicLevel: levelStr,
      researchQuestions,
      researchObjectives,
      papers: relevantPapers
    });
    return res.json({
      ...fallbackData,
      id: \`litreview_\${Date.now()}\`,
      researchId: currentResearchId,
      topic: cleanTopic,
      createdAt: new Date().toISOString()
    });
  }
});\n\n`;

  code = code.substring(0, routeStartIdx) + upgradedRouteCode + code.substring(routeEndIdx);
  console.log("Successfully replaced /api/generate-litreview route in server.ts");
}

fs.writeFileSync(serverPath, code, 'utf8');
console.log("Updated server.ts with full LitReview bug fixes!");
