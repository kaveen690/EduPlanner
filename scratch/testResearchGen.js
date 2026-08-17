async function testResearchGen() {
  console.log('--- TESTING RESEARCH PAPER GENERATION (KURDISH SORANI) ---');
  try {
    const resKu = await fetch('http://localhost:3000/api/generate-research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'کاریگەری ژیریی دەستکرد لەسەر پەرەپێدانی فێرکاری',
        field: 'تەکنەلۆجیای پەروەردەیی',
        paperType: 'empirical',
        wordCount: 2000,
        language: 'ku',
        academicLevel: 'Master\'s Thesis (M.Sc.)'
      })
    });

    const dataKu = await resKu.json();
    console.log('TITLE:', dataKu.title);
    console.log('ABSTRACT (snippet):', dataKu.abstract?.substring(0, 150));
    console.log('SECTIONS COUNT:', dataKu.sections?.length);
    console.log('SECTION 1 TITLE:', dataKu.sections?.[0]?.title);
    console.log('SECTION 4 TITLE & SNIPPET:', dataKu.sections?.[3]?.title, '->', dataKu.sections?.[3]?.content?.substring(0, 150));
  } catch (err) {
    console.error('Test error:', err);
  }
}

testResearchGen();
