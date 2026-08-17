async function testExactTopic() {
  console.log('=== TESTING EXACT USER TOPIC & MANDATES ===');
  console.log('Topic: هۆشیاری داهێنان لای مامۆستایانی باخچەی منداڵان لە پارێزگای دهۆک');
  console.log('Language: Kurdish Badini (bad)');
  console.log('Academic Level: Doctoral Dissertation (Ph.D.)\n');

  try {
    const res = await fetch('http://localhost:3000/api/generate-research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'هۆشیاری داهێنان لای مامۆستایانی باخچەی منداڵان لە پارێزگای دهۆک',
        field: 'پەروەردەی کۆرپەلە و منداڵان',
        paperType: 'empirical',
        wordCount: 5000,
        language: 'bad',
        academicLevel: 'Doctoral Dissertation (Ph.D.)'
      })
    });

    const data = await res.json();
    console.log('----------------------------------------------------');
    console.log('TITLE:', data.title);
    console.log('----------------------------------------------------');
    console.log('KEYWORDS:', data.keywords);
    console.log('----------------------------------------------------');
    console.log('ABSTRACT (snippet):', data.abstract?.substring(0, 200));
    console.log('----------------------------------------------------');
    console.log('SECTIONS COUNT:', data.sections?.length);
    data.sections?.forEach((s, idx) => {
      console.log(`SECTION ${idx + 1} TITLE:`, s.title);
      console.log(`SNIPPET:`, s.content?.substring(0, 150));
      console.log('---');
    });
  } catch (err) {
    console.error('Test Error:', err);
  }
}

testExactTopic();
