import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';

async function testExcelUpload() {
  const xlsxEngine = XLSX.default || XLSX;
  const filePath = path.join(process.cwd(), 'scratch', 'test_excel.xlsx');
  
  const sampleData = [
    { Student_ID: 101, Faculty: 'Science', GPA: 3.85, Score: 92 },
    { Student_ID: 102, Faculty: 'Engineering', GPA: 3.40, Score: 85 },
    { Student_ID: 103, Faculty: 'Medicine', GPA: 3.95, Score: 97 }
  ];

  const worksheet = xlsxEngine.utils.json_to_sheet(sampleData);
  const workbook = xlsxEngine.utils.book_new();
  xlsxEngine.utils.book_append_sheet(workbook, worksheet, 'SurveyData');
  xlsxEngine.writeFile(workbook, filePath);

  const fileBlob = new Blob([fs.readFileSync(filePath)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const formData = new FormData();
  formData.append('file', fileBlob, 'test_excel.xlsx');

  try {
    const res = await fetch('http://localhost:3000/api/data-analysis/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    console.log('--- EXCEL UPLOAD API TEST RESULT ---');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Excel upload test error:', err);
  }
}

testExcelUpload();
