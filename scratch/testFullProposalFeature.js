async function testFullProposalFeature() {
  console.log('=== TESTING PRODUCTION RESEARCH PROPOSAL GENERATOR & SECTION REGENERATION ===');
  console.log('Topic: هۆشیاری داهێنان لای مامۆستایانی باخچەی منداڵان لە پارێزگای دهۆک\n');

  try {
    // 1. Test Full Proposal Generation
    const res = await fetch('http://localhost:3000/api/generate-full-proposal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'هۆشیاری داهێنان لای مامۆستایانی باخچەی منداڵان لە پارێزگای دهۆک',
        field: 'پەروەردەی کۆرپەلە و منداڵان',
        academicLevel: "Master's",
        researchType: 'Quantitative',
        language: 'bad',
        proposalDepth: 'Detailed',
        researcherName: 'هێڤی ئەحمەد',
        university: 'زانکۆیا دهۆک',
        college: 'کۆلیژا پەروەردەیا بنەڕەتی',
        department: 'پەشێ باخچەی منداڵان',
        supervisorName: 'د. ئازاد ساڵح',
        researchQuestions: '1. ئاستێ هۆشیارییا داهێنانێ لای مامۆستایان چەندە؟'
      })
    });

    const data = await res.json();
    console.log('----------------------------------------------------');
    console.log('PROPOSAL ID:', data.id);
    console.log('TITLE:', data.title);
    console.log('RESEARCHER:', data.researcherName, '(', data.university, ')');
    console.log('CONSISTENCY SCORE:', data.consistencyResult?.score, '(', data.consistencyResult?.scorePercentage, '%)');
    console.log('----------------------------------------------------');
    console.log('ABSTRACT EXCERPT:');
    console.log(data.abstractText?.substring(0, 250));
    console.log('----------------------------------------------------');
    console.log('PROBLEM STATEMENT EXCERPT:');
    console.log(data.problemStatementText?.substring(0, 250));
    console.log('----------------------------------------------------');
    console.log('CONCEPTUAL FRAMEWORK VARIABLES:');
    console.log('  IVs:', data.conceptualFramework?.independentVariables);
    console.log('  DVs:', data.conceptualFramework?.dependentVariables);
    console.log('----------------------------------------------------');
    console.log('TIMELINE PHASES COUNT:', data.timelinePhases?.length);
    console.log('REFERENCES COUNT:', data.referencesText?.length);

    // 2. Test Single Section Regeneration
    console.log('\n--- TESTING SINGLE SECTION REGENERATION (Problem Statement) ---');
    const regenRes = await fetch('http://localhost:3000/api/regenerate-proposal-section', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sectionCode: '05_problem_statement',
        sectionTitle: 'Problem Statement',
        proposalTitle: data.title,
        currentSectionContent: data.problemStatementText,
        proposalContext: data.abstractText,
        language: 'bad',
        academicLevel: "Master's"
      })
    });
    const regenData = await regenRes.json();
    console.log('REGENERATED SECTION CODE:', regenData.sectionCode);
    console.log('REGENERATED CONTENT EXCERPT:\n', regenData.newContent?.substring(0, 200));

  } catch (err) {
    console.error('Test Error:', err);
  }
}

testFullProposalFeature();
