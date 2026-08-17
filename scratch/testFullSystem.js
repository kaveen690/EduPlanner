async function testFullSystem() {
  console.log('=== 1. TESTING ACADEMIC SEARCH API ===');
  try {
    const resSearch = await fetch('http://localhost:3000/api/academic-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Artificial Intelligence in Higher Education', language: 'en' })
    });
    const dataSearch = await resSearch.json();
    console.log('SEARCH RESULTS COUNT:', dataSearch.results?.length);
    if (dataSearch.results?.[0]) {
      console.log('SAMPLE RESULT:', dataSearch.results[0].title, '(', dataSearch.results[0].year, ')');
    }
  } catch (err) {
    console.error('Search API error:', err);
  }

  console.log('\n=== 2. TESTING LITERATURE SYNTHESIS API ===');
  try {
    const resSynth = await fetch('http://localhost:3000/api/literature-synthesis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'Impact of AI on Student Critical Thinking',
        field: 'Educational Technology',
        language: 'en',
        sources: [
          { title: 'AI Tools in Writing Instruction', authors: 'Smith et al.', year: 2023, journal: 'Computers & Education', abstract: 'Evaluates writing proficiency changes.' }
        ]
      })
    });
    const dataSynth = await resSynth.json();
    console.log('EXECUTIVE SYNTHESIS (snippet):', dataSynth.executiveSynthesis?.substring(0, 150));
    console.log('RESEARCH GAPS (snippet):', dataSynth.researchGaps?.substring(0, 150));
  } catch (err) {
    console.error('Synthesis API error:', err);
  }

  console.log('\n=== 3. TESTING SINGLE-LANGUAGE RESEARCH PAPER GENERATION (DOCTORAL DEPTH) ===');
  try {
    const resPaper = await fetch('http://localhost:3000/api/generate-research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'هۆشیاری داهێنان لای مامۆستایانی باخچەی منداڵان لە پارێزگای دهۆک',
        field: 'پەروەردەی کۆرپەلە و منداڵان',
        paperType: 'empirical',
        wordCount: 5000,
        language: 'bad',
        academicLevel: 'Doctoral Dissertation (Ph.D.)',
        depthLevel: 'exhaustive_doctoral'
      })
    });
    const dataPaper = await resPaper.json();
    console.log('PAPER TITLE:', dataPaper.title);
    console.log('SECTIONS COUNT:', dataPaper.sections?.length);
    console.log('SECTION 1:', dataPaper.sections?.[0]?.title);
    console.log('SECTION 4 (DATA ANALYSIS PLAN):', dataPaper.sections?.[3]?.title, '->', dataPaper.sections?.[3]?.content?.substring(0, 140));
  } catch (err) {
    console.error('Paper Generation API error:', err);
  }
}

testFullSystem();
