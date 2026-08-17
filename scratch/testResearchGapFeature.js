async function testResearchGapFeature() {
  console.log('=== TESTING EVIDENCE-BASED RESEARCH GAP ENGINE ===');
  console.log('Topic: هۆشیاری داهێنان لای مامۆستایانی باخچەی منداڵان لە پارێزگای دهۆک\n');

  try {
    const res = await fetch('http://localhost:3000/api/generate-research-gap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'هۆشیاری داهێنان لای مامۆستایانی باخچەی منداڵان لە پارێزگای دهۆک',
        field: 'پەروەردەی کۆرپەلە و منداڵان',
        academicLevel: 'Doctoral Dissertation (Ph.D.)',
        language: 'bad',
        researchQuestions: 'What is the level of innovation awareness among kindergarten teachers in Duhok governorate?'
      })
    });

    const data = await res.json();
    console.log('----------------------------------------------------');
    console.log('EVIDENCE STRENGTH:', data.evidenceStrength);
    console.log('GAP TYPES:', data.gapTypes);
    console.log('----------------------------------------------------');
    console.log('DETAILED RESEARCH GAP PARAGRAPHS:');
    console.log(data.detailedGapParagraphs);
    console.log('----------------------------------------------------');
    console.log('HOW CURRENT STUDY ADDRESSES THE GAP:');
    console.log(data.howCurrentStudyAddressesGap);
    console.log('----------------------------------------------------');
  } catch (err) {
    console.error('Test Error:', err);
  }
}

testResearchGapFeature();
