const fs = require('fs');
const path = require('path');

// 1. Fix server.ts /api/generate-litreview JSON payload to include top-level sec_2_1 through sec_2_12
const serverPath = path.join(__dirname, '../server.ts');
let serverCode = fs.readFileSync(serverPath, 'utf8');

if (!serverCode.includes('sec_2_1: parsed.sec_2_1,')) {
  serverCode = serverCode.replace(
    'structuredSubsections: {',
    `sec_2_1: parsed.sec_2_1 || parsed.executiveSynthesis || '',
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
      sec_2_12: parsed.sec_2_12 || parsed.sec_2_10 || parsed.futureResearchDirections || '',
      structuredSubsections: {`
  );

  fs.writeFileSync(serverPath, serverCode, 'utf8');
  console.log('Added top-level sec_2_1 to sec_2_12 fields in server.ts /api/generate-litreview response');
}

// 2. Fix ResearchReportGenerator.tsx litSections initial state and content mappings
const repPath = path.join(__dirname, '../src/components/ResearchReportGenerator.tsx');
let repCode = fs.readFileSync(repPath, 'utf8');

// Replace hardcoded initial state litSections with empty content
const oldLitSectionsState = `  const [litSections, setLitSections] = useState<LiteratureSection[]>([
    { id: 'lit_2_1', number: '2.1', title: 'Introduction to Literature Review', content: 'This literature review synthesizes conceptual frameworks, technological models, and empirical studies concerning artificial intelligence adoption in higher education (Davis, 1989; Venkatesh et al., 2003).' },
    { id: 'lit_2_2', number: '2.2', title: 'Theoretical Framework (UTAUT & TAM)', content: 'The Technology Acceptance Model (TAM) and the Unified Theory of Acceptance and Use of Technology (UTAUT) serve as the primary theoretical lenses for evaluating effort expectancy, performance expectancy, and social influence.' },
    { id: 'lit_2_3', number: '2.3', title: 'AI Literacy in Higher Education', content: 'AI literacy encompasses operational competence, pedagogical understanding, and ethical awareness among university educators.' },
    { id: 'lit_2_4', number: '2.4', title: 'Artificial Intelligence in Higher Education', content: 'Artificial intelligence in higher education has evolved from automated grading routines to adaptive tutoring, predictive modeling, and personalized learning environments.' },
    { id: 'lit_2_5', number: '2.5', title: 'University Teachers\' Perceptions of AI', content: 'Faculty perceptions reflect optimism regarding administrative automation balanced against concerns over academic integrity, workload shifts, and algorithmic fidelity.' },
    { id: 'lit_2_6', number: '2.6', title: 'Teachers\' Attitudes Toward AI', content: 'Teachers\' attitudes are significantly shaped by personal self-efficacy, institutional culture, and institutional technology support.' },
    { id: 'lit_2_7', number: '2.7', title: 'Teachers\' Acceptance and Use of AI', content: 'Acceptance and operational use of AI is demonstrated through frequency of adoption, prompt engineering sophistication, and structural inclusion in assessment protocols.' },
    { id: 'lit_2_8', number: '2.8', title: 'Factors Influencing AI Acceptance', content: 'Key influencing factors include organizational facilitating conditions, peer influence, technical infrastructure, policy clarity, and demographic moderation.' },
    { id: 'lit_2_9', number: '2.9', title: 'Empirical Studies', content: 'Empirical studies confirm statistically significant relationships between predictor constructs (AI Literacy, TAM factors) and primary behavioral intention to accept digital tools.' },
    { id: 'lit_2_10', number: '2.10', title: 'Research Gap', content: 'A critical empirical gap persists regarding localized faculty adoption models within regional university settings, where institutional support predictors require grounded validation.' },
    { id: 'lit_2_11', number: '2.11', title: 'Conceptual Framework', content: 'The proposed conceptual framework posits that Independent Variables (AI Literacy, TAM factors) directly impact Dependent Variables (Behavioral Intention to Accept AI), moderated by Contextual Factors.' },
    { id: 'lit_2_12', number: '2.12', title: 'Summary of Literature Review', content: 'This summary synthesizes theoretical foundations, empirical consensus, and identified gaps, providing a direct baseline for the quantitative methodology.' }
  ]);`;

const cleanLitSectionsState = `  const [litSections, setLitSections] = useState<LiteratureSection[]>([
    { id: 'lit_2_1', number: '2.1', title: 'Introduction to Literature Review', content: '' },
    { id: 'lit_2_2', number: '2.2', title: 'Theoretical Framework & Core Models', content: '' },
    { id: 'lit_2_3', number: '2.3', title: 'Conceptualization of Core Constructs', content: '' },
    { id: 'lit_2_4', number: '2.4', title: 'Thematic Literature Synthesis', content: '' },
    { id: 'lit_2_5', number: '2.5', title: 'International Empirical Literature', content: '' },
    { id: 'lit_2_6', number: '2.6', title: 'Regional & Local Contextual Literature', content: '' },
    { id: 'lit_2_7', number: '2.7', title: 'Methodological Patterns & Designs', content: '' },
    { id: 'lit_2_8', number: '2.8', title: 'Empirical Similarities & Consensus Points', content: '' },
    { id: 'lit_2_9', number: '2.9', title: 'Methodological Differences & Contradictions', content: '' },
    { id: 'lit_2_10', number: '2.10', title: 'Evidence-Based Research Gap', content: '' },
    { id: 'lit_2_11', number: '2.11', title: 'Synthesized Conceptual Framework', content: '' },
    { id: 'lit_2_12', number: '2.12', title: 'Summary of Literature Review', content: '' }
  ]);`;

if (repCode.includes(oldLitSectionsState)) {
  repCode = repCode.replace(oldLitSectionsState, cleanLitSectionsState);
  console.log('Cleaned hardcoded initial litSections state in ResearchReportGenerator.tsx');
}

// Replace fallback mappings in handleGenerateLitReview in ResearchReportGenerator.tsx
const oldResMap = `        const newSecs: LiteratureSection[] = [
          { id: 'lit_2_1', number: '2.1', title: 'Introduction to Literature Review', content: res.sec_2_1 || litSections[0].content },
          { id: 'lit_2_2', number: '2.2', title: 'Theoretical Framework (UTAUT & TAM)', content: res.sec_2_2 || litSections[1].content },
          { id: 'lit_2_3', number: '2.3', title: 'AI Literacy in Higher Education', content: res.sec_2_3 || litSections[2].content },
          { id: 'lit_2_4', number: '2.4', title: 'Artificial Intelligence in Higher Education', content: res.sec_2_4 || litSections[3].content },
          { id: 'lit_2_5', number: '2.5', title: 'University Teachers\' Perceptions of AI', content: res.sec_2_5 || litSections[4].content },
          { id: 'lit_2_6', number: '2.6', title: 'Teachers\' Attitudes Toward AI', content: res.sec_2_6 || litSections[5].content },
          { id: 'lit_2_7', number: '2.7', title: 'Teachers\' Acceptance and Use of AI', content: res.sec_2_7 || litSections[6].content },
          { id: 'lit_2_8', number: '2.8', title: 'Factors Influencing AI Acceptance', content: res.sec_2_8 || litSections[7].content },
          { id: 'lit_2_9', number: '2.9', title: 'Empirical Studies', content: res.sec_2_9 || litSections[8].content },
          { id: 'lit_2_10', number: '2.10', title: 'Research Gap', content: res.sec_2_10 || litSections[9].content },
          { id: 'lit_2_11', number: '2.11', title: 'Conceptual Framework', content: res.sec_2_11 || litSections[10].content },
          { id: 'lit_2_12', number: '2.12', title: 'Summary of Literature Review', content: res.sec_2_12 || litSections[11].content }
        ];`;

const cleanResMap = `        const newSecs: LiteratureSection[] = [
          { id: 'lit_2_1', number: '2.1', title: 'Introduction to Literature Review', content: res.sec_2_1 || res.structuredSubsections?.introduction || '' },
          { id: 'lit_2_2', number: '2.2', title: 'Theoretical Framework & Core Models', content: res.sec_2_2 || res.structuredSubsections?.theoreticalPerspectives || '' },
          { id: 'lit_2_3', number: '2.3', title: 'Conceptualization of Core Constructs', content: res.sec_2_3 || res.structuredSubsections?.conceptDefinitions || '' },
          { id: 'lit_2_4', number: '2.4', title: 'Thematic Literature Synthesis', content: res.sec_2_4 || res.structuredSubsections?.thematicLiterature || '' },
          { id: 'lit_2_5', number: '2.5', title: 'International Empirical Literature', content: res.sec_2_5 || res.structuredSubsections?.internationalLit || '' },
          { id: 'lit_2_6', number: '2.6', title: 'Regional & Local Contextual Literature', content: res.sec_2_6 || res.structuredSubsections?.regionalLit || res.structuredSubsections?.localContext || '' },
          { id: 'lit_2_7', number: '2.7', title: 'Methodological Patterns & Designs', content: res.sec_2_7 || res.structuredSubsections?.methodologicalPatterns || '' },
          { id: 'lit_2_8', number: '2.8', title: 'Empirical Similarities & Consensus Points', content: res.sec_2_8 || res.similaritiesAndConsensus || '' },
          { id: 'lit_2_9', number: '2.9', title: 'Methodological Differences & Contradictions', content: res.sec_2_9 || res.methodologicalDifferences || '' },
          { id: 'lit_2_10', number: '2.10', title: 'Evidence-Based Research Gap', content: res.sec_2_10 || res.structuredSubsections?.gapSummary || res.researchGaps || '' },
          { id: 'lit_2_11', number: '2.11', title: 'Synthesized Conceptual Framework', content: res.sec_2_11 || res.criticalAppraisal || '' },
          { id: 'lit_2_12', number: '2.12', title: 'Summary of Literature Review', content: res.sec_2_12 || res.futureResearchDirections || '' }
        ];`;

if (repCode.includes(oldResMap)) {
  repCode = repCode.replace(oldResMap, cleanResMap);
  console.log('Updated handleGenerateLitReview mapping in ResearchReportGenerator.tsx');
}

fs.writeFileSync(repPath, repCode, 'utf8');
console.log('Successfully updated ResearchReportGenerator.tsx!');
