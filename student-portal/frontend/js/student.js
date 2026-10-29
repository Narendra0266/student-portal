// Student Dashboard Operations

const session = protectPage('student');
if (!session) {
  // Redirecting...
}

const { token, user } = session || {};
let charts = {}; // references to chart.js instances
let currentStudentProfile = null;
let currentStudentResults = null;
let currentStudentFees = null;
let currentSelectedInvoice = null;
let leafletBusMap = null;
let busMarker = null;

// ===== FALLBACK DATA (used when backend API is unreachable on static Vercel) =====

const DEFAULT_STUDENT_PROFILE = {
  name: 'Aarav Sharma',
  roll_no: '24',
  class: '11th',
  section: 'A',
  dob: '2009-08-14',
  father_name: 'Rajesh Sharma',
  email: 'student@modern.edu',
  phone: '+91 98765 43210',
  address: '120, Ganesh Colony, Kuchaman City, Rajasthan',
  institution_id: 1,
  institution_name: 'New Modern Senior Secondary School',
  photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=250&auto=format&fit=crop',
  guardian: { name: 'Rajesh Sharma', relation: 'Father', phone: '+91 98765 00123' },
  emergencyContact: { name: 'Rajesh Sharma' }
};

const DEFAULT_STUDENT_ATTENDANCE = {
  overall: 92,
  presentCount: 46,
  lateCount: 2,
  absentCount: 2,
  bySubject: [
    { subject: 'Physics',     percent: 95,  present: 19, total: 20 },
    { subject: 'Chemistry',   percent: 90,  present: 18, total: 20 },
    { subject: 'Mathematics', percent: 95,  present: 19, total: 20 },
    { subject: 'English',     percent: 85,  present: 17, total: 20 },
    { subject: 'Physical Ed', percent: 100, present: 10, total: 10 }
  ]
};

const DEFAULT_STUDENT_RESULTS = {
  gpa: 3.85,
  terms: [
    {
      id: 'term1',
      name: 'Term 1 (Mid-Term)',
      subjects: [
        { name: 'Physics',     marks: 87, total: 100, grade: 'A',  remarks: 'Excellent performance' },
        { name: 'Chemistry',   marks: 82, total: 100, grade: 'A-', remarks: 'Good conceptual clarity' },
        { name: 'Mathematics', marks: 91, total: 100, grade: 'A+', remarks: 'Outstanding' },
        { name: 'English',     marks: 78, total: 100, grade: 'B+', remarks: 'Good writing skills' },
        { name: 'Computers',   marks: 88, total: 100, grade: 'A',  remarks: 'Very good logic' }
      ]
    },
    {
      id: 'term2',
      name: 'Term 2 (Annual)',
      subjects: [
        { name: 'Physics',     marks: 89, total: 100, grade: 'A',  remarks: 'Consistent improvement' },
        { name: 'Chemistry',   marks: 85, total: 100, grade: 'A',  remarks: 'Strong lab work' },
        { name: 'Mathematics', marks: 94, total: 100, grade: 'A+', remarks: 'Exceptional problem solving' },
        { name: 'English',     marks: 80, total: 100, grade: 'A-', remarks: 'Improved significantly' },
        { name: 'Computers',   marks: 92, total: 100, grade: 'A+', remarks: 'Top of the class' }
      ]
    }
  ]
};

const DEFAULT_STUDENT_FEES = {
  currency: '₹',
  outstanding: 12500,
  paidTotal: 37500,
  invoices: [
    { id: 1, receipt_no: 'REC-2024-001', amount: 12500, due_date: '2024-04-01', status: 'paid' },
    { id: 2, receipt_no: 'REC-2024-002', amount: 12500, due_date: '2024-07-01', status: 'paid' },
    { id: 3, receipt_no: 'REC-2024-003', amount: 12500, due_date: '2024-10-01', status: 'paid' },
    { id: 4, receipt_no: 'INV-2024-004', amount: 12500, due_date: '2025-01-15', status: 'pending' }
  ]
};

const DEFAULT_STUDENT_TIMETABLE = {
  Monday:    [
    { time: '8:00 - 8:45 AM',   subject: 'Physics',     teacher: 'Mr. Suresh Kumar', room: 'Lab 1' },
    { time: '8:45 - 9:30 AM',   subject: 'Mathematics', teacher: 'Mrs. Priya Verma', room: 'Room 11A' },
    { time: '9:45 - 10:30 AM',  subject: 'English',     teacher: 'Mr. D. Singh',     room: 'Room 11A' },
    { time: '10:30 - 11:15 AM', subject: 'Chemistry',   teacher: 'Mrs. S. Mehta',    room: 'Lab 2' }
  ],
  Tuesday:   [
    { time: '8:00 - 8:45 AM',   subject: 'Chemistry',   teacher: 'Mrs. S. Mehta',    room: 'Lab 2' },
    { time: '8:45 - 9:30 AM',   subject: 'Computers',   teacher: 'Mr. R. Gupta',     room: 'Computer Lab' },
    { time: '9:45 - 10:30 AM',  subject: 'Mathematics', teacher: 'Mrs. Priya Verma', room: 'Room 11A' },
    { time: '10:30 - 11:15 AM', subject: 'Physical Ed', teacher: 'Mr. K. Sharma',    room: 'Ground' }
  ],
  Wednesday: [
    { time: '8:00 - 8:45 AM',   subject: 'Mathematics', teacher: 'Mrs. Priya Verma', room: 'Room 11A' },
    { time: '8:45 - 9:30 AM',   subject: 'Physics',     teacher: 'Mr. Suresh Kumar', room: 'Lab 1' },
    { time: '9:45 - 10:30 AM',  subject: 'English',     teacher: 'Mr. D. Singh',     room: 'Room 11A' },
    { time: '10:30 - 11:15 AM', subject: 'Computers',   teacher: 'Mr. R. Gupta',     room: 'Computer Lab' }
  ],
  Thursday:  [
    { time: '8:00 - 8:45 AM',   subject: 'English',     teacher: 'Mr. D. Singh',     room: 'Room 11A' },
    { time: '8:45 - 9:30 AM',   subject: 'Chemistry',   teacher: 'Mrs. S. Mehta',    room: 'Lab 2' },
    { time: '9:45 - 10:30 AM',  subject: 'Physics',     teacher: 'Mr. Suresh Kumar', room: 'Lab 1' },
    { time: '10:30 - 11:15 AM', subject: 'Mathematics', teacher: 'Mrs. Priya Verma', room: 'Room 11A' }
  ],
  Friday:    [
    { time: '8:00 - 8:45 AM',   subject: 'Computers',   teacher: 'Mr. R. Gupta',     room: 'Computer Lab' },
    { time: '8:45 - 9:30 AM',   subject: 'Physical Ed', teacher: 'Mr. K. Sharma',    room: 'Ground' },
    { time: '9:45 - 10:30 AM',  subject: 'Chemistry',   teacher: 'Mrs. S. Mehta',    room: 'Lab 2' },
    { time: '10:30 - 11:15 AM', subject: 'Physics',     teacher: 'Mr. Suresh Kumar', room: 'Lab 1' }
  ]
};

const DEFAULT_STUDENT_NOTICES = [
  { id: 1, title: 'Annual Sports Day Announcement', content: 'Annual Sports Day will be held on 15th November. All students are expected to participate.', created_at: '2024-10-20', category: 'Events' },
  { id: 2, title: 'Mid-Term Exam Schedule Released', content: 'Mid-term examinations will commence from 1st November. Time-table is available on the notice board.', created_at: '2024-10-18', category: 'Academics' }
];

const DEFAULT_STUDENT_ASSIGNMENTS = [
  { id: 1, subject: 'Physics',     title: 'Newton\'s Laws Problems',         due_date: '2024-11-05', status: 'pending',   description: 'Solve exercises 5.1 to 5.10 from chapter 5.' },
  { id: 2, subject: 'Chemistry',   title: 'Periodic Table Report',            due_date: '2024-11-03', status: 'submitted', description: 'Write a 2-page report on the periodic table groups.' },
  { id: 3, subject: 'Mathematics', title: 'Calculus Practice Set',            due_date: '2024-11-08', status: 'pending',   description: 'Complete exercises from Section 7.3.' }
];

const DEFAULT_STUDENT_LIBRARY = [
  { id: 1, book_name: 'Concepts of Physics Vol. 1', author: 'H.C. Verma', issue_date: '2024-10-01', return_date: '2024-10-31', status: 'issued' },
  { id: 2, book_name: 'Higher Mathematics',          author: 'S.L. Loney',  issue_date: '2024-09-15', return_date: '2024-10-15', status: 'returned' }
];

const DEFAULT_STUDENT_TRANSPORT = {
  route_name: 'Route 4 - Kuchaman City North',
  stop_name: 'Ganesh Colony',
  timing: '07:15:00',
  bus_no: 'MH-12-AB-3456',
  driver_name: 'Ramesh Ji',
  driver_phone: '+91 98010 12345'
};

const DEFAULT_STUDENT_HOSTEL = null; // Day scholar by default

// ===== HELPER: safe fetch that never throws =====
async function safeFetch(url, options) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    try {
      return await res.json();
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!session) return;

  // Set topbar username immediately (before any async calls)
  const nameEl = document.getElementById('user-display-name');
  if (nameEl) nameEl.textContent = (user && user.name) || 'Student';

  setupNavigation();
  setupMobileSidebar();
  setupAssignmentForm();

  // Load Initial Data
  loadAllData();
});

// Setup sidebar tab selection
function setupNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  const sections = document.querySelectorAll('.content-section');
  const title = document.getElementById('section-title');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');

      // Update active nav style
      tabs.forEach(t => t.classList.remove('active', 'bg-white/10', 'text-white'));
      tabs.forEach(t => t.classList.add('text-slate-300'));
      tab.classList.add('active', 'bg-white/10', 'text-white');
      tab.classList.remove('text-slate-300');

      // Update active section
      sections.forEach(s => s.classList.add('hidden'));
      const activeSection = document.getElementById(`${target}-section`);
      if (activeSection) activeSection.classList.remove('hidden');

      // Update title bar
      const label = tab.textContent.trim();
      title.textContent = `${label} Panel`;

      // If opening transport tab, initialize or recenter map
      if (target === 'transport') {
        setTimeout(initOrRecenterBusMap, 200);
      }

      // Close mobile drawer on selection
      toggleMobileSidebar(false);
    });
  });
}

// Mobile sidebar controls
function setupMobileSidebar() {
  const openBtn = document.getElementById('open-sidebar');
  const closeBtn = document.getElementById('close-sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (openBtn) openBtn.addEventListener('click', () => toggleMobileSidebar(true));
  if (closeBtn) closeBtn.addEventListener('click', () => toggleMobileSidebar(false));
  if (overlay) overlay.addEventListener('click', () => toggleMobileSidebar(false));
}

function toggleMobileSidebar(show) {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  
  if (sidebar && overlay) {
    if (show) {
      sidebar.classList.remove('-translate-x-full');
      overlay.classList.remove('hidden');
    } else {
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
    }
  }
}

// Fetch and render data
async function loadAllData() {
  const headers = getAuthHeaders();

  // 1. Profile Details
  const profileData = await safeFetch('/api/students/profile', { headers });
  const profile = profileData || DEFAULT_STUDENT_PROFILE;
  currentStudentProfile = profile;
  renderProfile(profile);

  // 2. Attendance Details
  const attendanceData = await safeFetch('/api/students/attendance', { headers });
  renderAttendance(attendanceData || DEFAULT_STUDENT_ATTENDANCE);

  // 3. Results / Marks
  const resultsData = await safeFetch('/api/students/results', { headers });
  currentStudentResults = resultsData || DEFAULT_STUDENT_RESULTS;
  renderResults(currentStudentResults);

  // 4. Fees Status
  const feesData = await safeFetch('/api/students/fees', { headers });
  currentStudentFees = feesData || DEFAULT_STUDENT_FEES;
  renderFees(currentStudentFees);

  // 5. Timetable Schedule
  const timetableData = await safeFetch('/api/students/timetable', { headers });
  renderTimetable(timetableData || DEFAULT_STUDENT_TIMETABLE, profile.class, profile.section);

  // 6. Notices / Announcements
  const noticesData = await safeFetch('/api/notices', { headers });
  renderNotices(noticesData || DEFAULT_STUDENT_NOTICES);

  // 7. Homework / Assignments
  const assignmentsData = await safeFetch('/api/students/assignments', { headers });
  renderAssignments(assignmentsData || DEFAULT_STUDENT_ASSIGNMENTS);

  // 8. Library Logs
  const libraryData = await safeFetch('/api/students/library', { headers });
  renderLibrary(libraryData || DEFAULT_STUDENT_LIBRARY);

  // 9. Transport Logs
  const transportData = await safeFetch('/api/students/transport', { headers });
  if (transportData || DEFAULT_STUDENT_TRANSPORT) {
    renderTransport(transportData || DEFAULT_STUDENT_TRANSPORT);
  }

  // 10. Hostel Logs
  const hostelData = await safeFetch('/api/students/hostel', { headers });
  if (hostelData) {
    renderHostel(hostelData);
  }
}

// 1. Profile rendering
function renderProfile(profile) {
  // Cache user data in top bar
  document.getElementById('user-avatar').src = profile.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop';
  document.getElementById('user-display-name').textContent = profile.name;
  document.getElementById('user-display-school').textContent = profile.institution_name || 'Modern Group of Education';

  // Welcomer
  document.getElementById('welcome-student-name').textContent = profile.name.split(' ')[0];
  document.getElementById('welcome-roll').textContent = profile.roll_no;
  document.getElementById('welcome-inst').textContent = `INST-${profile.institution_id || 1}`;

  // ID Card flip sides
  document.getElementById('id-photo').src = profile.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop';
  document.getElementById('id-name').textContent = profile.name;
  document.getElementById('id-class-section').textContent = `${profile.class} - ${profile.section}`;
  document.getElementById('id-roll').textContent = profile.roll_no;
  document.getElementById('id-father').textContent = profile.father_name;
  
  // Format Date of Birth
  const dobDate = new Date(profile.dob);
  const formattedDob = dobDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('id-dob').textContent = formattedDob;
  document.getElementById('id-phone').textContent = profile.phone;

  // Dynamic QR Code on ID card
  const qrEl = document.getElementById('id-qr-code');
  if (qrEl) {
    const qrData = encodeURIComponent(`MODERN GROUP STUDENT ID\nName: ${profile.name}\nRoll: ${profile.roll_no}\nClass: ${profile.class}-${profile.section}\nSchool: ${profile.institution_name || 'Modern Senior Secondary School'}\nStatus: VERIFIED ENROLLED`);
    qrEl.src = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${qrData}`;
  }

  // Personal details list
  document.getElementById('prof-name').textContent = profile.name;
  document.getElementById('prof-email').textContent = profile.email;
  document.getElementById('prof-phone').textContent = profile.phone;
  document.getElementById('prof-address').textContent = profile.address;

  // Family details
  document.getElementById('prof-guardian-name').textContent = profile.guardian.name;
  document.getElementById('prof-guardian-relation').textContent = profile.guardian.relation;
  document.getElementById('prof-guardian-phone').textContent = profile.guardian.phone;
  document.getElementById('prof-emergency-name').textContent = profile.emergencyContact.name;
}

// 2. Attendance rendering
function renderAttendance(data) {
  // Update badge
  document.getElementById('attendance-percent-badge').textContent = `${data.overall}%`;

  // Subject table list
  const list = document.getElementById('attendance-subject-list');
  list.innerHTML = '';

  data.bySubject.forEach(sub => {
    // Determine colors
    let progressColor = 'bg-green-500';
    let textColor = 'text-green-600 dark:text-green-400';
    if (sub.percent < 75) {
      progressColor = 'bg-red-500';
      textColor = 'text-red-600 dark:text-red-400';
    } else if (sub.percent < 85) {
      progressColor = 'bg-amber-500';
      textColor = 'text-amber-600 dark:text-amber-400';
    }

    const item = document.createElement('div');
    item.className = 'p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4';
    item.innerHTML = `
      <div class="flex-grow space-y-1 w-full">
        <div class="flex justify-between text-sm font-semibold">
          <span>${sub.subject}</span>
          <span class="${textColor}">${sub.percent}%</span>
        </div>
        <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
          <div class="${progressColor} h-full" style="width: ${sub.percent}%"></div>
        </div>
      </div>
      <div class="text-xs text-slate-500 dark:text-slate-400 shrink-0">
        ${sub.present} Attended / ${sub.total} Classes
      </div>
    `;
    list.appendChild(item);
  });

  // Render Pie Chart
  const ctx = document.getElementById('attendance-pie-chart').getContext('2d');
  
  if (charts.attendance) {
    charts.attendance.destroy();
  }

  const isDark = document.documentElement.classList.contains('dark');
  const textLabelColor = isDark ? '#94a3b8' : '#64748b';

  charts.attendance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Present', 'Late (Half)', 'Absent'],
      datasets: [{
        data: [data.presentCount, data.lateCount, data.absentCount],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textLabelColor,
            boxWidth: 12,
            font: { size: 10 }
          }
        }
      },
      cutout: '70%'
    }
  });
}

// 3. Results rendering
function renderResults(data) {
  const selector = document.getElementById('exam-selector');
  selector.innerHTML = '';

  if (data.terms.length === 0) {
    selector.innerHTML = '<option>No records available</option>';
    return;
  }

  data.terms.forEach(term => {
    const opt = document.createElement('option');
    opt.value = term.id;
    opt.textContent = term.name;
    selector.appendChild(opt);
  });

  // Function to render chart and table for selected term
  const displayTermResults = (termId) => {
    const term = data.terms.find(t => t.id === termId);
    if (!term) return;

    // Render table
    const tableBody = document.getElementById('results-table-body');
    tableBody.innerHTML = '';

    term.subjects.forEach(sub => {
      let gradeBadgeColor = 'bg-navy dark:bg-gold text-white dark:text-navy';
      if (sub.grade.startsWith('A')) gradeBadgeColor = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      else if (sub.grade.startsWith('B')) gradeBadgeColor = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      else if (sub.grade.startsWith('C')) gradeBadgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';

      const row = document.createElement('tr');
      row.className = 'border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors';
      row.innerHTML = `
        <td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">${sub.name}</td>
        <td class="py-3 px-4 text-center font-bold">${sub.marks}</td>
        <td class="py-3 px-4 text-center text-slate-500">${sub.total}</td>
        <td class="py-3 px-4 text-center">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${gradeBadgeColor}">${sub.grade}</span>
        </td>
        <td class="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">${sub.remarks}</td>
      `;
      tableBody.appendChild(row);
    });

    // Render Bar Chart
    const ctx = document.getElementById('marks-bar-chart').getContext('2d');
    if (charts.results) {
      charts.results.destroy();
    }

    const isDark = document.documentElement.classList.contains('dark');
    const labelColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? '#334155' : '#e2e8f0';

    const subjectsLabels = term.subjects.map(s => s.name);
    const marksData = term.subjects.map(s => Math.round((s.marks / s.total) * 100));

    charts.results = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: subjectsLabels,
        datasets: [{
          label: 'Percentage Obtained (%)',
          data: marksData,
          backgroundColor: '#c9a227',
          hoverBackgroundColor: '#dfb83c',
          borderRadius: 6,
          barThickness: 24
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            grid: { color: gridColor },
            ticks: { color: labelColor }
          },
          x: {
            grid: { display: false },
            ticks: { color: labelColor }
          }
        }
      }
    });
  };

  // Bind change handler
  selector.onchange = (e) => {
    displayTermResults(e.target.value);
  };

  // Initial display
  displayTermResults(data.terms[0].id);
}

// 4. Fees rendering
function renderFees(data) {
  currentStudentFees = data;
  document.getElementById('fee-outstanding-amt').textContent = `${data.currency}${data.outstanding.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
  document.getElementById('fee-paid-amt').textContent = `${data.currency}${data.paidTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}`;

  const payBtn = document.getElementById('btn-pay-fees');
  if (payBtn) {
    if (data.outstanding > 0) {
      payBtn.classList.remove('hidden');
    } else {
      payBtn.classList.add('hidden');
    }
  }

  const tableBody = document.getElementById('fees-table-body');
  tableBody.innerHTML = '';

  if (data.invoices.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" class="py-4 text-center text-slate-500">No transactions recorded</td></tr>';
    return;
  }

  data.invoices.forEach(inv => {
    const isPaid = inv.status === 'paid';
    const badgeColor = isPaid 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';

    const row = document.createElement('tr');
    row.className = 'border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors';
    
    // Format Date
    const dueStr = new Date(inv.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    const actionHtml = isPaid
      ? `<button onclick="triggerFeeReceiptDownload(${inv.id})" class="px-2.5 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-700 dark:text-green-400 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer ml-auto">
          <i class="fa-solid fa-file-arrow-down text-xs"></i> Receipt
        </button>`
      : `<button onclick="openPaymentModal(${inv.id}, ${inv.amount})" class="px-3 py-1 bg-gold hover:bg-gold-dark text-navy font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer ml-auto">
          <i class="fa-solid fa-credit-card text-xs"></i> Pay Now
        </button>`;

    row.innerHTML = `
      <td class="py-3 font-semibold text-slate-800 dark:text-slate-200">${inv.receipt_no || `INV-${inv.id}`}</td>
      <td class="py-3 text-slate-600 dark:text-slate-300">Term Tuition / Board Fees</td>
      <td class="py-3 font-bold">${data.currency}${parseFloat(inv.amount).toFixed(2)}</td>
      <td class="py-3 text-slate-500 text-xs">${dueStr}</td>
      <td class="py-3">
        <span class="px-2 py-0.5 rounded text-xs font-bold uppercase ${badgeColor}">${inv.status}</span>
      </td>
      <td class="py-3 text-right">
        ${actionHtml}
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// 5. Timetable rendering
function renderTimetable(timetable, studentClass, studentSection) {
  document.getElementById('timetable-class-badge').textContent = `Class ${studentClass} - ${studentSection}`;

  const container = document.getElementById('timetable-days-container');
  container.innerHTML = '';

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  days.forEach(day => {
    const slots = timetable[day] || [];
    const card = document.createElement('div');
    card.className = 'bg-slate-50 dark:bg-slate-800/40 rounded-xl p-5 border border-slate-200/50 dark:border-slate-800/80 space-y-4';
    
    let slotsHtml = '';
    if (slots.length === 0) {
      slotsHtml = '<p class="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">No classes scheduled</p>';
    } else {
      slots.forEach(slot => {
        slotsHtml += `
          <div class="flex items-start gap-3 border-l-2 border-gold pl-3 py-1">
            <div class="space-y-0.5">
              <span class="text-xs text-slate-500 dark:text-slate-400 block">${slot.time}</span>
              <h5 class="text-sm font-semibold text-slate-850 dark:text-slate-200">${slot.subject}</h5>
              <span class="text-[10px] text-slate-400 block">${slot.teacher} • ${slot.room}</span>
            </div>
          </div>
        `;
      });
    }

    card.innerHTML = `
      <h4 class="font-bold text-navy dark:text-gold border-b border-slate-200 dark:border-slate-850 pb-2 flex justify-between items-center text-sm">
        <span>${day}</span>
        <i class="fa-solid fa-calendar text-[11px] text-slate-400"></i>
      </h4>
      <div class="space-y-3">
        ${slotsHtml}
      </div>
    `;
    container.appendChild(card);
  });
}

// 6. Notices rendering
function renderNotices(notices) {
  const container = document.getElementById('notices-list-container');
  container.innerHTML = '';

  if (notices.length === 0) {
    container.innerHTML = '<p class="text-center text-slate-500 py-6">No notices posted recently</p>';
    return;
  }

  notices.forEach(notice => {
    const item = document.createElement('div');
    item.className = 'p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gold/30 transition-all cursor-pointer';
    
    // Category label colors
    let catColor = 'bg-navy/10 text-navy dark:bg-gold/10 dark:text-gold';
    if (notice.category === 'Events') catColor = 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    else if (notice.category === 'Fees') catColor = 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';

    const dateStr = new Date(notice.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    item.innerHTML = `
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${catColor}">${notice.category}</span>
          <span class="text-xs text-slate-400">${dateStr}</span>
        </div>
        <h5 class="font-bold text-[#1e293b] dark:text-slate-100 text-sm md:text-base">${notice.title}</h5>
        <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">${notice.content}</p>
      </div>
      <span class="text-xs text-gold font-semibold shrink-0 hover:underline">Read Notice <i class="fa-solid fa-chevron-right ml-1"></i></span>
    `;

    // Click handler to open Notice Modal
    item.addEventListener('click', () => {
      document.getElementById('modal-notice-title').textContent = notice.title;
      document.getElementById('modal-notice-category').textContent = notice.category;
      document.getElementById('modal-notice-category').className = `px-2 py-0.5 rounded font-bold uppercase ${catColor}`;
      document.getElementById('modal-notice-date').textContent = dateStr;
      document.getElementById('modal-notice-content').textContent = notice.content;

      document.getElementById('notice-modal').showModal();
    });

    container.appendChild(item);
  });
}

// 7. Assignments rendering
function renderAssignments(assignments) {
  const container = document.getElementById('assignments-grid-container');
  container.innerHTML = '';

  const activeFilterBtn = document.querySelector('.assignment-filter-btn.bg-navy');
  const activeFilter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';

  // Bind filter button events
  const filterBtns = document.querySelectorAll('.assignment-filter-btn');
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => {
        b.className = 'assignment-filter-btn px-3 py-1 border border-slate-300 dark:border-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer';
      });
      btn.className = 'assignment-filter-btn px-3 py-1 bg-navy text-white text-xs font-semibold rounded-lg cursor-pointer';
      renderAssignments(assignments);
    };
  });

  let list = assignments;
  if (activeFilter === 'pending') {
    list = assignments.filter(a => a.status === 'pending');
  } else if (activeFilter === 'submitted') {
    list = assignments.filter(a => a.status === 'submitted');
  }

  if (list.length === 0) {
    container.innerHTML = '<p class="text-center text-slate-500 py-6 col-span-2">No assignments found matching this filter</p>';
    return;
  }

  list.forEach(asm => {
    const isSubmitted = asm.status === 'submitted';
    const card = document.createElement('div');
    card.className = `p-5 bg-white dark:bg-slate-900 border ${isSubmitted ? 'border-slate-200 dark:border-slate-800' : 'border-gold/30 dark:border-gold/20'} rounded-xl transition-all shadow-sm flex flex-col justify-between gap-4`;

    const dueStr = new Date(asm.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    let buttonHtml = '';
    if (isSubmitted) {
      const subTime = new Date(asm.submitted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      buttonHtml = `
        <div class="flex items-center gap-2 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20">
          <i class="fa-solid fa-circle-check"></i> Submitted on ${subTime}
        </div>
      `;
    } else {
      buttonHtml = `
        <button onclick="triggerSubmitDialog(${asm.id}, '${asm.title.replace(/'/g, "\\'")}')" class="px-4 py-2 bg-gold hover:bg-gold-light text-navy font-bold rounded-lg text-xs transition-colors cursor-pointer">
          <i class="fa-solid fa-upload mr-1"></i> Submit Homework
        </button>
      `;
    }

    card.innerHTML = `
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-navy dark:text-gold uppercase tracking-wide bg-navy/5 dark:bg-gold/5 px-2 py-0.5 rounded">${asm.subject}</span>
          <span class="text-xs text-slate-400 font-semibold flex items-center gap-1"><i class="fa-regular fa-clock"></i> Due: ${dueStr}</span>
        </div>
        <h5 class="font-bold text-slate-800 dark:text-slate-100 text-base leading-snug">${asm.title}</h5>
        <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">${asm.description}</p>
      </div>
      <div class="flex justify-between items-center mt-2">
        <span class="text-[11px] text-slate-400">Class: ${asm.class}</span>
        ${buttonHtml}
      </div>
    `;
    container.appendChild(card);
  });
}

// Dialog helper trigger
function triggerSubmitDialog(id, title) {
  document.getElementById('submit-assignment-id').value = id;
  document.getElementById('submit-assignment-title').textContent = title;
  document.getElementById('file-info-name').textContent = '';
  document.getElementById('file-info-name').classList.add('hidden');
  document.getElementById('submit-assignment-form').reset();
  document.getElementById('assignment-modal').showModal();
}

// Drag & drop file upload
function setupAssignmentForm() {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('assignment-file');
  const fileInfoLabel = document.getElementById('file-info-name');
  const form = document.getElementById('submit-assignment-form');

  if (dropZone && fileInput) {
    dropZone.onclick = () => fileInput.click();

    fileInput.onchange = (e) => {
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        fileInfoLabel.textContent = `Attached: ${file.name} (${Math.round(file.size / 1024)} KB)`;
        fileInfoLabel.classList.remove('hidden');
      }
    };

    dropZone.ondragover = (e) => {
      e.preventDefault();
      dropZone.classList.add('border-gold');
    };

    dropZone.ondragleave = () => {
      dropZone.classList.remove('border-gold');
    };

    dropZone.ondrop = (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-gold');
      if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        const file = e.dataTransfer.files[0];
        fileInfoLabel.textContent = `Attached: ${file.name} (${Math.round(file.size / 1024)} KB)`;
        fileInfoLabel.classList.remove('hidden');
      }
    };
  }

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const assignmentId = document.getElementById('submit-assignment-id').value;

      try {
        const response = await fetch(`/api/students/assignments/${assignmentId}/submit`, {
          method: 'PUT',
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error('Could not submit assignment');
        }

        // Close and reload
        document.getElementById('assignment-modal').close();
        loadAllData();
      } catch (err) {
        alert(err.message || 'Submission failed');
      }
    };
  }
}

// 8. Library rendering
function renderLibrary(books) {
  const tableBody = document.getElementById('library-table-body');
  tableBody.innerHTML = '';

  if (books.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="4" class="py-4 text-center text-slate-500">No books currently borrowed</td></tr>';
    return;
  }

  books.forEach(b => {
    let badgeColor = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (b.status === 'issued') badgeColor = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    else if (b.status === 'overdue') badgeColor = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';

    const issueStr = new Date(b.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const returnStr = b.return_date 
      ? new Date(b.return_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : '--';

    const row = document.createElement('tr');
    row.className = 'border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors';
    row.innerHTML = `
      <td class="py-3 px-4 font-semibold text-slate-850 dark:text-slate-200">${b.book_name}</td>
      <td class="py-3 px-4 text-xs text-slate-500">${issueStr}</td>
      <td class="py-3 px-4 text-xs text-slate-500">${returnStr}</td>
      <td class="py-3 px-4">
        <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${badgeColor}">${b.status}</span>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// 9. Transport details
function renderTransport(transport) {
  const container = document.getElementById('transport-details-container');

  if (!transport || transport.message) {
    container.innerHTML = '<p class="text-slate-500 dark:text-slate-400">No transport services mapped to this profile</p>';
    return;
  }

  container.innerHTML = `
    <div class="grid grid-cols-2 gap-4">
      <div>
        <span class="text-slate-450 dark:text-slate-400 block text-xs">Route Name</span>
        <span class="font-bold text-slate-800 dark:text-slate-100">${transport.route_name}</span>
      </div>
      <div>
        <span class="text-slate-450 dark:text-slate-400 block text-xs">Boarding Time</span>
        <span class="font-bold text-slate-800 dark:text-slate-100">${transport.timing.substring(0, 5)} AM</span>
      </div>
      <div class="col-span-2">
        <span class="text-slate-400 dark:text-slate-400 block text-xs">Pickup Stop</span>
        <span class="font-bold text-slate-800 dark:text-slate-100">${transport.stop_name}</span>
      </div>
    </div>
  `;
}

// 10. Hostel details
function renderHostel(hostel) {
  const container = document.getElementById('hostel-details-container');

  if (!hostel || hostel.message) {
    container.innerHTML = '<p class="text-slate-500 dark:text-slate-400">No hostel rooms allocated to this student profile</p>';
    return;
  }

  container.innerHTML = `
    <div class="grid grid-cols-2 gap-4">
      <div>
        <span class="text-slate-450 dark:text-slate-400 block text-xs">Room / Block</span>
        <span class="font-bold text-slate-800 dark:text-slate-100">${hostel.room_no}</span>
      </div>
      <div>
        <span class="text-slate-450 dark:text-slate-400 block text-xs">Hostel Warden</span>
        <span class="font-bold text-slate-800 dark:text-slate-100">${hostel.warden_name}</span>
      </div>
      <div class="col-span-2">
        <span class="text-slate-450 dark:text-slate-400 block text-xs">Mess Timing Details</span>
        <span class="font-bold text-slate-800 dark:text-slate-100 leading-snug">${hostel.mess_timing}</span>
      </div>
    </div>
  `;
}

// ================= NEW UPGRADES (PDF, UPI PAYMENT, MAP) =================

// Trigger Download of Official Fee Receipt (PDF)
function triggerFeeReceiptDownload(invoiceId) {
  const prof = currentStudentProfile || DEFAULT_STUDENT_PROFILE;
  const fees = currentStudentFees || DEFAULT_STUDENT_FEES;
  const inv = (fees.invoices || []).find(i => i.id === invoiceId) || {
    id: invoiceId,
    receipt_no: `REC-2026-${invoiceId}`,
    amount: 12500,
    status: 'paid'
  };
  downloadFeeReceiptPDF(inv, prof);
}

// Trigger Download of Official Term Report Card (PDF)
function triggerStudentReportCardDownload() {
  const prof = currentStudentProfile || DEFAULT_STUDENT_PROFILE;
  const results = currentStudentResults || DEFAULT_STUDENT_RESULTS;
  const examSelect = document.getElementById('exam-selector');
  const examTitle = examSelect ? examSelect.options[examSelect.selectedIndex]?.text : 'Term Examination 2026-27';
  const examKey = examSelect ? examSelect.value : (results.terms ? results.terms[0]?.id : 'term1');
  const termObj = (results.terms || []).find(t => t.id === examKey) || results.terms?.[0];
  const list = termObj ? termObj.subjects : [];
  downloadReportCardPDF(list, prof, examTitle);
}

// Print / Save ID Card
function printStudentIDCard() {
  window.print();
}

// Payment Modal Controller
function openPaymentModal(invoiceId, amount) {
  const fees = currentStudentFees || DEFAULT_STUDENT_FEES;
  currentSelectedInvoice = (fees.invoices || []).find(i => i.id === invoiceId) || {
    id: invoiceId,
    amount: amount || 12500,
    receipt_no: `INV-2024-00${invoiceId}`
  };
  const amt = parseFloat(currentSelectedInvoice.amount || 12500);
  document.getElementById('pay-amount-display').textContent = `₹${amt.toLocaleString('en-IN', {minimumFractionDigits: 2})}`;
  document.getElementById('btn-pay-amount').textContent = `₹${amt.toLocaleString('en-IN')}`;
  document.getElementById('pay-invoice-sub').textContent = currentSelectedInvoice.receipt_no || `INV-${invoiceId}`;

  // Update dynamic QR Code
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=modern.education@icici&pn=Modern+Group+of+Education&am=${amt}&cu=INR`)}`;
  document.getElementById('upi-qr-image').src = qrUrl;

  const modal = document.getElementById('payment-modal');
  if (modal) {
    if (typeof modal.showModal === 'function') modal.showModal();
    else modal.classList.remove('hidden');
  }
}

function closePaymentModal() {
  const modal = document.getElementById('payment-modal');
  if (modal) {
    if (typeof modal.close === 'function') modal.close();
    else modal.classList.add('hidden');
  }
}

function switchPayMethod(method) {
  const upiTab = document.getElementById('pay-tab-upi');
  const cardTab = document.getElementById('pay-tab-card');
  const upiView = document.getElementById('pay-view-upi');
  const cardView = document.getElementById('pay-view-card');

  if (method === 'upi') {
    upiTab.className = "p-2.5 rounded-lg border-2 border-navy dark:border-gold bg-navy/5 dark:bg-gold/10 text-navy dark:text-gold font-bold flex items-center justify-center gap-1.5 cursor-pointer";
    cardTab.className = "p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800";
    upiView.classList.remove('hidden');
    cardView.classList.add('hidden');
  } else {
    cardTab.className = "p-2.5 rounded-lg border-2 border-navy dark:border-gold bg-navy/5 dark:bg-gold/10 text-navy dark:text-gold font-bold flex items-center justify-center gap-1.5 cursor-pointer";
    upiTab.className = "p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800";
    cardView.classList.remove('hidden');
    upiView.classList.add('hidden');
  }
}

function executeSimulatedPayment() {
  const btn = document.getElementById('btn-confirm-payment');
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Contacting Payment Gateway...';
  btn.disabled = true;

  setTimeout(() => {
    btn.innerHTML = '<i class="fa-solid fa-check text-green-400"></i> Payment Verified & Success!';
    btn.classList.replace('bg-navy', 'bg-green-600');

    // Update status in local fees state
    if (currentSelectedInvoice && currentStudentFees) {
      const inv = currentStudentFees.invoices.find(i => i.id === currentSelectedInvoice.id);
      if (inv) {
        inv.status = 'paid';
        inv.receipt_no = `REC-2026-${String(Math.floor(100 + Math.random() * 900))}`;
      }
      currentStudentFees.paidTotal += parseFloat(currentSelectedInvoice.amount);
      currentStudentFees.outstanding = Math.max(0, currentStudentFees.outstanding - parseFloat(currentSelectedInvoice.amount));
    }

    renderFees(currentStudentFees);

    setTimeout(() => {
      // Auto download receipt PDF
      const paidInv = currentSelectedInvoice || { id: 4, amount: 12500, receipt_no: 'REC-2026-904' };
      downloadFeeReceiptPDF(paidInv, currentStudentProfile || DEFAULT_STUDENT_PROFILE);

      closePaymentModal();
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-lock"></i> Verify & Pay Fee';
      btn.classList.replace('bg-green-600', 'bg-navy');
    }, 1200);
  }, 1000);
}

// Live GPS Bus Tracker (Kuchaman City coordinates)
function initOrRecenterBusMap() {
  const mapContainer = document.getElementById('transport-map');
  if (!mapContainer || !window.L) return;

  // Kuchaman City coordinates: ~27.1504° N, 75.0592° E
  const schoolCoords = [27.1520, 75.0610];
  const stopCoords = [27.1430, 75.0480];
  const busStartCoords = [27.1400, 75.0420];

  if (!leafletBusMap) {
    leafletBusMap = L.map('transport-map').setView(schoolCoords, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(leafletBusMap);

    // School Marker
    const schoolIcon = L.divIcon({
      html: '<div style="background:#1a2e5a; color:#c9a227; padding:6px; border-radius:50%; border:2px solid #c9a227; text-align:center; font-size:14px; box-shadow:0 4px 10px rgba(0,0,0,0.3);"><i class="fa-solid fa-school"></i></div>',
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    L.marker(schoolCoords, { icon: schoolIcon }).addTo(leafletBusMap)
      .bindPopup('<strong>Modern Group of Education</strong><br>Main Campus, Kuchaman City');

    // Pickup Stop Marker
    const stopIcon = L.divIcon({
      html: '<div style="background:#0f172a; color:#38bdf8; padding:6px; border-radius:50%; border:2px solid #38bdf8; text-align:center; font-size:12px; box-shadow:0 4px 10px rgba(0,0,0,0.3);"><i class="fa-solid fa-location-pin"></i></div>',
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    L.marker(stopCoords, { icon: stopIcon }).addTo(leafletBusMap)
      .bindPopup('<strong>Pickup Stop: Ganesh Colony</strong><br>Boarding Time: 07:15 AM');

    // Route line
    const routeCoords = [
      [27.1380, 75.0380],
      [27.1400, 75.0420],
      [27.1430, 75.0480],
      [27.1480, 75.0540],
      [27.1520, 75.0610]
    ];
    L.polyline(routeCoords, { color: '#c9a227', weight: 4, opacity: 0.8, dashArray: '8, 8' }).addTo(leafletBusMap);

    // Animated Bus Marker
    const busIcon = L.divIcon({
      html: '<div style="background:#f59e0b; color:#ffffff; padding:7px; border-radius:50%; border:2px solid #ffffff; text-align:center; font-size:13px; box-shadow:0 0 14px rgba(245,158,11,0.9);"><i class="fa-solid fa-bus"></i></div>',
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    busMarker = L.marker(busStartCoords, { icon: busIcon }).addTo(leafletBusMap)
      .bindPopup('<strong>Bus #MH-12-AB-3456</strong><br>Driver: Ramesh Ji (+91 98010 12345)<br>Status: In Transit');

    // Animate bus position along points
    let step = 0;
    setInterval(() => {
      if (!busMarker) return;
      step = (step + 1) % routeCoords.length;
      busMarker.setLatLng(routeCoords[step]);
    }, 4000);
  } else {
    leafletBusMap.invalidateSize();
    leafletBusMap.setView(schoolCoords, 14);
  }
}

// Expose globals for HTML inline onclick
window.triggerFeeReceiptDownload = triggerFeeReceiptDownload;
window.triggerStudentReportCardDownload = triggerStudentReportCardDownload;
window.printStudentIDCard = printStudentIDCard;
window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;
window.switchPayMethod = switchPayMethod;
window.executeSimulatedPayment = executeSimulatedPayment;
window.initOrRecenterBusMap = initOrRecenterBusMap;
