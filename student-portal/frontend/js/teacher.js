// Teacher Dashboard Operations

const session = protectPage('teacher');
if (!session) {
  // Redirecting...
}

const { token, user } = session || {};
let teacherData = null; // Stores teacher subject and class lists

document.addEventListener('DOMContentLoaded', () => {
  if (!session) return;

  setupNavigation();
  setupMobileSidebar();
  setupDateDefault();

  // Load teacher specific settings
  loadTeacherProfile();
});

// Navigation Setup
function setupNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  const sections = document.querySelectorAll('.content-section');
  const title = document.getElementById('section-title');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');

      tabs.forEach(t => t.classList.remove('active', 'bg-white/10', 'text-white'));
      tabs.forEach(t => t.classList.add('text-slate-300'));
      tab.classList.add('active', 'bg-white/10', 'text-white');
      tab.classList.remove('text-slate-300');

      sections.forEach(s => s.classList.add('hidden'));
      const activeSection = document.getElementById(`${target}-section`);
      if (activeSection) activeSection.classList.remove('hidden');

      const label = tab.textContent.trim();
      title.textContent = label;

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

// Defaults today's date in form
function setupDateDefault() {
  const dateField = document.getElementById('att-date');
  if (dateField) {
    dateField.value = new Date().toISOString().substring(0, 10);
  }
}

// Load profile & class lists
async function loadTeacherProfile() {
  try {
    const response = await fetch('/api/teachers/classes', {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to load classes.');
    }

    teacherData = await response.json();

    // Render top bar details
    document.getElementById('user-display-name').textContent = user.name;
    document.getElementById('user-display-subject').textContent = `${teacherData.subject} Teacher`;

    // Populate dropdown selectors
    populateSelectors(teacherData.classes);

    // Render Classes Grid
    renderClasses(teacherData.classes);

  } catch (err) {
    console.error(err);
  }
}

// Populates dropdown forms
function populateSelectors(classes) {
  const selectors = [
    document.getElementById('att-class-selector'),
    document.getElementById('marks-class-selector'),
    document.getElementById('asm-class')
  ];

  selectors.forEach(sel => {
    if (sel) {
      sel.innerHTML = '';
      classes.forEach(c => {
        const opt = document.createElement('option');
        opt.value = `${c.className}-${c.section}`;
        opt.textContent = `Class ${c.className} - Section ${c.section}`;
        sel.appendChild(opt);
      });
    }
  });

  // Bind roster loading events
  const attLoadBtn = document.getElementById('att-load-btn');
  if (attLoadBtn) {
    attLoadBtn.onclick = () => loadAttendanceRoster();
  }

  const marksLoadBtn = document.getElementById('marks-load-btn');
  if (marksLoadBtn) {
    marksLoadBtn.onclick = () => loadGradesheetRoster();
  }

  // Setup forms submit handlers
  setupFormsSubmit();
}

// Render Classes Grid view
function renderClasses(classes) {
  const grid = document.getElementById('teacher-classes-grid');
  grid.innerHTML = '';

  classes.forEach(c => {
    const card = document.createElement('div');
    card.className = 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-colors shadow-sm flex flex-col justify-between gap-4 hover:border-gold transition-all duration-300';
    
    card.innerHTML = `
      <div class="space-y-2">
        <i class="fa-solid fa-users-rectangle text-gold text-3xl"></i>
        <h4 class="text-navy dark:text-gold font-bold text-lg leading-tight">Class ${c.className} - ${c.section}</h4>
        <p class="text-xs text-slate-500 dark:text-slate-400">Subject: ${c.subject}</p>
      </div>
      <button onclick="loadClassRoster('${c.className}-${c.section}')" class="w-full py-2 bg-navy/5 dark:bg-gold/5 hover:bg-navy hover:text-white dark:hover:bg-gold dark:hover:text-navy text-navy dark:text-gold font-bold rounded-lg text-xs transition-colors cursor-pointer">
        View Student List
      </button>
    `;
    grid.appendChild(card);
  });
}

// 1. Fetch class roster for student list
async function loadClassRoster(classCode) {
  const rosterContainer = document.getElementById('class-roster-container');
  const tableBody = document.getElementById('roster-table-body');
  const titleSpan = document.getElementById('roster-class-name');
  const countSpan = document.getElementById('roster-student-count');

  try {
    const response = await fetch(`/api/teachers/students/${classCode}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Could not load student roster');

    const students = await response.json();

    titleSpan.textContent = classCode;
    countSpan.textContent = `${students.length} Students`;
    tableBody.innerHTML = '';

    if (students.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-slate-500">No students enrolled</td></tr>';
    } else {
      students.forEach(s => {
        const row = document.createElement('tr');
        row.className = 'border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors';
        row.innerHTML = `
          <td class="py-3 px-4 font-bold text-slate-500 w-20">${s.roll_no}</td>
          <td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">${s.name}</td>
          <td class="py-3 px-4 text-slate-500">${s.email}</td>
          <td class="py-3 px-4 text-center text-xs">${s.class}</td>
          <td class="py-3 px-4 text-center text-xs font-bold">${s.section}</td>
        `;
        tableBody.appendChild(row);
      });
    }

    // Unhide
    rosterContainer.classList.remove('hidden');
    // Scroll to view
    rosterContainer.scrollIntoView({ behavior: 'smooth' });

  } catch (err) {
    console.error(err);
  }
}

// 2. Load Attendance Sheet Form
async function loadAttendanceRoster() {
  const classCode = document.getElementById('att-class-selector').value;
  const form = document.getElementById('attendance-form');
  const tableBody = document.getElementById('attendance-table-body');

  try {
    const response = await fetch(`/api/teachers/students/${classCode}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Could not load attendance roster');

    const students = await response.json();
    tableBody.innerHTML = '';

    if (students.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-slate-500">No students enrolled in this class</td></tr>';
      form.classList.add('hidden');
      return;
    }

    students.forEach(s => {
      const row = document.createElement('tr');
      row.className = 'border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors';
      row.innerHTML = `
        <td class="py-3 px-4 font-bold text-slate-500 w-20">${s.roll_no}</td>
        <td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">${s.name}</td>
        <td class="py-3 px-4 text-center">
          <input type="radio" name="attendance-${s.student_id}" value="present" checked class="w-4 h-4 text-green-600 focus:ring-green-500">
        </td>
        <td class="py-3 px-4 text-center">
          <input type="radio" name="attendance-${s.student_id}" value="absent" class="w-4 h-4 text-red-600 focus:ring-red-500">
        </td>
        <td class="py-3 px-4 text-center">
          <input type="radio" name="attendance-${s.student_id}" value="late" class="w-4 h-4 text-amber-600 focus:ring-amber-500">
        </td>
      `;
      tableBody.appendChild(row);
    });

    form.classList.remove('hidden');

  } catch (err) {
    console.error(err);
  }
}

// 3. Load Student Gradesheet Form
async function loadGradesheetRoster() {
  const classCode = document.getElementById('marks-class-selector').value;
  const container = document.getElementById('marks-upload-container');
  const tableBody = document.getElementById('marks-table-body');

  try {
    const response = await fetch(`/api/teachers/students/${classCode}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Could not load gradesheet roster');

    const students = await response.json();
    tableBody.innerHTML = '';

    if (students.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7" class="py-4 text-center text-slate-500">No students enrolled in this class</td></tr>';
      container.classList.add('hidden');
      return;
    }

    students.forEach(s => {
      const row = document.createElement('tr');
      row.className = 'border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors';
      row.innerHTML = `
        <td class="py-3 px-4 font-bold text-slate-500 w-20">${s.roll_no}</td>
        <td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">${s.name}</td>
        <td class="py-3 px-4">
          <select id="exam-${s.student_id}" class="py-1 px-2 border rounded-md text-xs dark:bg-slate-800">
            <option value="Quarterly Exam">Quarterly Exam</option>
            <option value="Half Yearly Exam">Half Yearly Exam</option>
            <option value="Final Board Exam">Final Board Exam</option>
          </select>
        </td>
        <td class="py-3 px-4 text-center w-24">
          <input type="number" id="marks-${s.student_id}" placeholder="85" min="0" max="100" class="w-16 py-1 px-2 border rounded-md text-center text-xs dark:bg-slate-800">
        </td>
        <td class="py-3 px-4 text-center w-24">
          <input type="number" id="total-${s.student_id}" value="100" min="0" class="w-16 py-1 px-2 border rounded-md text-center text-xs dark:bg-slate-800">
        </td>
        <td class="py-3 px-4 text-center w-20">
          <input type="text" id="grade-${s.student_id}" placeholder="A" class="w-12 py-1 px-2 border rounded-md text-center text-xs uppercase dark:bg-slate-800">
        </td>
        <td class="py-3 px-4 text-center w-24">
          <button type="button" onclick="uploadSingleMark(${s.student_id})" id="btn-upload-${s.student_id}" class="py-1 px-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded text-xs transition-colors cursor-pointer">
            Upload
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    container.classList.remove('hidden');

  } catch (err) {
    console.error(err);
  }
}

// 3.1 Individual student mark upload
async function uploadSingleMark(studentId) {
  const exam = document.getElementById(`exam-${studentId}`).value;
  const marksStr = document.getElementById(`marks-${studentId}`).value.trim();
  const totalStr = document.getElementById(`total-${studentId}`).value.trim();
  const grade = document.getElementById(`grade-${studentId}`).value.trim();
  const uploadBtn = document.getElementById(`btn-upload-${studentId}`);

  if (marksStr === '' || totalStr === '' || grade === '') {
    alert('All grade fields are required before uploading.');
    return;
  }

  const marks = parseFloat(marksStr);
  const total = parseFloat(totalStr);

  try {
    uploadBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i>';
    uploadBtn.disabled = true;

    const response = await fetch('/api/teachers/results', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        student_id: studentId,
        exam_name: exam,
        subject: teacherData.subject,
        marks_obtained: marks,
        total_marks: total,
        grade
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to record grades.');

    // Success styling
    uploadBtn.className = 'py-1 px-3 bg-slate-500 text-white font-bold rounded text-xs cursor-default';
    uploadBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved';

  } catch (err) {
    alert(err.message);
    uploadBtn.innerHTML = 'Upload';
    uploadBtn.disabled = false;
  }
}

// Setup form submits
function setupFormsSubmit() {
  const attendanceForm = document.getElementById('attendance-form');
  const postAsmForm = document.getElementById('post-assignment-form');

  // Attendance Form Submit
  if (attendanceForm) {
    attendanceForm.onsubmit = async (e) => {
      e.preventDefault();
      
      const date = document.getElementById('att-date').value;
      const classCode = document.getElementById('att-class-selector').value;

      const radios = attendanceForm.querySelectorAll('input[type="radio"]:checked');
      const attendanceList = [];

      radios.forEach(radio => {
        const studentId = radio.name.split('-')[1];
        attendanceList.push({
          student_id: parseInt(studentId),
          status: radio.value
        });
      });

      try {
        const response = await fetch('/api/teachers/attendance', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            date,
            subject: teacherData.subject,
            attendanceList
          })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to save attendance.');

        alert('Attendance sheet updated successfully!');
        attendanceForm.classList.add('hidden');

      } catch (err) {
        alert(err.message);
      }
    };
  }

  // Post Assignment Form Submit
  if (postAsmForm) {
    postAsmForm.onsubmit = async (e) => {
      e.preventDefault();

      const title = document.getElementById('asm-title').value.trim();
      const description = document.getElementById('asm-desc').value.trim();
      const targetClass = document.getElementById('asm-class').value;
      const due_date = document.getElementById('asm-due').value;

      try {
        const response = await fetch('/api/teachers/assignments', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            title,
            description,
            class: targetClass.split('-')[0], // Extract class only (e.g. 11th from 11th-A)
            subject: teacherData.subject,
            due_date
          })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to post assignment.');

        alert('Assignment published successfully!');
        postAsmForm.reset();

      } catch (err) {
        alert(err.message);
      }
    };
  }
}
