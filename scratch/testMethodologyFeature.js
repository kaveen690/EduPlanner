async function testMethodologyFeature() {
  console.log('=== TESTING ACADEMIC METHODOLOGY GENERATOR & ALIGNMENT MATRIX ===');
  console.log('Topic: هۆشیاری داهێنان لای مامۆستایانی باخچەی منداڵان لە پارێزگای دهۆک\n');

  try {
    const res = await fetch('http://localhost:3000/api/generate-detailed-methodology', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'هۆشیاری داهێنان لای مامۆستایانی باخچەی منداڵان لە پارێزگای دهۆک',
        field: 'پەروەردەی کۆرپەلە و منداڵان',
        academicLevel: 'Doctoral Dissertation (Ph.D.)',
        language: 'bad',
        studyStatus: 'Proposal / Planned Study',
        preferredSoftware: 'SPSS',
        researchQuestions: 'What is the level of innovation awareness among kindergarten teachers in Duhok governorate?'
      })
    });

    const data = await res.json();
    console.log('----------------------------------------------------');
    console.log('RESEARCH DESIGN:', data.researchDesign);
    console.log('STUDY STATUS:', data.studyStatus);
    console.log('TARGET POPULATION:', data.targetPopulation);
    console.log('POPULATION SIZE NOTE:', data.populationSizeNote);
    console.log('SAMPLING STRATEGY:', data.samplingStrategy);
    console.log('SAMPLE RECOMMENDATION:', data.sampleRecommendation);
    console.log('RECOMMENDED INSTRUMENTS:', data.recommendedInstruments);
    console.log('SOFTWARE:', data.preferredSoftware);
    console.log('----------------------------------------------------');
    console.log('QUESTIONNAIRE STRUCTURE:');
    console.log(data.questionnaireStructure);
    console.log('----------------------------------------------------');
    console.log('RESEARCH ALIGNMENT MATRIX:');
    console.log(data.alignmentMatrix);
    console.log('----------------------------------------------------');
    console.log('FULL METHODOLOGY CHAPTER EXCERPT:');
    console.log(data.fullMethodologyChapter?.substring(0, 300));
    console.log('----------------------------------------------------');
  } catch (err) {
    console.error('Test Error:', err);
  }
}

testMethodologyFeature();
