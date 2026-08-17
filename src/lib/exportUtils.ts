import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import PptxGenJS from 'pptxgenjs';
import * as XLSX from 'xlsx';
import { ResearchPaper, ReportData, SeminarPresentation, SpssAnalysisOutput, LitReviewData, ProposalData, FullResearchProposalData, ThesisData, SpssDataset } from '../types';

/**
 * LIT REVIEW EXPORTS
 */
export async function exportLitReviewToWord(review: LitReviewData) {
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
      children: [new TextRun({ text: review.title, bold: true, size: 32, font: 'Times New Roman' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: `Field: ${review.field} | Systematic Academic Literature Review & Meta-Synthesis`, italics: true, size: 20, color: '64748B', font: 'Times New Roman' })]
    }),
    
    // 1. Executive Synthesis
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 150 },
      children: [new TextRun({ text: '1. Executive Literature Synthesis', bold: true, size: 26, font: 'Times New Roman' })]
    }),
    new Paragraph({
      spacing: { after: 300, line: 360 },
      children: [new TextRun({ text: review.executiveSynthesis || '', size: 24, font: 'Times New Roman' })]
    }),

    // 2. Thematic Matrix & Literature Clusters
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 150 },
      children: [new TextRun({ text: '2. Thematic Matrix & Literature Clusters', bold: true, size: 26, font: 'Times New Roman' })]
    })
  ];

  if (review.themes && review.themes.length > 0) {
    review.themes.forEach((theme, idx) => {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          children: [new TextRun({ text: `Theme ${idx + 1}: ${theme.themeName}`, bold: true, size: 24, font: 'Times New Roman' })]
        }),
        new Paragraph({
          spacing: { after: 150, line: 360 },
          children: [new TextRun({ text: theme.synthesis, size: 24, font: 'Times New Roman' })]
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: 'Key Supporting Studies: ', bold: true, size: 22, font: 'Times New Roman' }),
            new TextRun({ text: theme.keyStudies.join('; '), italics: true, size: 22, font: 'Times New Roman' })
          ]
        }),
        new Paragraph({
          spacing: { after: 250 },
          children: [
            new TextRun({ text: 'Identified Research Gap: ', bold: true, size: 22, font: 'Times New Roman', color: 'B45309' }),
            new TextRun({ text: theme.researchGap, size: 22, font: 'Times New Roman' })
          ]
        })
      );
    });
  }

  // 3. Similarities & Empirical Consensus
  if (review.similaritiesAndConsensus) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 150 },
        children: [new TextRun({ text: '3. Similarities & Empirical Consensus', bold: true, size: 26, font: 'Times New Roman' })]
      }),
      new Paragraph({
        spacing: { after: 300, line: 360 },
        children: [new TextRun({ text: review.similaritiesAndConsensus, size: 24, font: 'Times New Roman' })]
      })
    );
  }

  // 4. Methodological Differences
  if (review.methodologicalDifferences) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 150 },
        children: [new TextRun({ text: '4. Methodological Differences & Comparative Analysis', bold: true, size: 26, font: 'Times New Roman' })]
      }),
      new Paragraph({
        spacing: { after: 300, line: 360 },
        children: [new TextRun({ text: review.methodologicalDifferences, size: 24, font: 'Times New Roman' })]
      })
    );
  }

  // 5. Empirical Research Gaps
  if (review.researchGaps) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 150 },
        children: [new TextRun({ text: '5. Empirical Research Gaps', bold: true, size: 26, font: 'Times New Roman' })]
      }),
      new Paragraph({
        spacing: { after: 300, line: 360 },
        children: [new TextRun({ text: review.researchGaps, size: 24, font: 'Times New Roman' })]
      })
    );
  }

  // 6. Future Research Directions
  if (review.futureResearchDirections) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 150 },
        children: [new TextRun({ text: '6. Future Research Directions & Opportunities', bold: true, size: 26, font: 'Times New Roman' })]
      }),
      new Paragraph({
        spacing: { after: 300, line: 360 },
        children: [new TextRun({ text: review.futureResearchDirections, size: 24, font: 'Times New Roman' })]
      })
    );
  }

  // 7. Critical Appraisal
  if (review.criticalAppraisal) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 150 },
        children: [new TextRun({ text: '7. Critical Appraisal & Study Rigor', bold: true, size: 26, font: 'Times New Roman' })]
      }),
      new Paragraph({
        spacing: { after: 300, line: 360 },
        children: [new TextRun({ text: review.criticalAppraisal, size: 24, font: 'Times New Roman' })]
      })
    );
  }

  // 8. References (APA 7th Edition)
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [new TextRun({ text: 'References (APA 7th Edition)', bold: true, size: 26, font: 'Times New Roman' })]
    })
  );

  if (review.references && review.references.length > 0) {
    for (const ref of review.references) {
      children.push(
        new Paragraph({
          spacing: { after: 150, line: 360 },
          children: [new TextRun({ text: ref, size: 22, font: 'Times New Roman' })]
        })
      );
    }
  }

  const doc = new Document({
    sections: [{ properties: {}, children }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Literature_Review_${review.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}.docx`);
}

export function exportLitReviewToPdf(review: LitReviewData) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const margin = 50;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 60;

  // Document Title
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  const titleLines = doc.splitTextToSize(review.title, pageWidth - margin * 2);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 22 + 10;

  // Subtitle / Metadata
  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Field: ${review.field} | Systematic Literature Review & Synthesis`, margin, y);
  doc.setTextColor(0);
  y += 25;

  const addSectionHeading = (text: string) => {
    if (y > 720) { doc.addPage(); y = 50; }
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.text(text, margin, y);
    y += 18;
  };

  const addParagraphText = (text: string) => {
    if (!text) return;
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    for (const line of lines) {
      if (y > 730) { doc.addPage(); y = 50; }
      doc.text(line, margin, y);
      y += 15;
    }
    y += 15;
  };

  // Executive Synthesis
  addSectionHeading('1. Executive Literature Synthesis');
  addParagraphText(review.executiveSynthesis);

  // Thematic Clusters
  if (review.themes && review.themes.length > 0) {
    addSectionHeading('2. Thematic Matrix & Literature Clusters');
    review.themes.forEach((t, i) => {
      if (y > 700) { doc.addPage(); y = 50; }
      doc.setFont('times', 'bold');
      doc.setFontSize(11);
      doc.text(`Theme ${i + 1}: ${t.themeName}`, margin, y);
      y += 15;
      addParagraphText(t.synthesis);
    });
  }

  // Similarities & Consensus
  if (review.similaritiesAndConsensus) {
    addSectionHeading('3. Similarities & Empirical Consensus');
    addParagraphText(review.similaritiesAndConsensus);
  }

  // Methodological Differences
  if (review.methodologicalDifferences) {
    addSectionHeading('4. Methodological Differences & Comparative Analysis');
    addParagraphText(review.methodologicalDifferences);
  }

  // Empirical Research Gaps
  if (review.researchGaps) {
    addSectionHeading('5. Empirical Research Gaps');
    addParagraphText(review.researchGaps);
  }

  // Future Directions
  if (review.futureResearchDirections) {
    addSectionHeading('6. Future Research Directions & Opportunities');
    addParagraphText(review.futureResearchDirections);
  }

  // Critical Appraisal
  if (review.criticalAppraisal) {
    addSectionHeading('7. Critical Appraisal');
    addParagraphText(review.criticalAppraisal);
  }

  // References
  if (review.references && review.references.length > 0) {
    addSectionHeading('8. References (APA 7th Edition)');
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    review.references.forEach(ref => {
      const refLines = doc.splitTextToSize(ref, pageWidth - margin * 2);
      for (const line of refLines) {
        if (y > 730) { doc.addPage(); y = 50; }
        doc.text(line, margin, y);
        y += 13;
      }
      y += 5;
    });
  }

  doc.save(`LitReview_${review.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}.pdf`);
}

export function exportLitReviewToLatex(review: LitReviewData) {
  const sanitize = (str: string) => (str || '').replace(/%/g, '\\%').replace(/\$/g, '\\$').replace(/&/g, '\\&').replace(/#/g, '\\#').replace(/_/g, '\\_');

  let tex = `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}
\\usepackage{amsmath,amssymb}
\\usepackage{booktabs}
\\usepackage{hyperref}

\\title{${sanitize(review.title)}}
\\author{Systematic Academic Literature Synthesis Engine}
\\date{\\today}

\\begin{document}
\\maketitle

\\begin{abstract}
${sanitize(review.executiveSynthesis)}
\\end{abstract}

\\section{Executive Literature Synthesis}
${sanitize(review.executiveSynthesis)}

\\section{Thematic Matrix \\& Literature Clusters}
`;

  if (review.themes && review.themes.length > 0) {
    review.themes.forEach((t, i) => {
      tex += `\\subsection{Theme ${i + 1}: ${sanitize(t.themeName)}}
${sanitize(t.synthesis)}

\\textbf{Key Supporting Studies:} ${sanitize(t.keyStudies.join(', '))} \\\\
\\textbf{Identified Research Gap:} ${sanitize(t.researchGap)}

`;
    });
  }

  if (review.similaritiesAndConsensus) {
    tex += `\\section{Similarities \\& Empirical Consensus}
${sanitize(review.similaritiesAndConsensus)}

`;
  }

  if (review.methodologicalDifferences) {
    tex += `\\section{Methodological Differences \\& Comparative Analysis}
${sanitize(review.methodologicalDifferences)}

`;
  }

  if (review.researchGaps) {
    tex += `\\section{Empirical Research Gaps}
${sanitize(review.researchGaps)}

`;
  }

  if (review.futureResearchDirections) {
    tex += `\\section{Future Research Directions \\& Opportunities}
${sanitize(review.futureResearchDirections)}

`;
  }

  if (review.criticalAppraisal) {
    tex += `\\section{Critical Appraisal}
${sanitize(review.criticalAppraisal)}

`;
  }

  tex += `\\section{APA 7 References \\& Bibliography}
\\begin{enumerate}
`;
  if (review.references && review.references.length > 0) {
    review.references.forEach(ref => {
      tex += `  \\item ${sanitize(ref)}\n`;
    });
  }
  tex += `\\end{enumerate}

\\end{document}
`;

  const blob = new Blob([tex], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `LitReview_${review.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}.tex`);
}

/**
 * PROPOSAL EXPORTS
 */
export async function exportProposalToWord(proposal: any) {
  const isFull = 'abstractText' in proposal || 'problemStatementText' in proposal;
  const pTitle = proposal.title || 'Research Proposal';

  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
      children: [new TextRun({ text: pTitle, bold: true, size: 32 })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: `Field: ${proposal.field || 'General'} | Level: ${proposal.academicLevel || 'Master'} | Full Research Proposal`, italics: true, size: 20 })]
    })
  ];

  if (isFull) {
    const fullP = proposal as FullResearchProposalData;
    const addSection = (hTitle: string, contentStr?: string) => {
      if (!contentStr || !contentStr.trim()) return;
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
          children: [new TextRun({ text: hTitle, bold: true, size: 26 })]
        })
      );
      contentStr.split(/\n\s*\n/).forEach(p => {
        children.push(
          new Paragraph({
            spacing: { after: 160 },
            children: [new TextRun({ text: p.trim(), size: 24 })]
          })
        );
      });
    };

    addSection('Title Page Details', fullP.titlePageText);
    addSection('Abstract', fullP.abstractText);
    addSection('1. Introduction', fullP.introductionText);
    addSection('2. Background of the Study', fullP.backgroundText);
    addSection('3. Problem Statement', fullP.problemStatementText);
    addSection('4. Purpose of the Study', fullP.purposeText);
    addSection('5. Research Objectives', fullP.objectivesText);
    addSection('6. Research Questions', fullP.questionsText);
    if (fullP.hypothesesText) addSection('7. Research Hypotheses', fullP.hypothesesText);
    addSection('8. Significance of the Study', fullP.significanceText);
    addSection('9. Scope and Delimitations', fullP.scopeDelimitationsText);
    addSection('10. Definition of Key Terms', fullP.definitionTermsText);
    addSection('11. Literature Review', fullP.literatureReviewText);
    addSection('12. Research Gap', fullP.researchGapText);
    addSection('13. Theoretical Framework', fullP.theoreticalFrameworkText);
    if (fullP.conceptualFramework?.textualExplanation) {
      addSection('14. Conceptual Framework', fullP.conceptualFramework.textualExplanation);
    }
    addSection('15. Research Methodology', fullP.methodologyChapterText);
    addSection('16. Expected Results & Academic Contribution', fullP.expectedResultsText);
    addSection('17. Potential Limitations of the Study', fullP.limitationsText);
    
    if (fullP.timelinePhases && fullP.timelinePhases.length > 0) {
      addSection('18. Proposed Research Timeline', fullP.timelinePhases.map(tp => `• ${tp.phase} (${tp.duration}): ${tp.tasks?.join(', ')}`).join('\n'));
    }

    if (fullP.referencesText && fullP.referencesText.length > 0) {
      addSection('19. References (APA 7th Edition)', fullP.referencesText.join('\n'));
    }

    if (fullP.appendicesText) addSection('20. Appendices', fullP.appendicesText);
  } else {
    // Basic Proposal Data fallback
    const basicP = proposal as ProposalData;
    children.push(
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: 'Problem Statement', bold: true, size: 26 })] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: basicP.problemStatement || '', size: 24 })] }),
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: 'Methodology', bold: true, size: 26 })] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: basicP.methodology || '', size: 24 })] })
    );
  }

  const doc = new Document({
    sections: [{ properties: {}, children }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Proposal_${pTitle.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}.docx`);
}

export function exportProposalToPdf(proposal: any) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const margin = 50;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 60;

  const isFull = 'abstractText' in proposal || 'problemStatementText' in proposal;
  const pTitle = proposal.title || 'Research Proposal';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  const titleLines = doc.splitTextToSize(pTitle, pageWidth - margin * 2);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 20 + 15;

  const addPdfSection = (head: string, body?: string) => {
    if (!body || !body.trim()) return;
    if (y > 700) { doc.addPage(); y = 50; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(head, margin, y);
    y += 18;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(body.trim(), pageWidth - margin * 2);
    for (const line of lines) {
      if (y > 730) { doc.addPage(); y = 50; }
      doc.text(line, margin, y);
      y += 14;
    }
    y += 10;
  };

  if (isFull) {
    const fullP = proposal as FullResearchProposalData;
    addPdfSection('Abstract', fullP.abstractText);
    addPdfSection('1. Introduction & Background', `${fullP.introductionText}\n\n${fullP.backgroundText}`);
    addPdfSection('2. Problem Statement', fullP.problemStatementText);
    addPdfSection('3. Research Objectives & Questions', `${fullP.objectivesText}\n\n${fullP.questionsText}`);
    addPdfSection('4. Research Gap', fullP.researchGapText);
    addPdfSection('5. Theoretical & Conceptual Framework', `${fullP.theoreticalFrameworkText}\n\n${fullP.conceptualFramework?.textualExplanation || ''}`);
    addPdfSection('6. Research Methodology', fullP.methodologyChapterText);
    addPdfSection('7. Expected Contributions & Limitations', `${fullP.expectedResultsText}\n\n${fullP.limitationsText}`);
    if (fullP.referencesText && fullP.referencesText.length > 0) {
      addPdfSection('8. References (APA 7th)', fullP.referencesText.join('\n'));
    }
  } else {
    addPdfSection('Problem Statement', proposal.problemStatement);
    addPdfSection('Methodology', proposal.methodology);
  }

  doc.save(`Proposal_${pTitle.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}.pdf`);
}

/**
 * THESIS EXPORTS
 */
export async function exportThesisToWord(thesis: ThesisData) {
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
      children: [new TextRun({ text: thesis.thesisTitle, bold: true, size: 32, font: 'Times New Roman' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: `Academic Degree: ${thesis.academicLevel} | Domain: ${thesis.field}`, italics: true, size: 20, color: '475569', font: 'Times New Roman' })]
    }),

    // 1. Central Thesis Statement
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 150 },
      children: [new TextRun({ text: '1. Central Thesis Statement', bold: true, size: 24, font: 'Times New Roman' })]
    }),
    new Paragraph({
      spacing: { after: 300 },
      children: [new TextRun({ text: `"${thesis.centralThesisStatement}"`, italics: true, size: 22, font: 'Times New Roman' })]
    }),

    // 2. Abstract
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 150 },
      children: [new TextRun({ text: '2. Executive Thesis Abstract', bold: true, size: 24, font: 'Times New Roman' })]
    }),
    new Paragraph({
      spacing: { after: 300 },
      children: [new TextRun({ text: thesis.abstract || 'No abstract provided.', size: 22, font: 'Times New Roman' })]
    }),

    // 3. Chapter Breakdown (Introduction, Lit Review, Methodology, Results, Discussion, Conclusion)
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [new TextRun({ text: '3. Architectural Chapter Breakdown', bold: true, size: 24, font: 'Times New Roman' })]
    })
  ];

  if (thesis.chapters && thesis.chapters.length > 0) {
    thesis.chapters.forEach((ch) => {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 250, after: 100 },
          children: [new TextRun({ text: `Chapter ${ch.chapterNumber}: ${ch.chapterTitle}`, bold: true, size: 22, font: 'Times New Roman' })]
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [new TextRun({ text: `Objective: ${ch.objective}`, italics: true, size: 20, color: '334155', font: 'Times New Roman' })]
        })
      );

      if (ch.outline && ch.outline.length > 0) {
        children.push(
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: 'Section Outline:', bold: true, size: 20, font: 'Times New Roman' })]
          })
        );
        ch.outline.forEach((item) => {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              children: [new TextRun({ text: item, size: 20, font: 'Times New Roman' })]
            })
          );
        });
      }

      if (ch.keyArguments && ch.keyArguments.length > 0) {
        children.push(
          new Paragraph({
            spacing: { before: 100, after: 50 },
            children: [new TextRun({ text: 'Core Arguments & Theoretical Foundations:', bold: true, size: 20, font: 'Times New Roman' })]
          })
        );
        ch.keyArguments.forEach((arg) => {
          children.push(
            new Paragraph({
              bullet: { level: 0 },
              children: [new TextRun({ text: arg, size: 20, font: 'Times New Roman' })]
            })
          );
        });
      }
    });
  }

  // 4. Defense Committee Q&A Preparation
  if (thesis.defensePreparation && thesis.defensePreparation.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [new TextRun({ text: '4. Defense Committee Preparation & Q&A Strategy', bold: true, size: 24, font: 'Times New Roman' })]
      })
    );
    thesis.defensePreparation.forEach((qa, idx) => {
      children.push(
        new Paragraph({
          spacing: { before: 150, after: 50 },
          children: [new TextRun({ text: `Q${idx + 1}: ${qa.question}`, bold: true, size: 21, color: '1E3A8A', font: 'Times New Roman' })]
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: `Suggested Response: ${qa.sampleAnswer}`, size: 20, font: 'Times New Roman' })]
        })
      );
    });
  }

  const doc = new Document({
    sections: [{ properties: {}, children }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Thesis_${thesis.thesisTitle.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}.docx`);
}

export function exportThesisToPdf(thesis: ThesisData) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const margin = 50;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 60;

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Header Title
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  const titleLines = doc.splitTextToSize(thesis.thesisTitle, pageWidth - margin * 2);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 22 + 10;

  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.text(`Degree Level: ${thesis.academicLevel} | Domain: ${thesis.field}`, margin, y);
  y += 25;

  // Central Thesis Statement
  checkPageBreak(60);
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.text('Central Thesis Statement:', margin, y);
  y += 18;
  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  const thesisLines = doc.splitTextToSize(`"${thesis.centralThesisStatement}"`, pageWidth - margin * 2);
  doc.text(thesisLines, margin, y);
  y += thesisLines.length * 15 + 20;

  // Abstract
  if (thesis.abstract) {
    checkPageBreak(80);
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.text('Thesis Abstract:', margin, y);
    y += 18;
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    const absLines = doc.splitTextToSize(thesis.abstract, pageWidth - margin * 2);
    doc.text(absLines, margin, y);
    y += absLines.length * 14 + 20;
  }

  // Chapters
  if (thesis.chapters && thesis.chapters.length > 0) {
    checkPageBreak(60);
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.text('Architectural Chapters Breakdown:', margin, y);
    y += 22;

    thesis.chapters.forEach((ch) => {
      checkPageBreak(60);
      doc.setFont('times', 'bold');
      doc.setFontSize(12);
      doc.text(`Chapter ${ch.chapterNumber}: ${ch.chapterTitle}`, margin, y);
      y += 16;

      doc.setFont('times', 'italic');
      doc.setFontSize(10);
      const objLines = doc.splitTextToSize(`Objective: ${ch.objective}`, pageWidth - margin * 2);
      doc.text(objLines, margin, y);
      y += objLines.length * 14 + 10;

      if (ch.outline) {
        ch.outline.forEach((out) => {
          checkPageBreak(20);
          doc.setFont('times', 'normal');
          doc.setFontSize(10);
          doc.text(`• ${out}`, margin + 15, y);
          y += 14;
        });
      }
      y += 10;
    });
  }

  // Defense Preparation
  if (thesis.defensePreparation && thesis.defensePreparation.length > 0) {
    checkPageBreak(60);
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.text('Defense Committee Q&A Preparation:', margin, y);
    y += 20;

    thesis.defensePreparation.forEach((qa, idx) => {
      checkPageBreak(50);
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      const qLines = doc.splitTextToSize(`Q${idx + 1}: ${qa.question}`, pageWidth - margin * 2);
      doc.text(qLines, margin, y);
      y += qLines.length * 14 + 5;

      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      const aLines = doc.splitTextToSize(`Strategy: ${qa.sampleAnswer}`, pageWidth - margin * 2);
      doc.text(aLines, margin + 15, y);
      y += aLines.length * 14 + 15;
    });
  }

  doc.save(`Thesis_${thesis.thesisTitle.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}.pdf`);
}

/**
 * 1. RESEARCH PAPER EXPORTS
 */
export async function exportResearchToWord(paper: ResearchPaper) {
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: paper.title,
          bold: true,
          size: 32,
          font: 'Times New Roman'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 500 },
      children: [
        new TextRun({
          text: `Field: ${paper.field} | Type: ${(paper.paperType || 'empirical').replace('_', ' ').toUpperCase()} | Citation Style: APA 7th Edition`,
          italics: true,
          size: 20,
          color: '64748B',
          font: 'Times New Roman'
        })
      ]
    })
  );

  // Abstract Section
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 150 },
      children: [
        new TextRun({
          text: 'Abstract',
          bold: true,
          size: 26,
          font: 'Times New Roman'
        })
      ]
    }),
    new Paragraph({
      spacing: { after: 300, line: 360 }, // Double line spacing APA
      children: [
        new TextRun({
          text: paper.abstract,
          size: 24,
          font: 'Times New Roman'
        })
      ]
    }),
    new Paragraph({
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: 'Keywords: ',
          bold: true,
          italics: true,
          size: 22,
          font: 'Times New Roman'
        }),
        new TextRun({
          text: paper.keywords ? paper.keywords.join(', ') : 'Academic research, AI analysis, APA 7',
          italics: true,
          size: 22,
          font: 'Times New Roman'
        })
      ]
    })
  );

  // Sections
  for (const sec of paper.sections) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: sec.title,
            bold: true,
            size: 26,
            font: 'Times New Roman'
          })
        ]
      })
    );

    const paragraphs = sec.content.split('\n\n').filter(p => p.trim());
    for (const pText of paragraphs) {
      children.push(
        new Paragraph({
          spacing: { after: 240, line: 360 },
          indent: { firstLine: 720 }, // APA 0.5 inch indent
          children: [
            new TextRun({
              text: pText.trim(),
              size: 24,
              font: 'Times New Roman'
            })
          ]
        })
      );
    }
  }

  // References Section (APA 7th Edition)
  if (paper.references && paper.references.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 600, after: 300 },
        children: [
          new TextRun({
            text: 'References',
            bold: true,
            size: 26,
            font: 'Times New Roman'
          })
        ]
      })
    );

    for (const ref of paper.references) {
      children.push(
        new Paragraph({
          spacing: { after: 200, line: 360 },
          indent: { left: 720, hanging: 720 }, // APA 7 Hanging indent
          children: [
            new TextRun({
              text: ref,
              size: 24,
              font: 'Times New Roman'
            })
          ]
        })
      );
    }
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } // 1 inch margins
        }
      },
      children
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${paper.title.replace(/[^a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F]/g, '_')}_Research.docx`);
}

export function exportResearchToPdf(paper: ResearchPaper) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 50;
  const maxLineWidth = pageWidth - margin * 2;
  let y = 60;

  // Title
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  const titleLines = doc.splitTextToSize(paper.title, maxLineWidth);
  doc.text(titleLines, pageWidth / 2, y, { align: 'center' });
  y += titleLines.length * 22 + 10;

  // Metadata
  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Field: ${paper.field} | APA 7th Edition`, pageWidth / 2, y, { align: 'center' });
  y += 25;
  doc.setTextColor(0);

  // Abstract
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.text('Abstract', margin, y);
  y += 18;

  doc.setFont('times', 'normal');
  doc.setFontSize(10.5);
  const absLines = doc.splitTextToSize(paper.abstract, maxLineWidth);
  doc.text(absLines, margin, y);
  y += absLines.length * 15 + 20;

  // Sections
  for (const sec of paper.sections) {
    if (y > 750) {
      doc.addPage();
      y = 50;
    }

    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.text(sec.title, margin, y);
    y += 18;

    doc.setFont('times', 'normal');
    doc.setFontSize(10.5);
    const contentLines = doc.splitTextToSize(sec.content, maxLineWidth);

    for (let i = 0; i < contentLines.length; i++) {
      if (y > 770) {
        doc.addPage();
        y = 50;
      }
      doc.text(contentLines[i], margin, y);
      y += 15;
    }
    y += 15;
  }

  // References
  if (paper.references && paper.references.length > 0) {
    if (y > 700) {
      doc.addPage();
      y = 50;
    }
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.text('References', margin, y);
    y += 20;

    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    for (const ref of paper.references) {
      const refLines = doc.splitTextToSize(ref, maxLineWidth);
      if (y + refLines.length * 13 > 770) {
        doc.addPage();
        y = 50;
      }
      doc.text(refLines, margin, y);
      y += refLines.length * 13 + 8;
    }
  }

  doc.save(`${paper.title.replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_')}_Research.pdf`);
}

export function exportResearchToLatex(paper: ResearchPaper) {
  function escapeLatex(str: string): string {
    if (!str) return '';
    return str
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/&/g, '\\&')
      .replace(/%/g, '\\%')
      .replace(/\$/g, '\\$')
      .replace(/#/g, '\\#')
      .replace(/_/g, '\\_')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/~/g, '\\textasciitilde{}')
      .replace(/\^/g, '\\textasciicircum{}');
  }

  let tex = `% Created with EduPlanner AI Academic Research Platform\n`;
  tex += `\\documentclass[12pt,a4paper]{article}\n`;
  tex += `\\usepackage[utf8]{inputenc}\n`;
  tex += `\\usepackage[margin=1in]{geometry}\n`;
  tex += `\\usepackage{times}\n`;
  tex += `\\usepackage{setspace}\n`;
  tex += `\\usepackage{hyperref}\n`;
  tex += `\\doublespacing\n\n`;

  tex += `\\title{${escapeLatex(paper.title)}}\n`;
  tex += `\\author{${escapeLatex(paper.field || 'Academic Research')}}\n`;
  tex += `\\date{\\today}\n\n`;

  tex += `\\begin{document}\n\n`;
  tex += `\\maketitle\n\n`;

  if (paper.abstract) {
    tex += `\\begin{abstract}\n${escapeLatex(paper.abstract)}\n\\end{abstract}\n\n`;
  }

  if (paper.keywords && paper.keywords.length > 0) {
    tex += `\\noindent\\textbf{Keywords:} ${paper.keywords.map(k => escapeLatex(k)).join(', ')}\\\\\n\\newpage\n\n`;
  }

  for (const sec of paper.sections) {
    tex += `\\section{${escapeLatex(sec.title)}}\n\n`;
    const paragraphs = sec.content.split('\n\n').filter(p => p.trim());
    for (const p of paragraphs) {
      tex += `${escapeLatex(p.trim())}\n\n`;
    }
  }

  if (paper.references && paper.references.length > 0) {
    tex += `\\section*{References}\n\\begin{thebibliography}{99}\n`;
    paper.references.forEach((ref, idx) => {
      tex += `\\bibitem{ref${idx + 1}} ${escapeLatex(ref)}\n`;
    });
    tex += `\\end{thebibliography}\n\n`;
  }

  tex += `\\end{document}\n`;

  const blob = new Blob([tex], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${paper.title.replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_')}_Paper.tex`);
}

/**
 * 2. REPORT EXPORTS
 */
export async function exportReportToWord(report: ReportData) {
  const isRTL = report.language === 'ar' || report.language === 'ku' || report.language === 'bad';
  const align = isRTL ? AlignmentType.RIGHT : AlignmentType.LEFT;
  const children: (Paragraph | Table)[] = [];

  const headingSummary = isRTL ? (report.language === 'bad' ? 'پوختەیا جێبەجێکرنێ' : report.language === 'ku' ? 'پوختەی جێبەجێکردن' : 'الملخص التنفيذي') : 'Executive Summary';
  const headingFindings = isRTL ? (report.language === 'bad' ? 'دەرئەنجامێن سەرەکی' : report.language === 'ku' ? 'ئەنجامە سەرەکییەکان' : 'النتائج الرئيسية') : 'Key Findings';
  const headingAnalysis = isRTL ? (report.language === 'bad' ? 'شیکاریا ورد' : report.language === 'ku' ? 'شیکاری ورد' : 'التحليل التفصيلي') : 'Detailed Analysis';
  const headingRecs = isRTL ? (report.language === 'bad' ? 'پێشنیارێن ستراتیژی' : report.language === 'ku' ? 'پێشنیارە ستراتیژییەکان' : 'التوصيات الاستراتيجية') : 'Strategic Recommendations';

  // Title
  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      bidirectional: isRTL,
      spacing: { after: 200 },
      children: [
        new TextRun({ text: report.title, bold: true, size: 32, font: 'Arial' })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      bidirectional: isRTL,
      spacing: { after: 400 },
      children: [
        new TextRun({ text: `Organization: ${report.organization} | Level: ${report.academicLevel || 'Academic/Executive'} | Language: ${(report.language || 'en').toUpperCase()}`, italics: true, color: '475569', size: 20, font: 'Arial' })
      ]
    })
  );

  // Executive Summary
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: align,
      bidirectional: isRTL,
      spacing: { before: 300, after: 150 },
      children: [new TextRun({ text: headingSummary, bold: true, size: 24, font: 'Arial', color: '1E3A8A' })]
    }),
    new Paragraph({
      alignment: align,
      bidirectional: isRTL,
      spacing: { after: 300, line: 280 },
      children: [new TextRun({ text: report.executiveSummary, size: 22, font: 'Arial' })]
    })
  );

  // Key Findings
  if (report.keyFindings && report.keyFindings.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: align,
        bidirectional: isRTL,
        spacing: { before: 300, after: 150 },
        children: [new TextRun({ text: headingFindings, bold: true, size: 24, font: 'Arial', color: '1E3A8A' })]
      })
    );
    for (const kf of report.keyFindings) {
      children.push(
        new Paragraph({
          alignment: align,
          bidirectional: isRTL,
          spacing: { after: 120 },
          children: [new TextRun({ text: `• ${kf}`, size: 22, font: 'Arial' })]
        })
      );
    }
  }

  // Sections (if available)
  if (report.sections && report.sections.length > 0) {
    for (const sec of report.sections) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          alignment: align,
          bidirectional: isRTL,
          spacing: { before: 350, after: 150 },
          children: [new TextRun({ text: sec.title, bold: true, size: 24, font: 'Arial', color: '1E3A8A' })]
        })
      );
      for (const p of sec.content.split('\n\n')) {
        if (!p.trim()) continue;
        children.push(
          new Paragraph({
            alignment: align,
            bidirectional: isRTL,
            spacing: { after: 180, line: 280 },
            children: [new TextRun({ text: p.trim(), size: 22, font: 'Arial' })]
          })
        );
      }
    }
  }

  // Data Tables
  if (report.dataTables && report.dataTables.length > 0) {
    for (const table of report.dataTables) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          alignment: align,
          bidirectional: isRTL,
          spacing: { before: 300, after: 150 },
          children: [new TextRun({ text: table.title, bold: true, size: 22, font: 'Arial' })]
        })
      );

      const tableRows: TableRow[] = [];

      // Header Row
      tableRows.push(
        new TableRow({
          children: table.headers.map(h => new TableCell({
            children: [new Paragraph({ alignment: align, bidirectional: isRTL, children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', font: 'Arial' })] })],
            shading: { fill: '1E3A8A' },
            width: { size: Math.floor(10000 / table.headers.length), type: WidthType.DXA }
          }))
        })
      );

      // Data Rows
      for (const rowVals of table.rows) {
        tableRows.push(
          new TableRow({
            children: rowVals.map(cell => new TableCell({
              children: [new Paragraph({ alignment: align, bidirectional: isRTL, children: [new TextRun({ text: String(cell), font: 'Arial' })] })],
              width: { size: Math.floor(10000 / table.headers.length), type: WidthType.DXA }
            }))
          })
        );
      }

      children.push(new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
    }
  }

  // Detailed Analysis
  if (report.detailedAnalysis) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: align,
        bidirectional: isRTL,
        spacing: { before: 400, after: 150 },
        children: [new TextRun({ text: headingAnalysis, bold: true, size: 24, font: 'Arial', color: '1E3A8A' })]
      })
    );
    for (const p of report.detailedAnalysis.split('\n\n')) {
      children.push(
        new Paragraph({
          alignment: align,
          bidirectional: isRTL,
          spacing: { after: 200, line: 280 },
          children: [new TextRun({ text: p.trim(), size: 22, font: 'Arial' })]
        })
      );
    }
  }

  // Recommendations
  if (report.recommendations && report.recommendations.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: align,
        bidirectional: isRTL,
        spacing: { before: 400, after: 150 },
        children: [new TextRun({ text: headingRecs, bold: true, size: 24, font: 'Arial', color: '1E3A8A' })]
      })
    );
    for (const rec of report.recommendations) {
      children.push(
        new Paragraph({
          alignment: align,
          bidirectional: isRTL,
          spacing: { after: 120 },
          children: [new TextRun({ text: `• ${rec}`, size: 22, font: 'Arial' })]
        })
      );
    }
  }

  // References
  if (report.references && report.references.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: align,
        bidirectional: isRTL,
        spacing: { before: 400, after: 150 },
        children: [new TextRun({ text: 'References (APA 7th)', bold: true, size: 24, font: 'Arial', color: '1E3A8A' })]
      })
    );
    for (const ref of report.references) {
      children.push(
        new Paragraph({
          alignment: align,
          bidirectional: isRTL,
          spacing: { after: 100 },
          children: [new TextRun({ text: ref, size: 20, font: 'Arial' })]
        })
      );
    }
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${report.title.replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_')}_Report.docx`);
}

export function exportReportToPdf(report: ReportData) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 50;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(30, 58, 138);
  doc.text(report.title, margin, y);
  y += 30;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Organization: ${report.organization} | Level: ${report.academicLevel || 'Academic'} | Date: ${report.createdAt}`, margin, y);
  y += 25;
  doc.setTextColor(0);

  // Executive summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Executive Summary', margin, y);
  y += 15;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const summaryLines = doc.splitTextToSize(report.executiveSummary, pageWidth - margin * 2);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 14 + 20;

  // Key findings
  if (report.keyFindings && report.keyFindings.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Key Findings', margin, y);
    y += 15;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    for (const kf of report.keyFindings) {
      const kfLines = doc.splitTextToSize(`• ${kf}`, pageWidth - margin * 2);
      if (y + kfLines.length * 14 > 770) { doc.addPage(); y = 50; }
      doc.text(kfLines, margin, y);
      y += kfLines.length * 14 + 5;
    }
    y += 15;
  }

  // Sections
  if (report.sections && report.sections.length > 0) {
    for (const sec of report.sections) {
      if (y > 720) { doc.addPage(); y = 50; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(sec.title, margin, y);
      y += 15;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const secLines = doc.splitTextToSize(sec.content, pageWidth - margin * 2);
      for (const line of secLines) {
        if (y > 770) { doc.addPage(); y = 50; }
        doc.text(line, margin, y);
        y += 14;
      }
      y += 15;
    }
  }

  // Data tables
  if (report.dataTables && report.dataTables.length > 0) {
    for (const table of report.dataTables) {
      if (y > 700) { doc.addPage(); y = 50; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(table.title, margin, y);
      y += 10;

      autoTable(doc, {
        head: [table.headers],
        body: table.rows,
        startY: y,
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 138], textColor: 255 },
        margin: { left: margin, right: margin }
      });
      y = (doc as any).lastAutoTable.finalY + 20;
    }
  }

  // Detailed Analysis
  if (report.detailedAnalysis) {
    if (y > 700) { doc.addPage(); y = 50; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Detailed Analysis', margin, y);
    y += 15;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const analysisLines = doc.splitTextToSize(report.detailedAnalysis, pageWidth - margin * 2);
    for (const line of analysisLines) {
      if (y > 770) { doc.addPage(); y = 50; }
      doc.text(line, margin, y);
      y += 14;
    }
  }

  // References
  if (report.references && report.references.length > 0) {
    if (y > 700) { doc.addPage(); y = 50; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('References', margin, y);
    y += 15;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    for (const ref of report.references) {
      const refLines = doc.splitTextToSize(ref, pageWidth - margin * 2);
      for (const rline of refLines) {
        if (y > 770) { doc.addPage(); y = 50; }
        doc.text(rline, margin, y);
        y += 12;
      }
      y += 4;
    }
  }

  doc.save(`${report.title.replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_')}_Report.pdf`);
}

export async function exportReportToPptx(report: ReportData) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'EduPlanner Report Studio';
  pptx.company = report.organization || 'Academic Platform';

  // 1. Title Slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: '0F172A' };

  titleSlide.addText(report.title, {
    x: 0.8, y: 1.8, w: '85%',
    fontSize: 30, bold: true, color: '38BDF8',
    align: 'left', fontFace: 'Arial'
  });

  titleSlide.addText(`Organization: ${report.organization} | Level: ${report.academicLevel || 'Academic'}`, {
    x: 0.8, y: 3.5, w: '85%',
    fontSize: 16, color: '94A3B8',
    align: 'left', fontFace: 'Arial'
  });

  // 2. Executive Summary Slide
  const execSlide = pptx.addSlide();
  execSlide.background = { color: 'FFFFFF' };
  execSlide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.9, fill: { color: '0F172A' } });
  execSlide.addText('Executive Summary', { x: 0.6, y: 0.2, w: '90%', h: 0.5, fontSize: 22, bold: true, color: '38BDF8', fontFace: 'Arial' });
  execSlide.addText(report.executiveSummary, { x: 0.8, y: 1.4, w: '90%', fontSize: 14, color: '334155', fontFace: 'Arial' });

  // 3. Key Findings Slide
  if (report.keyFindings && report.keyFindings.length > 0) {
    const kfSlide = pptx.addSlide();
    kfSlide.background = { color: 'FFFFFF' };
    kfSlide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.9, fill: { color: '0F172A' } });
    kfSlide.addText('Key Findings & Core Insights', { x: 0.6, y: 0.2, w: '90%', h: 0.5, fontSize: 22, bold: true, color: '38BDF8', fontFace: 'Arial' });
    const bullets = report.keyFindings.map(kf => ({ text: kf, options: { fontSize: 16, color: '1E293B', breakLine: true, fontFace: 'Arial' } }));
    kfSlide.addText(bullets, { x: 0.8, y: 1.4, w: '90%', bullet: true });
  }

  // 4. SWOT Analysis Slide (if available)
  if (report.swot) {
    const swotSlide = pptx.addSlide();
    swotSlide.background = { color: 'F8FAFC' };
    swotSlide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.9, fill: { color: '0F172A' } });
    swotSlide.addText('SWOT Analysis Matrix', { x: 0.6, y: 0.2, w: '90%', h: 0.5, fontSize: 22, bold: true, color: '38BDF8', fontFace: 'Arial' });
    
    swotSlide.addText('Strengths:\n' + report.swot.strengths.map(s => `• ${s}`).join('\n'), { x: 0.6, y: 1.2, w: 5.8, h: 2.5, fontSize: 12, color: '166534', fill: { color: 'DCFCE7' }, margin: 8 });
    swotSlide.addText('Weaknesses:\n' + report.swot.weaknesses.map(w => `• ${w}`).join('\n'), { x: 6.8, y: 1.2, w: 5.8, h: 2.5, fontSize: 12, color: '991B1B', fill: { color: 'FEE2E2' }, margin: 8 });
    swotSlide.addText('Opportunities:\n' + report.swot.opportunities.map(o => `• ${o}`).join('\n'), { x: 0.6, y: 4.0, w: 5.8, h: 2.5, fontSize: 12, color: '1E40AF', fill: { color: 'DBEAFE' }, margin: 8 });
    swotSlide.addText('Threats:\n' + report.swot.threats.map(t => `• ${t}`).join('\n'), { x: 6.8, y: 4.0, w: 5.8, h: 2.5, fontSize: 12, color: '9A3412', fill: { color: 'FFEDD5' }, margin: 8 });
  }

  // 5. Section Slides
  if (report.sections && report.sections.length > 0) {
    for (const sec of report.sections) {
      const secSlide = pptx.addSlide();
      secSlide.background = { color: 'FFFFFF' };
      secSlide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.9, fill: { color: '0F172A' } });
      secSlide.addText(sec.title, { x: 0.6, y: 0.2, w: '90%', h: 0.5, fontSize: 22, bold: true, color: '38BDF8', fontFace: 'Arial' });
      secSlide.addText(sec.content.slice(0, 750) + (sec.content.length > 750 ? '...' : ''), { x: 0.8, y: 1.3, w: '90%', fontSize: 14, color: '334155', fontFace: 'Arial' });
    }
  }

  // 6. Recommendations Slide
  if (report.recommendations && report.recommendations.length > 0) {
    const recSlide = pptx.addSlide();
    recSlide.background = { color: 'FFFFFF' };
    recSlide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.9, fill: { color: '0F172A' } });
    recSlide.addText('Strategic Recommendations', { x: 0.6, y: 0.2, w: '90%', h: 0.5, fontSize: 22, bold: true, color: '38BDF8', fontFace: 'Arial' });
    const recBullets = report.recommendations.map(r => ({ text: r, options: { fontSize: 16, color: '1E293B', breakLine: true, fontFace: 'Arial' } }));
    recSlide.addText(recBullets, { x: 0.8, y: 1.4, w: '90%', bullet: true });
  }

  await pptx.writeFile({ fileName: `${report.title.replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_')}_Presentation.pptx` });
}

/**
 * 3. SEMINAR POWERPOINT EXPORT (.pptx)
 */
export async function exportSeminarToPptx(seminar: SeminarPresentation) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'EduPlanner';
  pptx.company = 'EduPlanner Seminar Generator';

  // Title Slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: '0F172A' }; // Dark Slate

  titleSlide.addText(seminar.topic, {
    x: 0.8, y: 1.8, w: '85%',
    fontSize: 36, bold: true, color: 'F8FAFC',
    align: 'left', fontFace: 'Arial'
  });

  titleSlide.addText(`Target Audience: ${seminar.audience} | ${seminar.slideCount} Slides`, {
    x: 0.8, y: 3.5, w: '85%',
    fontSize: 18, color: '38BDF8',
    align: 'left', fontFace: 'Arial'
  });

  titleSlide.addText(`Generated by EduPlanner Studio`, {
    x: 0.8, y: 6.2, w: '85%',
    fontSize: 12, color: '94A3B8',
    align: 'left', fontFace: 'Arial'
  });

  // Slide Deck
  for (const slideData of seminar.slides) {
    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };

    // Header bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 0.9, fill: { color: '1E293B' }
    });

    slide.addText(`Slide ${slideData.slideNumber}: ${slideData.title}`, {
      x: 0.6, y: 0.2, w: '90%', h: 0.5,
      fontSize: 22, bold: true, color: 'F8FAFC',
      fontFace: 'Arial'
    });

    // Content Bullets
    const bulletItems = slideData.bulletPoints.map(bp => ({
      text: bp,
      options: { fontSize: 16, color: '334155', breakLine: true, fontFace: 'Arial' }
    }));

    slide.addText(bulletItems, {
      x: 0.8, y: 1.3, w: 7.5, h: 4.8,
      bullet: true,
      margin: 10
    });

    // Visual Note Card on Right Side
    if (slideData.visualSuggestion) {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 8.5, y: 1.4, w: 4.2, h: 4.6,
        fill: { color: 'F1F5F9' },
        line: { color: 'CBD5E1', width: 1 }
      });

      slide.addText('💡 Slide Visual & Media Suggestion:', {
        x: 8.7, y: 1.6, w: 3.8, h: 0.4,
        fontSize: 13, bold: true, color: '0284C7', fontFace: 'Arial'
      });

      slide.addText(slideData.visualSuggestion, {
        x: 8.7, y: 2.1, w: 3.8, h: 3.7,
        fontSize: 12, color: '475569', fontFace: 'Arial', italic: true
      });
    }

    // Add Speaker Notes
    if (slideData.speakerNotes) {
      slide.addNotes(slideData.speakerNotes);
    }
  }

  // Q&A / Conclusion Slide
  if (seminar.qAndA && seminar.qAndA.length > 0) {
    const qaSlide = pptx.addSlide();
    qaSlide.background = { color: '0F172A' };

    qaSlide.addText('Anticipated Seminar Q&A Session', {
      x: 0.8, y: 0.8, w: '85%',
      fontSize: 28, bold: true, color: '38BDF8', fontFace: 'Arial'
    });

    let yPos = 1.8;
    for (const item of seminar.qAndA.slice(0, 3)) {
      qaSlide.addText(`Q: ${item.question}`, {
        x: 0.8, y: yPos, w: '85%',
        fontSize: 16, bold: true, color: 'F8FAFC', fontFace: 'Arial'
      });
      yPos += 0.5;
      qaSlide.addText(`A: ${item.answer}`, {
        x: 0.8, y: yPos, w: '85%',
        fontSize: 14, color: 'CBD5E1', fontFace: 'Arial'
      });
      yPos += 0.9;
    }
  }

  await pptx.writeFile({ fileName: `${seminar.topic.replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_')}_Seminar.pptx` });
}

export function exportSeminarToPdf(seminar: SeminarPresentation) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 50;

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(217, 119, 6); // Amber
  doc.text(seminar.topic, margin, y);
  y += 26;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Target Audience: ${seminar.audience} | ${seminar.slides.length} Slides Deck`, margin, y);
  y += 25;
  doc.setTextColor(0);

  // Slides Loop
  seminar.slides.forEach((slide) => {
    checkPageBreak(120);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(`Slide ${slide.slideNumber}: ${slide.title}`, margin, y);
    y += 18;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);

    slide.bulletPoints.forEach((bp) => {
      checkPageBreak(20);
      const lines = doc.splitTextToSize(`• ${bp}`, pageWidth - margin * 2 - 20);
      doc.text(lines, margin + 10, y);
      y += lines.length * 14 + 4;
    });

    if (slide.speakerNotes) {
      checkPageBreak(40);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(180, 83, 9); // Amber notes
      const noteLines = doc.splitTextToSize(`Speaker Notes: "${slide.speakerNotes}"`, pageWidth - margin * 2 - 20);
      doc.text(noteLines, margin + 10, y);
      y += noteLines.length * 13 + 6;
      doc.setFont('helvetica', 'normal');
    }

    if (slide.visualSuggestion) {
      checkPageBreak(30);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(2, 132, 199);
      const visLines = doc.splitTextToSize(`Visual Suggestion: ${slide.visualSuggestion}`, pageWidth - margin * 2 - 20);
      doc.text(visLines, margin + 10, y);
      y += visLines.length * 13 + 6;
      doc.setFont('helvetica', 'normal');
    }

    y += 15;
  });

  // Q&A
  if (seminar.qAndA && seminar.qAndA.length > 0) {
    checkPageBreak(60);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(217, 119, 6);
    doc.text('Anticipated Seminar Q&A Session', margin, y);
    y += 20;

    seminar.qAndA.forEach((item, idx) => {
      checkPageBreak(40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`Q${idx + 1}: ${item.question}`, margin, y);
      y += 14;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const aLines = doc.splitTextToSize(`A: ${item.answer}`, pageWidth - margin * 2 - 20);
      doc.text(aLines, margin + 10, y);
      y += aLines.length * 14 + 10;
    });
  }

  doc.save(`${seminar.topic.replace(/[^a-zA-Z0-9]/g, '_')}_Seminar.pdf`);
}

export async function exportSeminarToWord(seminar: SeminarPresentation) {
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
      children: [new TextRun({ text: seminar.topic, bold: true, size: 32, color: 'D97706' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: `Target Audience: ${seminar.audience} | Seminar Presentation Script & Speaker Deck`, italics: true, size: 20, color: '64748B' })]
    })
  ];

  seminar.slides.forEach((slide) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 100 },
        children: [new TextRun({ text: `Slide ${slide.slideNumber}: ${slide.title}`, bold: true, size: 24, color: '0F172A' })]
      })
    );

    slide.bulletPoints.forEach((bp) => {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: bp, size: 22 })]
        })
      );
    });

    if (slide.speakerNotes) {
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 100 },
          children: [new TextRun({ text: 'Speaker Practice Script / Verbal Notes: ', bold: true, size: 20, color: 'B45309' }), new TextRun({ text: `"${slide.speakerNotes}"`, italics: true, size: 20 })]
        })
      );
    }
  });

  if (seminar.qAndA && seminar.qAndA.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [new TextRun({ text: 'Anticipated Q&A Script', bold: true, size: 26, color: 'D97706' })]
      })
    );

    seminar.qAndA.forEach((qa, idx) => {
      children.push(
        new Paragraph({
          spacing: { before: 150, after: 50 },
          children: [new TextRun({ text: `Q${idx + 1}: ${qa.question}`, bold: true, size: 22 })]
        }),
        new Paragraph({
          spacing: { after: 150 },
          children: [new TextRun({ text: `Suggested Answer: ${qa.answer}`, size: 20, color: '334155' })]
        })
      );
    });
  }

  const doc = new Document({
    sections: [{ properties: {}, children }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${seminar.topic.replace(/[^a-zA-Z0-9]/g, '_')}_Seminar.docx`);
}

/**
 * 4. SPSS ANALYSIS EXPORT TO WORD / PDF
 */
export async function exportSpssToWord(output: SpssAnalysisOutput) {
  const children: (Paragraph | Table)[] = [];

  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: `SPSS Statistical Output: ${(output.type || 'descriptive').toUpperCase()} Analysis`, bold: true, size: 28, font: 'Calibri' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: `Dataset: ${output.datasetName} | Date: ${output.createdAt}`, italics: true, color: '64748B', size: 20 })]
    })
  );

  // Scholarly Writeup
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 150 },
      children: [new TextRun({ text: 'Scholarly SPSS Interpretation & Analysis', bold: true, size: 24, font: 'Calibri', color: '1E3A8A' })]
    }),
    new Paragraph({
      spacing: { after: 300, line: 280 },
      children: [new TextRun({ text: output.aiInterpretation.scholarlyWriteup, size: 22, font: 'Calibri' })]
    })
  );

  // APA 7 Statement
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 150 },
      children: [new TextRun({ text: 'APA 7 Standard Statistical Reporting Statement', bold: true, size: 22, font: 'Calibri' })]
    }),
    new Paragraph({
      spacing: { after: 300 },
      children: [new TextRun({ text: output.aiInterpretation.apaReportingText, italics: true, size: 22, font: 'Calibri', color: '0F172A' })]
    })
  );

  // Hypothesis Decisions
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 150 },
      children: [new TextRun({ text: 'Hypothesis Decision & Recommendations', bold: true, size: 22, font: 'Calibri' })]
    }),
    new Paragraph({
      spacing: { after: 300, line: 280 },
      children: [new TextRun({ text: output.aiInterpretation.hypothesisTesting, size: 22, font: 'Calibri' })]
    })
  );

  // Goal-Driven Research Analysis
  if (output.goalDrivenAnalysis && output.goalDrivenAnalysis.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 150 },
        children: [new TextRun({ text: 'Goal-Driven Research Analysis & Hypothesis Mapping', bold: true, size: 24, font: 'Calibri', color: '1E3A8A' })]
      })
    );

    for (let i = 0; i < output.goalDrivenAnalysis.length; i++) {
      const item = output.goalDrivenAnalysis[i];
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          children: [new TextRun({ text: `Objective ${i + 1}: ${item.objective}`, bold: true, size: 20, font: 'Calibri', color: '0284C7' })]
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: 'Status: ', bold: true, size: 20, font: 'Calibri' }),
            new TextRun({ text: item.status, bold: true, size: 20, font: 'Calibri', color: item.status === 'Supported' ? '166534' : '991B1B' })
          ]
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: 'Statistical Evidence: ', bold: true, size: 20, font: 'Calibri' }),
            new TextRun({ text: item.statisticalEvidence, size: 20, font: 'Calibri' })
          ]
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: 'Academic Interpretation: ', bold: true, size: 20, font: 'Calibri' }),
            new TextRun({ text: item.academicInterpretation, size: 20, font: 'Calibri' })
          ]
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: 'APA 7 Thesis Statement: ', bold: true, italics: true, size: 20, font: 'Calibri' }),
            new TextRun({ text: item.apaFormattedResult, italics: true, size: 20, font: 'Calibri', color: '1E293B' })
          ]
        })
      );
    }
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `SPSS_${output.type}_${output.datasetName.replace(/[^a-zA-Z0-9]/g, '_')}.docx`);
}

export function exportSpssToPdf(output: SpssAnalysisOutput) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 50;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(30, 58, 138);
  doc.text(`SPSS Analysis: ${(output.type || 'descriptive').toUpperCase()}`, margin, y);
  y += 25;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Dataset: ${output.datasetName} | Language: ${(output.language || 'en').toUpperCase()}`, margin, y);
  y += 25;
  doc.setTextColor(0);

  // Writeup
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Scholarly Interpretation', margin, y);
  y += 15;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const writeupLines = doc.splitTextToSize(output.aiInterpretation.scholarlyWriteup, pageWidth - margin * 2);
  for (const line of writeupLines) {
    if (y > 770) { doc.addPage(); y = 50; }
    doc.text(line, margin, y);
    y += 14;
  }
  y += 15;

  // APA Statement
  if (y > 700) { doc.addPage(); y = 50; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('APA 7 Reporting Statement', margin, y);
  y += 15;

  doc.setFont('helvetica', 'italic');
  const apaLines = doc.splitTextToSize(output.aiInterpretation.apaReportingText, pageWidth - margin * 2);
  doc.text(apaLines, margin, y);
  y += apaLines.length * 14 + 20;

  // Goal-Driven Analysis Section in PDF
  if (output.goalDrivenAnalysis && output.goalDrivenAnalysis.length > 0) {
    if (y > 700) { doc.addPage(); y = 50; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 58, 138);
    doc.text('Goal-Driven Research Analysis & Objectives', margin, y);
    y += 18;

    for (let i = 0; i < output.goalDrivenAnalysis.length; i++) {
      const item = output.goalDrivenAnalysis[i];
      if (y > 720) { doc.addPage(); y = 50; }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(2, 132, 199);
      doc.text(`Obj ${i + 1}: ${item.objective}`, margin, y);
      y += 14;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(50);
      doc.text(`Status: ${item.status} | Evidence: ${item.statisticalEvidence}`, margin, y);
      y += 13;

      const interpLines = doc.splitTextToSize(`Interpretation: ${item.academicInterpretation}`, pageWidth - margin * 2);
      for (const line of interpLines) {
        if (y > 770) { doc.addPage(); y = 50; }
        doc.text(line, margin, y);
        y += 12;
      }
      y += 8;
    }
  }

  doc.save(`SPSS_${output.type}_${output.datasetName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}

/**
 * 5. SPSS ANALYSIS EXPORT TO EXCEL (.xlsx)
 */
export function exportSpssToExcel(output: SpssAnalysisOutput, rawDataset?: SpssDataset) {
  const wb = XLSX.utils.book_new();

  // 1. Summary & Interpretation Sheet
  const summaryRows = [
    ['SPSS Statistical Analysis Output', output.type.toUpperCase()],
    ['Dataset Name', output.datasetName],
    ['Date Created', output.createdAt],
    ['Language', (output.language || 'en').toUpperCase()],
    [],
    ['SCHOLARLY WRITEUP & INTERPRETATION'],
    [output.aiInterpretation.scholarlyWriteup],
    [],
    ['APA 7 STANDARD STATISTICAL STATEMENT'],
    [output.aiInterpretation.apaReportingText],
    [],
    ['HYPOTHESIS DECISION'],
    [output.aiInterpretation.hypothesisTesting],
    [],
    ['STRATEGIC RECOMMENDATIONS'],
    [output.aiInterpretation.recommendations]
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'AI Interpretation');

  // 2. Statistical Results Table Sheet
  if (output.type === 'descriptive' && output.descriptiveData) {
    const wsDesc = XLSX.utils.json_to_sheet(output.descriptiveData);
    XLSX.utils.book_append_sheet(wb, wsDesc, 'Descriptives');
  } else if (output.type === 'frequency' && output.frequencyData) {
    const wsFreq = XLSX.utils.json_to_sheet(output.frequencyData.items);
    XLSX.utils.book_append_sheet(wb, wsFreq, 'Frequency Table');
  } else if (output.type === 'reliability' && output.reliabilityData) {
    const relSummary = [
      ["Cronbach's Alpha (α)", output.reliabilityData.cronbachAlpha],
      ['Item Count', output.reliabilityData.itemCount],
      ['Overall Mean', output.reliabilityData.overallMean],
      ['Overall Variance', output.reliabilityData.overallVariance]
    ];
    const wsRelSum = XLSX.utils.aoa_to_sheet(relSummary);
    XLSX.utils.book_append_sheet(wb, wsRelSum, 'Reliability Summary');
    const wsRelItems = XLSX.utils.json_to_sheet(output.reliabilityData.itemStats);
    XLSX.utils.book_append_sheet(wb, wsRelItems, 'Item-Total Statistics');
  } else if (output.type === 'crosstab' && output.crosstabData) {
    const ct = output.crosstabData;
    const ctRows: any[] = [];
    ctRows.push(['Cross Tabulation:', `${ct.rowVar} (Row) x ${ct.colVar} (Column)`]);
    ctRows.push(['Chi-Square Stat:', ct.chiSquare.stat, 'df:', ct.chiSquare.df, 'p-value:', ct.chiSquare.pValue, "Cramer's V:", ct.chiSquare.cramersV]);
    ctRows.push([]);
    ctRows.push([ct.rowVar, ...ct.colValues]);
    for (let r = 0; r < ct.rowValues.length; r++) {
      ctRows.push([ct.rowValues[r], ...ct.counts[r]]);
    }
    const wsCT = XLSX.utils.aoa_to_sheet(ctRows);
    XLSX.utils.book_append_sheet(wb, wsCT, 'Crosstab & Chi-Square');
  } else if (output.type === 'correlation' && output.correlationData) {
    const rows: any[] = [];
    for (const v1 of output.correlationData.variables) {
      const rowObj: Record<string, any> = { Variable: v1 };
      for (const v2 of output.correlationData.variables) {
        const cell = output.correlationData.matrix[v1][v2];
        rowObj[v2] = `r = ${cell.r} (p = ${cell.p})`;
      }
      rows.push(rowObj);
    }
    const wsCorr = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, wsCorr, 'Correlation Matrix');
  } else if (output.type === 'regression' && output.regressionData) {
    const regRows = [
      ['R', output.regressionData.r],
      ['R-Squared (R²)', output.regressionData.r2],
      ['Adjusted R²', output.regressionData.adjR2],
      ['F-Statistic', output.regressionData.fStat],
      ['Model p-value', output.regressionData.pValue]
    ];
    const wsReg = XLSX.utils.aoa_to_sheet(regRows);
    XLSX.utils.book_append_sheet(wb, wsReg, 'Regression Model Summary');
    const wsCoeff = XLSX.utils.json_to_sheet(output.regressionData.coefficients);
    XLSX.utils.book_append_sheet(wb, wsCoeff, 'Coefficients');
  } else if (output.type === 'anova' && output.anovaData) {
    const an = output.anovaData;
    const anRows = [
      ['Source', 'Sum of Squares', 'df', 'Mean Square', 'F', 'p-value'],
      ['Between Groups', an.betweenSS, an.betweenDf, an.betweenMS, an.fStat, an.pValue],
      ['Within Groups', an.withinSS, an.withinDf, an.withinMS, '-', '-'],
      ['Total', an.totalSS, an.totalDf, '-', '-', '-']
    ];
    const wsAnova = XLSX.utils.aoa_to_sheet(anRows);
    XLSX.utils.book_append_sheet(wb, wsAnova, 'ANOVA Table');
  }

  // 3. Raw Dataset Sheet if available
  if (rawDataset && rawDataset.data && rawDataset.data.length > 0) {
    const wsRaw = XLSX.utils.json_to_sheet(rawDataset.data);
    XLSX.utils.book_append_sheet(wb, wsRaw, 'Raw Dataset');
  }

  XLSX.writeFile(wb, `SPSS_${output.type}_${output.datasetName.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
}

/**
 * 6. SPSS ANALYSIS EXPORT TO POWERPOINT (.pptx)
 */
export async function exportSpssToPptx(output: SpssAnalysisOutput) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'EduPlanner';
  pptx.company = 'EduPlanner Data Intelligence';

  // Slide 1: Title Slide
  const slide1 = pptx.addSlide();
  slide1.background = { color: '0F172A' };

  slide1.addText(`SPSS Statistical Analysis Output`, {
    x: 0.8, y: 1.5, w: '85%',
    fontSize: 32, bold: true, color: 'F8FAFC', fontFace: 'Arial'
  });

  slide1.addText(`Analysis Type: ${output.type.toUpperCase()} | Dataset: ${output.datasetName}`, {
    x: 0.8, y: 2.8, w: '85%',
    fontSize: 18, color: '38BDF8', fontFace: 'Arial'
  });

  slide1.addText(`Generated by EduPlanner Studio | Date: ${output.createdAt}`, {
    x: 0.8, y: 5.5, w: '85%',
    fontSize: 12, color: '94A3B8', fontFace: 'Arial'
  });

  // Slide 2: Scholarly Discussion & Results
  const slide2 = pptx.addSlide();
  slide2.background = { color: 'FFFFFF' };

  slide2.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.9, fill: { color: '1E293B' }
  });

  slide2.addText('Executive Statistical Results & AI Interpretation', {
    x: 0.6, y: 0.2, w: '90%', h: 0.5,
    fontSize: 22, bold: true, color: 'F8FAFC', fontFace: 'Arial'
  });

  slide2.addText(output.aiInterpretation.scholarlyWriteup, {
    x: 0.8, y: 1.3, w: 11.5, h: 4.8,
    fontSize: 14, color: '334155', fontFace: 'Arial'
  });

  // Slide 3: APA 7 Statement & Hypothesis Decisions
  const slide3 = pptx.addSlide();
  slide3.background = { color: 'F8FAFC' };

  slide3.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.9, fill: { color: '0284C7' }
  });

  slide3.addText('APA 7 Reporting Statement & Hypothesis Test', {
    x: 0.6, y: 0.2, w: '90%', h: 0.5,
    fontSize: 22, bold: true, color: 'FFFFFF', fontFace: 'Arial'
  });

  slide3.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.3, w: 11.5, h: 2.0,
    fill: { color: 'EFF6FF' },
    line: { color: 'BFDBFE', width: 1 }
  });

  slide3.addText(`"${output.aiInterpretation.apaReportingText}"`, {
    x: 1.0, y: 1.5, w: 11.1, h: 1.6,
    fontSize: 16, italic: true, color: '1E3A8A', fontFace: 'Georgia'
  });

  slide3.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 3.6, w: 11.5, h: 2.5,
    fill: { color: 'F0FDF4' },
    line: { color: 'BBF7D0', width: 1 }
  });

  slide3.addText('Hypothesis Testing Decision & Recommendations:', {
    x: 1.0, y: 3.8, w: 11.1, h: 0.4,
    fontSize: 15, bold: true, color: '15803D', fontFace: 'Arial'
  });

  slide3.addText(output.aiInterpretation.hypothesisTesting, {
    x: 1.0, y: 4.3, w: 11.1, h: 1.6,
    fontSize: 13, color: '166534', fontFace: 'Arial'
  });

  await pptx.writeFile({ fileName: `SPSS_${output.type}_${output.datasetName.replace(/[^a-zA-Z0-9]/g, '_')}.pptx` });
}

export async function exportBibliographyToWord(styleName: string, citations: string[]) {
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      spacing: { after: 300 },
      children: [new TextRun({ text: 'References & Bibliography', bold: true, size: 32, font: 'Times New Roman' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: `Formatted according to ${styleName} Standard`, italics: true, size: 20, color: '64748B', font: 'Times New Roman' })]
    })
  ];

  citations.forEach((cit) => {
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        indent: { left: 720, hanging: 720 },
        children: [new TextRun({ text: cit, size: 22, font: 'Times New Roman' })]
      })
    );
  });

  const doc = new Document({
    sections: [{ properties: {}, children }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Bibliography_${styleName.replace(/[^a-zA-Z0-9]/g, '_')}.docx`);
}

export function exportBibliographyToPdf(styleName: string, citations: string[]) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const margin = 50;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 60;

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.text('References & Bibliography', margin, y);
  y += 24;

  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Citation Standard: ${styleName}`, margin, y);
  y += 30;
  doc.setTextColor(0);

  doc.setFont('times', 'normal');
  doc.setFontSize(10);

  citations.forEach((cit, idx) => {
    checkPageBreak(40);
    const lines = doc.splitTextToSize(`${idx + 1}. ${cit}`, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 15 + 10;
  });

  doc.save(`Bibliography_${styleName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}

export function exportReferencesToBibtex(citations: string[], fileName = 'references.bib') {
  let bibContent = '% Generated by EduPlanner AI Research Platform\n\n';
  citations.forEach((cit, idx) => {
    const key = `ref_${idx + 1}_${Date.now()}`;
    bibContent += `@article{${key},\n  author = {${cit.split('(')[0]?.trim() || 'Academic Author'}},\n  title = {${cit}},\n  year = {2024}\n}\n\n`;
  });
  const blob = new Blob([bibContent], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, fileName);
}

export function exportReferencesToRis(citations: string[], fileName = 'references.ris') {
  let risContent = '';
  citations.forEach((cit) => {
    risContent += `TY  - JOUR\nTI  - ${cit}\nAU  - ${cit.split('(')[0]?.trim() || 'Author'}\nPY  - 2024\nER  - \n\n`;
  });
  const blob = new Blob([risContent], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, fileName);
}

export function exportReferencesToEndnote(citations: string[], fileName = 'references.enw') {
  let enwContent = '';
  citations.forEach((cit) => {
    enwContent += `%0 Journal Article\n%T ${cit}\n%A ${cit.split('(')[0]?.trim() || 'Author'}\n%D 2024\n\n`;
  });
  const blob = new Blob([enwContent], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, fileName);
}

export function exportCitationOutputToRis(citation: import('../types').CitationOutput) {
  const risText = citation.exports?.ris || `TY  - JOUR\nTI  - ${citation.title}\nAU  - ${citation.authors}\nPY  - ${citation.year}\nER  - \n`;
  const blob = new Blob([risText], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `Citation_${citation.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 25)}.ris`);
}

export function exportCitationOutputToBibtex(citation: import('../types').CitationOutput) {
  const bibText = citation.exports?.bibtex || citation.citations?.bibtex || `@article{ref_${Date.now()},\n  author = {${citation.authors}},\n  title = {${citation.title}},\n  year = {${citation.year}}\n}`;
  const blob = new Blob([bibText], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `Citation_${citation.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 25)}.bib`);
}

export function exportCitationOutputToEndnote(citation: import('../types').CitationOutput) {
  const enwText = citation.exports?.endnote || `%0 Journal Article\n%T ${citation.title}\n%A ${citation.authors}\n%D ${citation.year}\n`;
  const blob = new Blob([enwText], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `Citation_${citation.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 25)}.enw`);
}

export function exportLibraryToBibtex(items: import('../types').ReferenceItem[], fileName = 'EduPlanner_Reference_Library.bib') {
  let text = `% EduPlanner AI Academic Reference Library Export\n% Generated on ${new Date().toLocaleDateString()}\n\n`;
  items.forEach(item => {
    text += (item.exports?.bibtex || item.citations?.bibtex) + '\n\n';
  });
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, fileName);
}

export function exportLibraryToRis(items: import('../types').ReferenceItem[], fileName = 'EduPlanner_Reference_Library.ris') {
  let text = '';
  items.forEach(item => {
    text += (item.exports?.ris || `TY  - JOUR\nTI  - ${item.title}\nAU  - ${item.authors}\nPY  - ${item.year}\nER  - \n`) + '\n';
  });
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, fileName);
}

export function exportLibraryToEndnoteXml(items: import('../types').ReferenceItem[], fileName = 'EduPlanner_Reference_Library.xml') {
  let xml = `<?xml version="1.0" encoding="UTF-8"?><xml><records>\n`;
  items.forEach(item => {
    xml += `  <record>\n`;
    xml += `    <database name="EduPlanner Library">EduPlanner.enl</database>\n`;
    xml += `    <source-app name="EduPlanner AI" version="1.0">EduPlanner</source-app>\n`;
    xml += `    <ref-type name="Journal Article">17</ref-type>\n`;
    xml += `    <titles><title><style face="normal" font="default" size="100%">${item.title}</style></title></titles>\n`;
    xml += `    <authors><author><style face="normal" font="default" size="100%">${item.authors}</style></author></authors>\n`;
    xml += `    <dates><year><style face="normal" font="default" size="100%">${item.year}</style></year></dates>\n`;
    if (item.journalOrPublisher) xml += `    <periodical><full-title><style face="normal" font="default" size="100%">${item.journalOrPublisher}</style></full-title></periodical>\n`;
    if (item.volume) xml += `    <volume><style face="normal" font="default" size="100%">${item.volume}</style></volume>\n`;
    if (item.issue) xml += `    <number><style face="normal" font="default" size="100%">${item.issue}</style></number>\n`;
    if (item.pages) xml += `    <pages><style face="normal" font="default" size="100%">${item.pages}</style></pages>\n`;
    if (item.doi) xml += `    <electronic-resource-num><style face="normal" font="default" size="100%">${item.doi}</style></electronic-resource-num>\n`;
    xml += `  </record>\n`;
  });
  xml += `</records></xml>`;
  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
  saveAs(blob, fileName);
}

export async function exportLibraryToWord(items: import('../types').ReferenceItem[], styleName = 'APA 7th Edition', fileName = 'EduPlanner_Bibliography.docx') {
  const citations = items.map(item => item.citations[styleName === 'MLA 9th Edition' ? 'mla9' : styleName === 'IEEE Standard' ? 'ieee' : styleName === 'Chicago 17th Edition' ? 'chicago17' : 'apa7'] || item.citations.apa7).sort();
  await exportBibliographyToWord(styleName, citations);
}

export function exportLibraryToPdf(items: import('../types').ReferenceItem[], styleName = 'APA 7th Edition', fileName = 'EduPlanner_Bibliography.pdf') {
  const citations = items.map(item => item.citations[styleName === 'MLA 9th Edition' ? 'mla9' : styleName === 'IEEE Standard' ? 'ieee' : styleName === 'Chicago 17th Edition' ? 'chicago17' : 'apa7'] || item.citations.apa7).sort();
  exportBibliographyToPdf(styleName, citations);
}

export function exportLibraryToCsv(items: import('../types').ReferenceItem[], fileName = 'EduPlanner_Reference_Library.csv') {
  const headers = ['ID', 'Title', 'Authors', 'Year', 'Journal/Publisher', 'Volume', 'Issue', 'Pages', 'DOI', 'ISBN', 'URL', 'Source Type', 'Imported From', 'APA7 Citation'];
  const rows = items.map(item => [
    `"${(item.id || '').replace(/"/g, '""')}"`,
    `"${(item.title || '').replace(/"/g, '""')}"`,
    `"${(item.authors || '').replace(/"/g, '""')}"`,
    `"${(item.year || '').replace(/"/g, '""')}"`,
    `"${(item.journalOrPublisher || '').replace(/"/g, '""')}"`,
    `"${(item.volume || '').replace(/"/g, '""')}"`,
    `"${(item.issue || '').replace(/"/g, '""')}"`,
    `"${(item.pages || '').replace(/"/g, '""')}"`,
    `"${(item.doi || '').replace(/"/g, '""')}"`,
    `"${(item.isbn || '').replace(/"/g, '""')}"`,
    `"${(item.publisherUrl || '').replace(/"/g, '""')}"`,
    `"${(item.sourceType || '').replace(/"/g, '""')}"`,
    `"${(item.importedFrom || '').replace(/"/g, '""')}"`,
    `"${(item.citations?.apa7 || '').replace(/"/g, '""')}"`
  ]);
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, fileName);
}

export async function exportPlagiarismReportToWord(result: import('../types').PlagiarismCheckResult) {
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
      children: [new TextRun({ text: 'Academic Integrity & Plagiarism Audit Report', bold: true, size: 32, font: 'Times New Roman' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: `Document: ${result.documentTitle} | Scanned Words: ${result.totalWordsScanned}`, italics: true, size: 20, color: '64748B', font: 'Times New Roman' })]
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 100 },
      children: [new TextRun({ text: '1. Executive Summary & Audit Metrics', bold: true, size: 26, font: 'Times New Roman' })]
    }),
    new Paragraph({
      spacing: { after: 150 },
      children: [
        new TextRun({ text: `Overall Similarity Score: ${result.overallSimilarityScore}% (${result.similarityLevel} Risk)\n`, bold: true, size: 24, font: 'Times New Roman' }),
        new TextRun({ text: `AI-Generated Writing Probability: ${result.aiGeneratedProbability}% (Separate Statistical Signal)\n`, bold: true, size: 24, font: 'Times New Roman' }),
        new TextRun({ text: 'Disclaimer: AI detection probability is a statistical text pattern indicator and is not 100% accurate. It is evaluated independently from copyright similarity.', italics: true, size: 20, color: '64748B', font: 'Times New Roman' })
      ]
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 250, after: 100 },
      children: [new TextRun({ text: '2. Matched Academic Sources', bold: true, size: 26, font: 'Times New Roman' })]
    })
  ];

  result.matchedSources.forEach((s, i) => {
    children.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({ text: `${i + 1}. ${s.sourceTitle} `, bold: true, size: 22, font: 'Times New Roman' }),
          new TextRun({ text: `(${s.matchPercentage}% match) - `, color: 'B45309', bold: true, size: 22, font: 'Times New Roman' }),
          new TextRun({ text: s.sourceUrl, size: 20, font: 'Times New Roman', italics: true })
        ]
      })
    );
  });

  if (result.recommendations && result.recommendations.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 250, after: 100 },
        children: [new TextRun({ text: '3. Recommendations to Improve Originality', bold: true, size: 26, font: 'Times New Roman' })]
      })
    );
    result.recommendations.forEach((r) => {
      children.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [new TextRun({ text: `• ${r}`, size: 22, font: 'Times New Roman' })]
        })
      );
    });
  }

  const doc = new Document({
    sections: [{ properties: {}, children }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Plagiarism_Report_${result.documentTitle.replace(/[^a-zA-Z0-9]/g, '_')}.docx`);
}

export function exportPlagiarismReportToPdf(result: import('../types').PlagiarismCheckResult) {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const margin = 50;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 60;

  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.text('Academic Plagiarism & Integrity Audit Report', margin, y);
  y += 24;

  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Document: ${result.documentTitle} | Scanned: ${result.totalWordsScanned} words`, margin, y);
  y += 30;
  doc.setTextColor(0);

  doc.setFontSize(12);
  doc.setFont('times', 'bold');
  doc.text(`Overall Similarity Score: ${result.overallSimilarityScore}% (${result.similarityLevel} Risk)`, margin, y);
  y += 20;

  doc.text(`AI-Generated Writing Probability: ${result.aiGeneratedProbability}%`, margin, y);
  y += 20;

  doc.setFontSize(9);
  doc.setFont('times', 'italic');
  doc.setTextColor(120);
  const disclaimer = doc.splitTextToSize('Note: AI-generated text detection is a statistical signal and is not 100% accurate. It is presented separately from plagiarism similarity checks.', pageWidth - margin * 2);
  doc.text(disclaimer, margin, y);
  y += disclaimer.length * 12 + 20;
  doc.setTextColor(0);

  doc.setFontSize(14);
  doc.setFont('times', 'bold');
  doc.text('Matched Sources:', margin, y);
  y += 20;

  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  result.matchedSources.forEach((s, i) => {
    const text = `${i + 1}. ${s.sourceTitle} (${s.matchPercentage}% match) - ${s.sourceUrl}`;
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 14 + 8;
  });

  doc.save(`Plagiarism_Report_${result.documentTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}

export async function exportWritingToWord(title: string, content: string, modeName: string, fileName = 'Academic_Writing_Draft.docx') {
  const paragraphs = content.split('\n\n').map(p => new Paragraph({
    spacing: { after: 200, line: 360 },
    children: [new TextRun({ text: p.trim(), size: 24, font: 'Times New Roman' })]
  }));

  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
      children: [new TextRun({ text: title || 'Academic Writing Manuscript', bold: true, size: 32, font: 'Times New Roman' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: `Writing Mode: ${modeName} | Refined with AI Academic Writing Assistant`, italics: true, size: 20, color: '64748B', font: 'Times New Roman' })]
    }),
    ...paragraphs
  ];

  const doc = new Document({
    sections: [{ properties: {}, children }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
}

export function exportWritingToPdf(title: string, content: string, modeName: string, fileName = 'Academic_Writing_Draft.pdf') {
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const margin = 50;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 60;

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.text(title || 'Academic Writing Manuscript', margin, y);
  y += 24;

  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Writing Mode: ${modeName} | Refined with AI Academic Writing Assistant`, margin, y);
  y += 30;
  doc.setTextColor(0);

  doc.setFont('times', 'normal');
  doc.setFontSize(11);

  const paragraphs = content.split('\n\n');
  paragraphs.forEach(p => {
    checkPageBreak(30);
    const lines = doc.splitTextToSize(p.trim(), pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 15 + 12;
  });

  doc.save(fileName);
}

/**
 * RESEARCH REPORT GENERATOR EXPORTS (DOCX & PDF)
 */
export async function exportResearchReportToWord(reportData: any, fileName = 'Research_Report_Manuscript.docx') {
  const p = reportData.project || {};
  const intro = reportData.introduction || {};
  const lit = reportData.literatureReview || {};
  const meth = reportData.methodology || {};
  const res = reportData.results || {};
  const disc = reportData.discussion || {};
  const conc = reportData.conclusion || {};
  const refs = reportData.references || [];

  const children: Paragraph[] = [
    // Title Page
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 800, after: 200 },
      children: [new TextRun({ text: (p.title || 'ACADEMIC RESEARCH REPORT').toUpperCase(), bold: true, size: 32, font: 'Times New Roman' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [new TextRun({ text: `By: ${p.researcherName || 'Academic Researcher'}`, bold: true, size: 24, font: 'Times New Roman' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 150 },
      children: [new TextRun({ text: `${p.department || 'Department of Research'}, ${p.college || 'College of Graduate Studies'}`, size: 22, font: 'Times New Roman' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 150 },
      children: [new TextRun({ text: `${p.university || 'University'}, ${p.academicYear || '2024-2025'}`, size: 22, font: 'Times New Roman' })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
      children: [new TextRun({ text: `Supervisor: ${p.supervisor || 'Dr. Academic Supervisor'}`, italics: true, size: 20, font: 'Times New Roman' })]
    }),

    // Chapter 1: Introduction
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [new TextRun({ text: 'CHAPTER 1: INTRODUCTION', bold: true, size: 28, font: 'Times New Roman' })]
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
      children: [new TextRun({ text: '1.1 Overview', bold: true, size: 24, font: 'Times New Roman' })]
    }),
    new Paragraph({
      spacing: { after: 200, line: 360 },
      children: [new TextRun({ text: intro.overview || intro.background || 'This study investigates the key empirical dimensions of the research topic...', size: 24, font: 'Times New Roman' })]
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
      children: [new TextRun({ text: '1.2 Background of the Study', bold: true, size: 24, font: 'Times New Roman' })]
    }),
    new Paragraph({
      spacing: { after: 200, line: 360 },
      children: [new TextRun({ text: intro.background || 'In contemporary higher education...', size: 24, font: 'Times New Roman' })]
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
      children: [new TextRun({ text: '1.3 Statement of the Problem', bold: true, size: 24, font: 'Times New Roman' })]
    }),
    new Paragraph({
      spacing: { after: 200, line: 360 },
      children: [new TextRun({ text: intro.problemStatement || intro.problem || 'Despite ongoing developments, a significant research gap remains...', size: 24, font: 'Times New Roman' })]
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
      children: [new TextRun({ text: '1.4 Purpose of the Study', bold: true, size: 24, font: 'Times New Roman' })]
    }),
    new Paragraph({
      spacing: { after: 200, line: 360 },
      children: [new TextRun({ text: intro.purpose || 'The primary purpose of this empirical study is...', size: 24, font: 'Times New Roman' })]
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
      children: [new TextRun({ text: '1.5 Research Questions', bold: true, size: 24, font: 'Times New Roman' })]
    }),
    new Paragraph({
      spacing: { after: 200, line: 360 },
      children: [new TextRun({ text: intro.questions || 'This study addresses the target research questions...', size: 24, font: 'Times New Roman' })]
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
      children: [new TextRun({ text: '1.6 Significance of the Study', bold: true, size: 24, font: 'Times New Roman' })]
    }),
    new Paragraph({
      spacing: { after: 200, line: 360 },
      children: [new TextRun({ text: intro.significance || 'This study provides significant empirical and theoretical contributions...', size: 24, font: 'Times New Roman' })]
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
      children: [new TextRun({ text: '1.7 Scope and Delimitations', bold: true, size: 24, font: 'Times New Roman' })]
    }),
    new Paragraph({
      spacing: { after: 200, line: 360 },
      children: [new TextRun({ text: intro.scope || 'The scope of this investigation is delimited to...', size: 24, font: 'Times New Roman' })]
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
      children: [new TextRun({ text: '1.8 Definition of Key Terms', bold: true, size: 24, font: 'Times New Roman' })]
    }),
    new Paragraph({
      spacing: { after: 250, line: 360 },
      children: [new TextRun({ text: intro.keyTerms || 'Operational definitions for key study constructs...', size: 24, font: 'Times New Roman' })]
    }),

    // Chapter 2: Literature Review
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [new TextRun({ text: 'CHAPTER 2: LITERATURE REVIEW & CONCEPTUAL FRAMEWORK', bold: true, size: 28, font: 'Times New Roman' })]
    }),
    ...(Array.isArray(reportData.literatureReview?.sections) && reportData.literatureReview.sections.length > 0
      ? reportData.literatureReview.sections.flatMap((sec: any) => [
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [new TextRun({ text: `${sec.number} ${sec.title}`, bold: true, size: 24, font: 'Times New Roman' })]
          }),
          new Paragraph({
            spacing: { after: 250, line: 360 },
            children: [new TextRun({ text: sec.content || '', size: 24, font: 'Times New Roman' })]
          })
        ])
      : [
          new Paragraph({
            spacing: { after: 250, line: 360 },
            children: [new TextRun({ text: lit.conceptualFramework || 'This literature review synthesizes conceptual foundations, empirical studies, and theoretical paradigms...', size: 24, font: 'Times New Roman' })]
          })
        ]
    ),

    // Chapter 3: Methodology
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [new TextRun({ text: 'CHAPTER 3: METHODOLOGY', bold: true, size: 28, font: 'Times New Roman' })]
    }),
    ...[
      { title: '3.1 Introduction', text: meth.overview },
      { title: '3.2 Research Design', text: meth.design },
      { title: '3.3 Population of the Study', text: meth.population },
      { title: '3.4 Sample and Sampling Techniques', text: meth.sampleSize },
      { title: '3.5 Research Instruments', text: meth.instruments },
      { title: '3.6 Validity of the Instrument', text: meth.validity },
      { title: '3.7 Reliability of the Instrument', text: meth.reliability },
      { title: '3.8 Data Collection Procedures', text: meth.procedures },
      { title: '3.9 Data Analysis Methods', text: meth.analysis },
      { title: '3.10 Ethical Considerations', text: meth.ethics }
    ].flatMap(sec => 
      sec.text ? [
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          children: [new TextRun({ text: sec.title, bold: true, size: 24, font: 'Times New Roman' })]
        }),
        new Paragraph({
          spacing: { after: 250, line: 360 },
          children: [new TextRun({ text: sec.text, size: 24, font: 'Times New Roman' })]
        })
      ] : []
    ),

    // Chapter 4: Results
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [new TextRun({ text: 'CHAPTER 4: RESULTS & STATISTICAL ANALYSIS', bold: true, size: 28, font: 'Times New Roman' })]
    }),
    new Paragraph({
      spacing: { after: 250, line: 360 },
      children: [new TextRun({ text: res.demographicsText || 'This chapter presents empirical statistical results computed from the dataset.', size: 24, font: 'Times New Roman' })]
    }),

    // Chapter 5: Discussion
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [new TextRun({ text: 'CHAPTER 5: DISCUSSION', bold: true, size: 28, font: 'Times New Roman' })]
    }),
    new Paragraph({
      spacing: { after: 250, line: 360 },
      children: [new TextRun({ text: disc.overviewText || 'The findings provide robust empirical support for theoretical expectations.', size: 24, font: 'Times New Roman' })]
    }),

    // Chapter 6: Conclusion
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [new TextRun({ text: 'CHAPTER 6: CONCLUSION & RECOMMENDATIONS', bold: true, size: 28, font: 'Times New Roman' })]
    }),
    new Paragraph({
      spacing: { after: 250, line: 360 },
      children: [new TextRun({ text: `${conc.conclusions || 'This study concluded that empirical indicators support the proposed research hypotheses.'}\n\nRecommendations:\n${conc.recommendations || '1. Strengthen institutional training and policy.'}`, size: 24, font: 'Times New Roman' })]
    }),

    // References
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [new TextRun({ text: 'REFERENCES', bold: true, size: 28, font: 'Times New Roman' })]
    }),
    ...refs.map((ref: any) => 
      new Paragraph({
        spacing: { after: 150, line: 360 },
        children: [new TextRun({ text: typeof ref === 'string' ? ref : `${ref.authors || 'Author'} (${ref.year || 2024}). ${ref.title || 'Title'}. ${ref.source || 'Journal'}.`, size: 24, font: 'Times New Roman' })]
      })
    )
  ];

  const doc = new Document({
    sections: [{ properties: {}, children }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
}

export function exportResearchReportToPdf(reportData: any, fileName = 'Research_Report_Manuscript.pdf') {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 50;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      y = 40;
    }
  };

  const p = reportData.project || {};
  const intro = reportData.introduction || {};
  const lit = reportData.literatureReview || {};
  const meth = reportData.methodology || {};

  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  const titleLines = doc.splitTextToSize((p.title || 'ACADEMIC RESEARCH REPORT').toUpperCase(), pageWidth - margin * 2);
  doc.text(titleLines, pageWidth / 2, y, { align: 'center' });
  y += titleLines.length * 20 + 20;

  doc.setFont('times', 'normal');
  doc.setFontSize(12);
  doc.text(`Researcher: ${p.researcherName || 'Academic Researcher'}`, margin, y);
  y += 20;
  doc.text(`Institution: ${p.university || 'University'} | ${p.department || 'Department'}`, margin, y);
  y += 30;

  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text('CHAPTER 1: INTRODUCTION', margin, y);
  y += 20;

  const introSectionsToExport = [
    { title: '1.1 Overview', text: intro.overview },
    { title: '1.2 Background of the Study', text: intro.background },
    { title: '1.3 Statement of the Problem', text: intro.problemStatement || intro.problem },
    { title: '1.4 Purpose of the Study', text: intro.purpose },
    { title: '1.5 Research Questions', text: intro.questions },
    { title: '1.6 Significance of the Study', text: intro.significance },
    { title: '1.7 Scope and Delimitations', text: intro.scope },
    { title: '1.8 Definition of Key Terms', text: intro.keyTerms }
  ];

  doc.setFontSize(11);
  introSectionsToExport.forEach(sec => {
    if (sec.text && sec.text.trim().length > 0) {
      checkPageBreak(45);
      doc.setFont('times', 'bold');
      doc.text(sec.title, margin, y);
      y += 16;
      doc.setFont('times', 'normal');
      const lines = doc.splitTextToSize(sec.text, pageWidth - margin * 2);
      doc.text(lines, margin, y);
      y += lines.length * 14 + 18;
    }
  });

  // Chapter 2 Literature Review in PDF
  checkPageBreak(50);
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text('CHAPTER 2: LITERATURE REVIEW', margin, y);
  y += 20;

  doc.setFontSize(11);
  if (Array.isArray(lit.sections) && lit.sections.length > 0) {
    lit.sections.forEach((sec: any) => {
      if (sec.content && sec.content.trim().length > 0) {
        checkPageBreak(45);
        doc.setFont('times', 'bold');
        doc.text(`${sec.number} ${sec.title}`, margin, y);
        y += 16;
        doc.setFont('times', 'normal');
        const lines = doc.splitTextToSize(sec.content, pageWidth - margin * 2);
        doc.text(lines, margin, y);
        y += lines.length * 14 + 18;
      }
    });
  } else if (lit.conceptualFramework) {
    checkPageBreak(45);
    doc.setFont('times', 'normal');
    const lines = doc.splitTextToSize(lit.conceptualFramework, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 14 + 18;
  }

  // Chapter 3 Methodology in PDF
  checkPageBreak(50);
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text('CHAPTER 3: METHODOLOGY', margin, y);
  y += 20;

  const methSectionsToExport = [
    { title: '3.1 Introduction', text: meth.overview },
    { title: '3.2 Research Design', text: meth.design },
    { title: '3.3 Population of the Study', text: meth.population },
    { title: '3.4 Sample and Sampling Techniques', text: meth.sampleSize },
    { title: '3.5 Research Instruments', text: meth.instruments },
    { title: '3.6 Validity of the Instrument', text: meth.validity },
    { title: '3.7 Reliability of the Instrument', text: meth.reliability },
    { title: '3.8 Data Collection Procedures', text: meth.procedures },
    { title: '3.9 Data Analysis Methods', text: meth.analysis },
    { title: '3.10 Ethical Considerations', text: meth.ethics }
  ];

  doc.setFontSize(11);
  methSectionsToExport.forEach(sec => {
    if (sec.text && sec.text.trim().length > 0) {
      checkPageBreak(45);
      doc.setFont('times', 'bold');
      doc.text(sec.title, margin, y);
      y += 16;
      doc.setFont('times', 'normal');
      const lines = doc.splitTextToSize(sec.text, pageWidth - margin * 2);
      doc.text(lines, margin, y);
      y += lines.length * 14 + 18;
    }
  });

  checkPageBreak(50);
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text('REFERENCES', margin, y);
  y += 20;

  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  (reportData.references || []).forEach((ref: any) => {
    checkPageBreak(25);
    const refStr = typeof ref === 'string' ? ref : `${ref.authors || 'Author'} (${ref.year || 2024}). ${ref.title || 'Title'}. ${ref.source || 'Journal'}.`;
    const refLines = doc.splitTextToSize(refStr, pageWidth - margin * 2);
    doc.text(refLines, margin, y);
    y += refLines.length * 14 + 6;
  });

  doc.save(fileName);
}





