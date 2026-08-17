async function testAllLangs() {
  const langs = ['bad', 'ar', 'en'];

  for (const lang of langs) {
    console.log(`\n================= TESTING LANGUAGE: ${lang.toUpperCase()} =================`);
    try {
      const res = await fetch('http://localhost:3000/api/generate-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: lang === 'bad' ? 'کاریگەرییا تەکنەلۆجیایێ د پەروەردەیێ دا' : lang === 'ar' ? 'تأثير الذكاء الاصطناعي على التعليم العالي' : 'Impact of Artificial Intelligence on Higher Education',
          field: 'Education',
          paperType: 'empirical',
          wordCount: 2000,
          language: lang,
          academicLevel: 'Doctoral / Ph.D.'
        })
      });

      const data = await res.json();
      console.log('TITLE:', data.title);
      console.log('KEYWORDS:', data.keywords);
      console.log('SECTION 1:', data.sections?.[0]?.title);
      console.log('SECTION 4:', data.sections?.[3]?.title, '->', data.sections?.[3]?.content?.substring(0, 120));
      console.log('SECTION 6:', data.sections?.[5]?.title);
    } catch (err) {
      console.error(`Error testing ${lang}:`, err);
    }
  }
}

testAllLangs();
