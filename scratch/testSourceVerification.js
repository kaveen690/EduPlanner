async function testSourceVerification() {
  console.log('=== TESTING ACADEMIC SOURCE VERIFICATION SYSTEM ===');
  console.log('Topic: هۆشیاری داهێنان لای مامۆستایانی باخچەی منداڵان لە پارێزگای دهۆک\n');

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
    console.log('PARAGRAPHS EXCERPT:\n', data.executiveSynthesis?.substring(0, 250));
    console.log('----------------------------------------------------');
    console.log('VERIFIED PAPERS COUNT:', data.papers?.length);
    if (data.papers && data.papers.length > 0) {
      const p = data.papers[0];
      console.log('SAMPLE SOURCE RECORD:');
      console.log('  Title:', p.title);
      console.log('  Author:', p.author);
      console.log('  Year:', p.year);
      console.log('  Journal:', p.journalOrSource);
      console.log('  Publisher:', p.publisher);
      console.log('  DOI:', p.doi);
      console.log('  URL:', p.sourceUrl);
      console.log('  Verification Status:', p.verificationStatus);
      console.log('  Relevance Score:', p.relevanceScore, '%');
    }
    console.log('----------------------------------------------------');
    console.log('REFERENCES COUNT:', data.references?.length);
    console.log('SAMPLE REFERENCE:', data.references?.[0]);
  } catch (err) {
    console.error('Test Error:', err);
  }
}

testSourceVerification();
