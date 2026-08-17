async function testLitReviewUpgrade() {
  console.log('=== TESTING LITERATURE REVIEW UPGRADE ===');
  console.log('Topic: هۆشیاری داهێنان لای مامۆستایانی باخچەی منداڵان لە پارێزگای دهۆک\n');

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
    const litSec = data.sections?.find(s => s.id === 'literature');
    console.log('----------------------------------------------------');
    console.log('LITERATURE REVIEW TITLE:', litSec?.title);
    console.log('----------------------------------------------------');
    console.log('LITERATURE REVIEW CONTENT:\n', litSec?.content);
    console.log('----------------------------------------------------');
  } catch (err) {
    console.error('Test Error:', err);
  }
}

testLitReviewUpgrade();
