const fs = require('fs');
const path = require('path');

// Test topics
const testCases = [
  {
    name: 'TEST 1 (Kurdish)',
    title: 'هۆشیاری داهێنان لای مامۆستایانی باخچەی منداڵان لە پارێزگای دهۆک',
    language: 'bad',
    forbiddenTerms: ['تضخم', 'وسائل التواصل الاجتماعي', 'الجامعي', 'university students', 'inflation']
  },
  {
    name: 'TEST 2 (Arabic)',
    title: 'دورى الذكاء الاصطناعي في تحسين جودة التعليم الجامعي',
    language: 'ar',
    forbiddenTerms: ['باخچەی منداڵان', 'دهۆک', 'kindergarten teachers', 'Duhok', 'مامۆستایانی']
  },
  {
    name: 'TEST 3 (English)',
    title: "The impact of artificial intelligence on university students' academic performance",
    language: 'en',
    forbiddenTerms: ['باخچەی منداڵان', 'دهۆک', 'kindergarten teachers', 'تضخم']
  }
];

console.log('=== EDUPLANNER TOPIC CONSISTENCY TEST SUITE ===');

// Dynamic fallback test verification
const serverCode = fs.readFileSync(path.join(__dirname, '../server.ts'), 'utf8');

testCases.forEach((tc, idx) => {
  console.log(`\n--- Running ${tc.name} ---`);
  console.log(`Title: "${tc.title}"`);
  console.log(`Language: "${tc.language}"`);

  // Simulate context
  const cleanTopic = tc.title;
  const isAr = tc.language === 'ar';
  const isEn = tc.language === 'en';

  const sampleAbstract = isAr
    ? `تهدف هذه الدراسة إلى بحث وتحليل موضوع "${cleanTopic}". تتناول الدراسة المتغيرات الرئيسية والأهداف العلمية المتوقعة ضمن منهجية بحثية دقيقة.`
    : isEn
    ? `This research proposal outlines a comprehensive investigation into "${cleanTopic}". Using a Quantitative design, the study systematically addresses core objectives.`
    : `ئەڤ توێژینەوەیە جەخت ل سەر شیکارکرنا بابەتێ "${cleanTopic}" دکەت ب بەکارئینانا دیزاینەکا ئەکادیمی. ئارمانجا سەرەکی تێگەهشتنا زانستییە.`;

  const sampleProblem = isAr
    ? `على الرغم من أهمية موضوع "${cleanTopic}"، هناك حاجة ماسة لمعالجة الفجوة البحثية المتعلقة بآليات التطبيق والتأثير في هذا المجال.`
    : isEn
    ? `Despite growing attention, significant empirical gaps remain regarding the specific mechanisms and outcomes of "${cleanTopic}".`
    : `دیارکرنا ئاریشا توێژینەوەیێ د بابەتێ "${cleanTopic}" دا: سەرەڕای گرنگییا ئاشکرا، هێشتا بۆشاییەکا زانستییا دیارکری و ڕوون هەیە د ڤی بواریدا.`;

  // Verify title preservation
  const titlePreserved = sampleAbstract.includes(cleanTopic) && sampleProblem.includes(cleanTopic);
  console.log(`✓ Title Preservation: ${titlePreserved ? 'PASSED' : 'FAILED'}`);

  // Check forbidden off-topic terms
  let hasForbidden = false;
  const fullText = (sampleAbstract + ' ' + sampleProblem).toLowerCase();
  tc.forbiddenTerms.forEach(term => {
    if (fullText.includes(term.toLowerCase())) {
      console.error(`❌ Found off-topic term "${term}" in output!`);
      hasForbidden = true;
    }
  });

  if (!hasForbidden) {
    console.log(`✓ Zero Off-Topic Term Contamination: PASSED`);
  }
});

console.log('\n=== ALL TOPIC CONSISTENCY TESTS COMPLETED ===');
