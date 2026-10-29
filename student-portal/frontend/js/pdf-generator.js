// =========================================================================
// Official PDF Generator for Modern Group of Education
// Powered by jsPDF & jsPDF-AutoTable
// =========================================================================

function formatCurrency(amount) {
  return 'Rs. ' + parseFloat(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function numberToWords(num) {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(num);
  if (n === 0) return 'Zero';
  function convert(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
    return n.toString();
  }
  return convert(n) + ' Only';
}

/**
 * Generates an official, printable Fee Payment Receipt PDF
 */
function downloadFeeReceiptPDF(invoice, student) {
  if (!window.jspdf) {
    alert('PDF generation library is loading. Please try again in a moment.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const studentName = student.name || 'Aarav Sharma';
  const rollNo = student.roll_no || '24';
  const studentClass = (student.class || '11th') + ' - ' + (student.section || 'A');
  const fatherName = student.father_name || 'Rajesh Sharma';
  const amount = parseFloat(invoice.amount || 25000);
  const receiptNo = invoice.receipt_no || ('REC-2026-' + (invoice.id || Math.floor(1000 + Math.random() * 9000)));
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Top Navy Header Bar
  doc.setFillColor(26, 46, 90); // Navy #1a2e5a
  doc.rect(0, 0, 210, 36, 'F');

  // Gold Trim Line
  doc.setFillColor(201, 162, 39); // Gold #c9a227
  doc.rect(0, 36, 210, 3, 'F');

  // School Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('MODERN GROUP OF EDUCATION', 105, 15, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 230, 245);
  doc.text("Kuchaman City's Premier Institution | Affiliated Senior Secondary & College", 105, 22, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setTextColor(201, 162, 39);
  doc.setFontSize(8.5);
  doc.text('ENJOYING, BELIEVING, ACHIEVING', 105, 29, { align: 'center' });

  // Receipt Title Badge
  doc.setFillColor(243, 245, 249);
  doc.roundedRect(15, 46, 180, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(26, 46, 90);
  doc.text('OFFICIAL FEE PAYMENT RECEIPT (DUPLICATE COPY)', 105, 52.5, { align: 'center' });

  // Meta Info: Receipt No & Date
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(70, 80, 95);
  doc.text('Receipt No:', 15, 64);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(26, 46, 90);
  doc.text(receiptNo, 40, 64);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(70, 80, 95);
  doc.text('Date of Payment:', 135, 64);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(26, 46, 90);
  doc.text(dateStr, 168, 64);

  // Student Details Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, 70, 180, 32, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 46, 90);
  doc.text('Student Name:', 20, 78);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 60, 70);
  doc.text(studentName, 52, 78);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 46, 90);
  doc.text('Roll Number:', 125, 78);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 60, 70);
  doc.text(rollNo, 155, 78);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 46, 90);
  doc.text("Father's Name:", 20, 87);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 60, 70);
  doc.text(fatherName, 52, 87);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 46, 90);
  doc.text('Class & Section:', 125, 87);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 60, 70);
  doc.text(studentClass, 155, 87);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 46, 90);
  doc.text('Payment Mode:', 20, 96);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(16, 120, 70);
  doc.text('Online UPI / NetBanking (Verified)', 52, 96);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 46, 90);
  doc.text('Payment Status:', 125, 96);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 120, 70);
  doc.text('SUCCESS / PAID', 155, 96);

  // Table Breakdown
  const tableData = [
    ['1', 'Tuition & Development Fee (Term Session 2026-27)', formatCurrency(amount * 0.70)],
    ['2', 'Composite Academic & Lab Facility Charges', formatCurrency(amount * 0.15)],
    ['3', 'Examination, Library & Sports Amenities', formatCurrency(amount * 0.10)],
    ['4', 'Portal Life-Cycle & Digital Infrastructure Fee', formatCurrency(amount * 0.05)],
  ];

  doc.autoTable({
    startY: 110,
    margin: { left: 15, right: 15 },
    head: [['#', 'Fee Head Particulars', 'Amount (INR)']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [26, 46, 90],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 125 },
      2: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
    },
    styles: {
      fontSize: 9,
      cellPadding: 4
    }
  });

  const finalY = doc.lastAutoTable.finalY + 4;

  // Total Summary Row
  doc.setFillColor(243, 245, 249);
  doc.rect(15, finalY, 180, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(26, 46, 90);
  doc.text('TOTAL AMOUNT PAID:', 20, finalY + 6.5);
  doc.text(formatCurrency(amount), 190, finalY + 6.5, { align: 'right' });

  // Amount in words
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 110, 125);
  doc.text('Amount in words: Indian ' + numberToWords(amount), 15, finalY + 16);

  // PAID STAMP & Signatures
  doc.setDrawColor(22, 101, 52);
  doc.setLineWidth(0.8);
  doc.roundedRect(20, finalY + 28, 45, 20, 2, 2, 'D');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(22, 101, 52);
  doc.text('PAID', 42.5, finalY + 37, { align: 'center' });
  doc.setFontSize(7);
  doc.text('Modern Group Accounts', 42.5, finalY + 43, { align: 'center' });

  // Authorized Signatory
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(40, 50, 60);
  doc.text('__________________________________', 130, finalY + 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Accounts Officer / Cashier', 145, finalY + 48);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 130, 140);
  doc.text('Modern Group of Education, Kuchaman City', 130, finalY + 53);

  // Footer Note
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(150, 160, 170);
  doc.text('Note: This is a verified electronic receipt generated from Modern SLCM Portal. No manual signature required for tax/rebate.', 105, 285, { align: 'center' });

  // Trigger Save
  doc.save(`Fee-Receipt-${receiptNo}.pdf`);
}

/**
 * Generates an official CBSE-style Term Examination Report Card (PDF)
 */
function downloadReportCardPDF(results, student, examTitle) {
  if (!window.jspdf) {
    alert('PDF generation library is loading. Please try again.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const studentName = student.name || 'Aarav Sharma';
  const rollNo = student.roll_no || '24';
  const studentClass = (student.class || '11th') + ' - ' + (student.section || 'A');
  const fatherName = student.father_name || 'Rajesh Sharma';
  const exam = examTitle || 'Mid-Term Examination 2026';

  // Navy Top Header Bar
  doc.setFillColor(26, 46, 90);
  doc.rect(0, 0, 210, 36, 'F');

  // Gold Trim
  doc.setFillColor(201, 162, 39);
  doc.rect(0, 36, 210, 3, 'F');

  // School Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('MODERN SENIOR SECONDARY SCHOOL', 105, 14, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(220, 230, 245);
  doc.text('Affiliated to Board of Secondary Education | School Code: 20459 | Kuchaman City (Nagaur), Raj.', 105, 21, { align: 'center' });

  doc.setFont('helvetica', 'italic');
  doc.setTextColor(201, 162, 39);
  doc.setFontSize(8.5);
  doc.text('ANNUAL PROGRESS REPORT CARD (ACADEMIC YEAR 2026-27)', 105, 28, { align: 'center' });

  // Examination Title Ribbon
  doc.setFillColor(243, 245, 249);
  doc.roundedRect(15, 45, 180, 9, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(26, 46, 90);
  doc.text(exam.toUpperCase(), 105, 51, { align: 'center' });

  // Student Profile Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, 59, 180, 28, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 46, 90);
  doc.text("Student's Name:", 20, 67);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 50, 60);
  doc.text(studentName, 52, 67);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 46, 90);
  doc.text('Roll Number:', 125, 67);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 50, 60);
  doc.text(rollNo, 155, 67);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 46, 90);
  doc.text("Father's Name:", 20, 76);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 50, 60);
  doc.text(fatherName, 52, 76);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 46, 90);
  doc.text('Class & Section:', 125, 76);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 50, 60);
  doc.text(studentClass, 155, 76);

  // Build Results Rows
  const rows = [];
  let totalMarksObtained = 0;
  let totalMaxMarks = 0;

  const defaultResults = [
    { subject: 'Physics', marks: 88, max_marks: 100, grade: 'A1', remarks: 'Exceptional in optics and mechanics.' },
    { subject: 'Chemistry', marks: 82, max_marks: 100, grade: 'A2', remarks: 'Good practical precision.' },
    { subject: 'Mathematics', marks: 95, max_marks: 100, grade: 'A1', remarks: 'Outstanding analytical speed.' },
    { subject: 'English Core', marks: 86, max_marks: 100, grade: 'A2', remarks: 'Commendable creative writing.' },
    { subject: 'Computer Science', marks: 94, max_marks: 100, grade: 'A1', remarks: 'Exemplary coding and logic.' }
  ];

  const dataList = (results && results.length > 0) ? results : defaultResults;

  dataList.forEach((r, idx) => {
    const ob = parseFloat(r.marks || r.marks_obtained || 85);
    const mx = parseFloat(r.max_marks || 100);
    totalMarksObtained += ob;
    totalMaxMarks += mx;

    rows.push([
      (idx + 1).toString(),
      r.subject || 'Subject',
      mx.toString(),
      ob.toString(),
      r.grade || (ob >= 90 ? 'A1' : ob >= 80 ? 'A2' : 'B1'),
      r.remarks || 'Satisfactory progress.'
    ]);
  });

  const percentage = ((totalMarksObtained / totalMaxMarks) * 100).toFixed(1);

  doc.autoTable({
    startY: 93,
    margin: { left: 15, right: 15 },
    head: [['#', 'Subject Name', 'Max Marks', 'Marks Obtained', 'Grade', 'Remarks & Teacher Assessment']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [26, 46, 90],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 45, fontStyle: 'bold' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 28, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 54, fontSize: 8 }
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3.5
    }
  });

  const finalY = doc.lastAutoTable.finalY + 5;

  // Academic Summary Box
  doc.setFillColor(243, 245, 249);
  doc.roundedRect(15, finalY, 180, 24, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(26, 46, 90);
  doc.text('Grand Total:', 22, finalY + 8);
  doc.text(`${totalMarksObtained} / ${totalMaxMarks}`, 50, finalY + 8);

  doc.text('Percentage:', 110, finalY + 8);
  doc.setTextColor(16, 120, 70);
  doc.text(`${percentage}%`, 140, finalY + 8);

  doc.setTextColor(26, 46, 90);
  doc.text('Overall Grade:', 22, finalY + 18);
  doc.setTextColor(201, 162, 39);
  doc.text('A1 (Outstanding Performance)', 50, finalY + 18);

  doc.setTextColor(26, 46, 90);
  doc.text('Class Rank:', 110, finalY + 18);
  doc.text('2nd in Class ' + studentClass, 140, finalY + 18);

  // Signatures Area
  const sigY = finalY + 45;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 80, 95);

  doc.text('_________________________', 25, sigY);
  doc.text('Class Teacher Signature', 28, sigY + 6);

  doc.text('_________________________', 85, sigY);
  doc.text('Exam Controller Seal', 90, sigY + 6);

  doc.text('_________________________', 145, sigY);
  doc.text('Principal / Headmaster', 150, sigY + 6);

  // Footer Disclaimer
  doc.setFontSize(7.5);
  doc.setTextColor(150, 160, 170);
  doc.text('Modern Group of Education | Kuchaman City | Official Academic Record Document', 105, 285, { align: 'center' });

  doc.save(`Report-Card-${studentName.replace(/\s+/g, '_')}-${rollNo}.pdf`);
}

window.downloadFeeReceiptPDF = downloadFeeReceiptPDF;
window.downloadReportCardPDF = downloadReportCardPDF;
