async function testClickableLitReview() {
  console.log('=== TESTING CONTINUOUS ACADEMIC PARAGRAPHS & CITATIONS ===');
  console.log('Title: هۆشیاری داهێنان لای مامۆستایانی باخچەی منداڵان لە پارێزگای دهۆک\n');

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
        targetLength: 'Comprehensive'
      })
    });

    const data = await res.json();
    console.log('----------------------------------------------------');
    console.log('TITLE:', data.title);
    console.log('----------------------------------------------------');
    console.log('EXECUTIVE SYNTHESIS (Continuous Paragraphs):');
    console.log(data.executiveSynthesis);
    console.log('----------------------------------------------------');
    console.log('THEME 1 SYNTHESIS (Continuous Paragraphs):');
    console.log(data.themes?.[0]?.synthesis);
    console.log('----------------------------------------------------');
    console.log('REFERENCES COUNT:', data.references?.length);
    console.log('SAMPLE REFERENCE:', data.references?.[0]);
  } catch (err) {
    console.error('Test Error:', err);
  }
}

testClickableLitReview();
