const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '../server.ts');
let content = fs.readFileSync(serverPath, 'utf8');

const startMarker = "// Helper to get Language prompt instructions";
const startIdx = content.indexOf(startMarker);

if (startIdx === -1) {
  console.error("Could not find startIdx");
  process.exit(1);
}

const endMarker = "// ================= LOCAL FALLBACK GENERATORS =================";
const endIdx = content.indexOf(endMarker);

if (endIdx === -1) {
  console.error("Could not find endIdx");
  process.exit(1);
}

const replacement = `function normalizeLanguage(lang: string | undefined): 'bad' | 'ku' | 'ar' | 'en' {
  if (!lang) return 'en';
  const l = String(lang).toLowerCase().trim();
  if (l === 'kurdish' || l === 'badini' || l === 'bad') return 'bad';
  if (l === 'sorani' || l === 'ku') return 'ku';
  if (l === 'arabic' || l === 'ar') return 'ar';
  return 'en';
}

function getLanguageInstructions(lang: string): string {
  const norm = normalizeLanguage(lang);
  if (norm === 'bad') {
    return \`CRITICAL SINGLE-LANGUAGE MANDATE (KURDISH / BADINI):
The ENTIRE response MUST be written strictly 100% in natural, fluent academic Badini Kurdish (شێوەزارێ بادینی - بەهدینی) using standard Duhok academic phrasing (e.g., "ئەڤ ڤەکۆلینە", "د چوارچۆڤەیێ", "دەستنیشانکرن", "ئەنجامێن سەرەکی", "پێشنیارێن ستراتیژی").
RULES:
1. Do NOT mix English, Sorani, or Arabic text. Every section title, header, paragraph, keyword, bullet point, and summary MUST be in Badini Kurdish script.
2. Do NOT switch to Arabic or English merely because a source or previous topic was in another language.
3. Original technical terms may be placed in parentheses in English ONLY when academically necessary (e.g., "ژیرییا دەستکرد (Artificial Intelligence)"), but all surrounding text must remain strictly in Badini Kurdish.
4. Do NOT invent fake statistical numbers (such as F, t, p, R^2, N) if no real empirical dataset is provided by the user.\`;
  } else if (norm === 'ku') {
    return \`CRITICAL SINGLE-LANGUAGE MANDATE (KURDISH / SORANI):
The ENTIRE response MUST be written strictly 100% in natural, fluent Sorani Kurdish (شێوەزاری سۆرانی).
RULES:
1. Do NOT mix English or Arabic text. Every section title, header, paragraph, keyword, bullet point, and summary MUST be in Sorani Kurdish script.
2. Do NOT switch to Arabic or English merely because a source or previous topic was in another language.
3. Original technical terms may be placed in parentheses in English ONLY when academically necessary (e.g., "ژیریی دەستکرد (Artificial Intelligence)"), but all surrounding text must remain strictly in Sorani Kurdish.
4. Do NOT invent fake statistical numbers (such as F, t, p, R^2, N) if no real empirical dataset is provided by the user.\`;
  } else if (norm === 'ar') {
    return \`CRITICAL SINGLE-LANGUAGE MANDATE (ARABIC):
The ENTIRE response MUST be written strictly 100% in Modern Standard Academic Arabic (اللغة العربية الفصحى الأكاديمية).
RULES:
1. Do NOT mix English or Kurdish text. Every section title, header, paragraph, keyword, bullet point, and summary MUST be in Arabic script.
2. Do NOT switch to Kurdish or English merely because a source or previous topic was in another language.
3. Original technical terms may be placed in parentheses in English ONLY when academically necessary, but all surrounding text must remain strictly in Arabic.
4. Do NOT invent fake statistical numbers (such as F, t, p, R^2, N) if no real empirical dataset is provided by the user.\`;
  } else {
    return \`CRITICAL SINGLE-LANGUAGE MANDATE (ENGLISH):
The ENTIRE response MUST be written strictly 100% in scholarly academic English.
RULES:
1. Do NOT mix Kurdish or Arabic text. Every section title, header, paragraph, keyword, bullet point, and summary MUST be in English.
2. Do NOT switch to Kurdish or Arabic merely because a source or previous topic was in another language.
3. Do NOT invent fake statistical numbers (such as F, t, p, R^2, N) if no real empirical dataset is provided by the user.\`;
  }
}

function validateLanguageConsistency(text: string, targetLang: string): {
  isValid: boolean;
  score: number;
  detectedLanguage: string;
  contaminationPercentage: number;
  mixedParagraphCount: number;
  details: string;
} {
  if (!text || !text.trim()) {
    return { isValid: true, score: 100, detectedLanguage: 'english', contaminationPercentage: 0, mixedParagraphCount: 0, details: 'Empty text' };
  }

  const normLang = normalizeLanguage(targetLang);

  // Clean out citations (Author, 2024), DOIs, URLs, and parenthesized technical terms (Artificial Intelligence)
  const cleanedText = text
    .replace(/\\bhttps?:\\/\\/\\S+/gi, '')
    .replace(/\\b10\\.\\d{4,9}\\/[-._;()/:A-Z0-9]+/gi, '')
    .replace(/\\([A-Za-z\\s&.,\\-]+,\\s*\\d{4}[a-z]?\\)/g, '')
    .replace(/\\([A-Za-z0-9\\s\\-_/]+\\)/g, '');

  const paragraphs = cleanedText.split(/\\n\\s*\\n/).filter(p => p.trim().length > 25);
  let mixedParagraphs = 0;
  let contaminationPoints = 0;

  paragraphs.forEach(p => {
    const arabChars = (p.match(/[\\u0600-\\u06FF]/g) || []).length;
    const latChars = (p.match(/[A-Za-z]/g) || []).length;
    const totalAlpha = arabChars + latChars;

    if (totalAlpha < 10) return;

    if (normLang === 'en') {
      if (arabChars > 15 && (arabChars / totalAlpha) > 0.15) {
        mixedParagraphs++;
        contaminationPoints += 25;
      }
    } else if (normLang === 'ar') {
      const kurdChars = (p.match(/[\\u0686\\u067E\\u06AF\\u0698\\u06A4\\u06C6\\u06CE\\u0695\\u06B5]/g) || []).length;
      const kurdWords = (p.match(/\\b(دکەت|دەبێت|ئەڤ|ئەم|ڤی|ئاریشا|کۆمکرنا|هۆشیاری|باخچەی|ژ بۆ|پێشنیارێن)\\b/gi) || []).length;

      if (latChars > 25 && (latChars / totalAlpha) > 0.20) {
        mixedParagraphs++;
        contaminationPoints += 20;
      }
      if (kurdChars > 4 || kurdWords > 1) {
        mixedParagraphs++;
        contaminationPoints += 30;
      }
    } else {
      const kurdChars = (p.match(/[\\u0686\\u067E\\u06AF\\u0698\\u06A4\\u06C6\\u06CE\\u0695\\u06B5]/g) || []).length;
      const arPhrases = (p.match(/(في هذا البحث|تهدف هذه الدراسة|الربط بين|المتغيرات المستقلة|علاوة على ذلك|إطار نظري|دراسة ميدانية)/g) || []).length;

      if (latChars > 25 && (latChars / totalAlpha) > 0.20) {
        mixedParagraphs++;
        contaminationPoints += 20;
      }
      if (arPhrases > 0 && kurdChars === 0) {
        mixedParagraphs++;
        contaminationPoints += 35;
      }
    }
  });

  const contaminationPercentage = Math.min(100, Math.round(contaminationPoints / Math.max(1, paragraphs.length)));
  const score = Math.max(0, 100 - contaminationPercentage);
  const isValid = score >= 75 && mixedParagraphs === 0;

  return {
    isValid,
    score,
    detectedLanguage: normLang === 'ar' ? 'arabic' : normLang === 'en' ? 'english' : 'kurdish',
    contaminationPercentage,
    mixedParagraphCount: mixedParagraphs,
    details: isValid
      ? \`Text strictly adheres to \${normLang.toUpperCase()} language specifications.\`
      : \`Detected \${mixedParagraphs} mixed-language paragraph(s) with \${contaminationPercentage}% foreign language contamination.\`
  };
}

`;

const updatedContent = content.substring(0, startIdx) + replacement + content.substring(endIdx);
fs.writeFileSync(serverPath, updatedContent, 'utf8');
console.log('Successfully updated server.ts with normalizeLanguage, getLanguageInstructions, and validateLanguageConsistency!');
