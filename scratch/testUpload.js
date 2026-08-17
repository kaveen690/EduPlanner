import fs from 'fs';
import path from 'path';

async function testUpload() {
  const filePath = path.join(process.cwd(), 'scratch', 'test_sample.csv');
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  fs.writeFileSync(filePath, 'RespondentID,Gender,Faculty,TeachingExp,AI_Awareness,AI_Acceptance,ResearchOutput\n1,Female,Science,5,4.2,4.5,8\n2,Male,Engineering,12,3.8,4.1,14\n');

  const fileBlob = new Blob([fs.readFileSync(filePath)], { type: 'text/csv' });
  const formData = new FormData();
  formData.append('file', fileBlob, 'test_sample.csv');

  try {
    const res = await fetch('http://localhost:3000/api/data-analysis/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    console.log('--- UPLOAD API TEST RESULT ---');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Upload test error:', err);
  }
}

testUpload();
