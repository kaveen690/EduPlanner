const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '../server.ts');
let code = fs.readFileSync(serverPath, 'utf8');

// 1. Add validateLitReviewTopicRelevance function right after validateLanguageConsistency
const marker = "function validateLanguageConsistency";
const idx = code.indexOf(marker);

if (idx !== -1) {
  const relValCode = `function validateLitReviewTopicRelevance(text: string, topic: string): {
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
    { term: 'inflation', flag: !topicLower.includes('inflation') && !topicLower.includes('تضخم') },
    { term: 'automated grading', flag: !topicLower.includes('grading') }
  ];

  const found: string[] = [];
  offTopicTriggers.forEach(item => {
    if (item.flag && textLower.includes(item.term)) {
      found.push(item.term);
    }
  });

  const isRelevant = found.length === 0;
  const score = isRelevant ? 100 : 40;

  return {
    isRelevant,
    score,
    offTopicTermsFound: found
  };
}\n\n`;

  code = code.substring(0, idx) + relValCode + code.substring(idx);
  console.log("Added validateLitReviewTopicRelevance");
}

// 2. Insert relevance & language audit check in /api/generate-litreview
const parseMarker = "const fullText = `${parsed.sec_2_1}\\n\\n${parsed.sec_2_2}\\n\\n${parsed.sec_2_3}\\n\\n${parsed.sec_2_4}\\n\\n${parsed.sec_2_5}\\n\\n${parsed.sec_2_6}\\n\\n${parsed.sec_2_7}\\n\\n${parsed.sec_2_8}\\n\\n${parsed.sec_2_9}\\n\\n${parsed.sec_2_10}`;";
const parseIdx = code.indexOf(parseMarker);

if (parseIdx !== -1) {
  const auditCode = `const fullText = \`\${parsed.sec_2_1}\\n\\n\${parsed.sec_2_2}\\n\\n\${parsed.sec_2_3}\\n\\n\${parsed.sec_2_4}\\n\\n\${parsed.sec_2_5}\\n\\n\${parsed.sec_2_6}\\n\\n\${parsed.sec_2_7}\\n\\n\${parsed.sec_2_8}\\n\\n\${parsed.sec_2_9}\\n\\n\${parsed.sec_2_10}\`;

    const relVal = validateLitReviewTopicRelevance(fullText, cleanTopic);
    if (!relVal.isRelevant) {
      console.warn(\`[LitReview Relevance Audit Warning]: Off-topic contamination detected (\${relVal.offTopicTermsFound.join(', ')}). Engaging dynamic topic-locked synthesis.\`);
      throw new Error(\`Off-topic content detected: \${relVal.offTopicTermsFound.join(', ')}\`);
    }

    const langVal = validateLanguageConsistency(fullText, language || 'en');
    if (!langVal.isValid) {
      console.warn(\`[LitReview Language Audit Warning]: Language mixing detected. Engaging dynamic single-language synthesis.\`);
      throw new Error(\`Language inconsistency detected: \${langVal.details}\`);
    }`;

  code = code.replace(parseMarker, auditCode);
  console.log("Added relevance and language audit checks to /api/generate-litreview");
}

fs.writeFileSync(serverPath, code, 'utf8');
console.log("Successfully updated server.ts!");
