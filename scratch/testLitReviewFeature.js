async function testLitReviewFeature() {
  console.log('=== TESTING /api/generate-litreview ENDPOINT ===');
  console.log('Title: هۆشیاری داهێنان لای مامۆستایانی باخچەی منداڵان لە پارێزگای دهۆک');
  console.log('Language: Kurdish Badini (bad)');
  console.log('Academic Level: Doctoral Dissertation (Ph.D.)');
  console.log('Length: Comprehensive\n');

  try {
    const res = await fetch('http://localhost:3000/api/generate-litreview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'هۆشیاری داهێنان لای مامۆستایانی باخچەی منداڵان لە پارێزگای دهۆک',
        field: 'پەروەردەی کۆرپەلە و منداڵان',
        citationStyle: 'APA 7th Edition',
        language: 'bad',
        academicLevel: 'Doctoral Dissertation (Ph.D.)',
        targetLength: 'Comprehensive',
        researchQuestions: 'ئاستێ هۆشیاریا داهێنانێ ل دەف مامۆستایێن باخچەیێن منداڵان ل دهۆک چەندە؟',
        researchObjectives: 'دیارکرنا کاریگەڕیا هۆشیاریا داهێنانێ ل سەر پرۆسەیا پەرەپێدانێ'
      })
    });

    const data = await res.json();
    console.log('----------------------------------------------------');
    console.log('TITLE:', data.title);
    console.log('----------------------------------------------------');
    console.log('EXECUTIVE SYNTHESIS:', data.executiveSynthesis?.substring(0, 200));
    console.log('----------------------------------------------------');
    console.log('THEMES COUNT:', data.themes?.length);
    data.themes?.forEach((t, idx) => {
      console.log(`THEME ${idx + 1} NAME:`, t.themeName);
      console.log(`SYNTHESIS SNIPPET:`, t.synthesis?.substring(0, 150));
      console.log(`RESEARCH GAP:`, t.researchGap);
      console.log('---');
    });
    console.log('----------------------------------------------------');
    console.log('SPECIFIC RESEARCH GAP:', data.researchGaps);
    console.log('----------------------------------------------------');
    console.log('REFERENCES COUNT:', data.references?.length);
    console.log('SAMPLE REFERENCE:', data.references?.[0]);
  } catch (err) {
    console.error('Test Error:', err);
  }
}

testLitReviewFeature();
