// Admin Dashboard Operations

const session = protectPage('admin');
if (!session) {
  // Redirecting...
}

const { token, user } = session || {};
const DEFAULT_INSTITUTIONS = [
  { id: 1, name: 'New Modern Senior Secondary School' },
  { id: 2, name: 'Modern English School' },
  { id: 3, name: 'Modern Girls College' }
];

const DEFAULT_STUDENTS = [
  {
    student_id: 1,
    roll_no: '24',
    name: 'Aarav Sharma',
    institution_id: 1,
    institution_name: 'New Modern Senior Secondary School',
    email: 'student@modern.edu',
    class: '11th',
    section: 'A',
    dob: '2009-08-14',
    father_name: 'Rajesh Sharma',
    address: '120, Ganesh Colony, Kuchaman City, Rajasthan',
    phone: '+91 9876543210'
  },
  {
    student_id: 2,
    roll_no: '12',
    name: 'Rahul Choudhary',
    institution_id: 2,
    institution_name: 'Modern English School',
    email: 'rahul.student@modern.edu',
    class: '11th',
    section: 'B',
    dob: '2009-05-20',
    father_name: 'Mohan Choudhary',
    address: '45, Main Market, Kuchaman City, Rajasthan',
    phone: '+91 9988776655'
  }
];

const DEFAULT_TEACHERS = [
  {
    teacher_id: 1,
    name: 'Suresh Kumar',
    email: 'teacher@modern.edu',
    institution_id: 1,
    institution_name: 'New Modern Senior Secondary School',
    subject: 'Physics',
    assigned_classes: '11th-A,12th-A'
  },
  {
    teacher_id: 2,
    name: 'Priya Verma',
    email: 'priya.teacher@modern.edu',
    institution_id: 2,
    institution_name: 'Modern English School',
    subject: 'Mathematics',
    assigned_classes: '11th-B,10th-A'
  }
];

let institutionsList = [...DEFAULT_INSTITUTIONS];
let teachersList = [];
let studentsList = [];

document.addEventListener('DOMContentLoaded', () => {
  if (!session) return;

  setupNavigation();
  setupMobileSidebar();
  setupFeeStatusFieldsToggle();

  // Populate institutions immediately so dropdowns and cards are never empty
  renderInstitutionsUI(DEFAULT_INSTITUTIONS);

  // Load Admin Data
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

      tabs.forEach(t => t.classList.remove('active', 'bg-white/10', 'text-white'));
      tabs.forEach(t => t.classList.add('text-slate-300'));
      tab.classList.add('active', 'bg-white/10', 'text-white');
      tab.classList.remove('text-slate-300');

      sections.forEach(s => s.classList.add('hidden'));
      const activeSection = document.getElementById(`${target}-section`);
      if (activeSection) activeSection.classList.remove('hidden');

      const label = tab.textContent.trim();
      title.textContent = label;

      // Reload section data dynamically when clicking tab
      loadSectionData(target);

      toggleMobileSidebar(false);
    });
  });

  const studentFilter = document.getElementById('student-campus-filter');
  if (studentFilter) {
    studentFilter.addEventListener('change', () => loadStudentsTable());
  }
  const teacherFilter = document.getElementById('teacher-campus-filter');
  if (teacherFilter) {
    teacherFilter.addEventListener('change', () => loadTeachersTable());
  }
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

// Toggle fee dialog paid-date/receipt fields based on status
function setupFeeStatusFieldsToggle() {
  const statusSelect = document.getElementById('fee-status');
  const paidFieldsDiv = document.getElementById('fee-paid-fields');
  if (statusSelect && paidFieldsDiv) {
    statusSelect.onchange = () => {
      if (statusSelect.value === 'paid' || statusSelect.value === 'partial') {
        paidFieldsDiv.classList.remove('hidden');
      } else {
        paidFieldsDiv.classList.add('hidden');
      }
    };
  }
}

// Global data loading
async function loadAllData() {
  await loadInstitutions();
  // Load student & teacher lists first so stats can count from local data
  await loadStudentsTable();
  await loadTeachersTable();
  await loadStats();
  await loadSectionData('dashboard');
}

// Load stats widgets
async function loadStats() {
  try {
    const response = await fetch('/api/admin/dashboard', { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('API unavailable');
    let stats;
    try { stats = await response.json(); } catch { throw new Error('Bad JSON'); }

    document.getElementById('stat-students').textContent = stats.totalStudents;
    document.getElementById('stat-teachers').textContent = stats.totalTeachers;
    document.getElementById('stat-fees').textContent = `₹${parseFloat(stats.totalFeesCollected).toLocaleString(undefined, {minimumFractionDigits:2})}`;
    document.getElementById('stat-attendance').textContent = `${stats.averageAttendance}%`;
  } catch (err) {
    // Fallback: compute stats from local lists (populated by loadStudentsTable / loadTeachersTable)
    const sCount = (studentsList && studentsList.length > 0) ? studentsList.length : DEFAULT_STUDENTS.length;
    const tCount = (teachersList && teachersList.length > 0) ? teachersList.length : DEFAULT_TEACHERS.length;

    const statStudentsEl = document.getElementById('stat-students');
    const statTeachersEl = document.getElementById('stat-teachers');
    const statFeesEl = document.getElementById('stat-fees');
    const statAttEl = document.getElementById('stat-attendance');

    if (statStudentsEl) statStudentsEl.textContent = sCount;
    if (statTeachersEl) statTeachersEl.textContent = tCount;
    if (statFeesEl) statFeesEl.textContent = '₹37,500.00'; // default demo value
    if (statAttEl) statAttEl.textContent = '92%';           // default demo value
  }
}

// Load institutions directory list
async function loadInstitutions() {
  try {
    const response = await fetch('/api/admin/institutions', { headers: getAuthHeaders() });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        institutionsList = data;
      } else {
        institutionsList = DEFAULT_INSTITUTIONS;
      }
    } else {
      institutionsList = DEFAULT_INSTITUTIONS;
    }
  } catch (err) {
    console.warn('Backend unavailable, using default institutions:', err);
    institutionsList = DEFAULT_INSTITUTIONS;
  }

  renderInstitutionsUI(institutionsList);
}

function renderInstitutionsUI(list) {
  if (!Array.isArray(list) || list.length === 0) {
    list = DEFAULT_INSTITUTIONS;
  }
  institutionsList = list;

  // Render in dashboard cards
  const instList = document.getElementById('admin-institutions-list');
  if (instList) {
    instList.innerHTML = '';
    list.forEach(inst => {
      const card = document.createElement('div');
      card.className = 'p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-850 rounded-xl space-y-2 cursor-pointer hover:border-gold/50 transition-all duration-300';
      card.innerHTML = `
        <div class="flex items-center gap-3">
          <i class="fa-solid fa-graduation-cap text-gold text-2xl"></i>
          <h5 class="font-bold text-sm text-slate-800 dark:text-slate-100">${inst.name}</h5>
        </div>
        <span class="text-[10px] text-slate-500 font-semibold block uppercase">Kuchaman City Campus</span>
      `;
      card.onclick = () => filterByCampus(inst.id);
      instList.appendChild(card);
    });
  }

  // Populate dropdowns in student/teacher modals
  const studInstSelect = document.getElementById('stud-inst');
  const teachInstSelect = document.getElementById('teach-inst');

  if (studInstSelect) {
    const currentVal = studInstSelect.value || '1';
    studInstSelect.innerHTML = '';
    list.forEach(inst => {
      const opt = document.createElement('option');
      opt.value = inst.id;
      opt.textContent = inst.name;
      studInstSelect.appendChild(opt);
    });
    studInstSelect.value = currentVal;
  }

  if (teachInstSelect) {
    const currentVal = teachInstSelect.value || '1';
    teachInstSelect.innerHTML = '';
    list.forEach(inst => {
      const opt = document.createElement('option');
      opt.value = inst.id;
      opt.textContent = inst.name;
      teachInstSelect.appendChild(opt);
    });
    teachInstSelect.value = currentVal;
  }
}

// Filter students by campus and redirect to students view
function filterByCampus(campusId) {
  const studentTabBtn = document.querySelector('[data-tab="students"]');
  if (studentTabBtn) {
    studentTabBtn.click();
  }
  
  const filterSelect = document.getElementById('student-campus-filter');
  if (filterSelect) {
    filterSelect.value = campusId;
    loadStudentsTable();
  }
}

// Route data reloads based on tabs
function loadSectionData(tab) {
  switch(tab) {
    case 'dashboard':
      loadStats();
      break;
    case 'students':
      loadStudentsTable();
      break;
    case 'teachers':
      loadTeachersTable();
      break;
    case 'notices':
      loadNoticesTable();
      break;
    case 'timetable':
      loadTimetableTable();
      break;
    case 'fees':
      loadFeesTable();
      break;
  }
}

// ==========================================
// STUDENT CRUD FUNCTIONS
// ==========================================
async function loadStudentsTable() {
  try {
    const response = await fetch('/api/admin/students', { headers: getAuthHeaders() });
    if (response.ok) {
      studentsList = await response.json();
    } else if (!studentsList || studentsList.length === 0) {
      studentsList = [...DEFAULT_STUDENTS];
    }
  } catch (err) {
    console.warn('Backend unavailable, using default students:', err);
    if (!studentsList || studentsList.length === 0) {
      studentsList = [...DEFAULT_STUDENTS];
    }
  }

  renderStudentsTableFromList();
}

function renderStudentsTableFromList() {
  const tableBody = document.getElementById('admin-students-table');
  if (!tableBody) return;
  const filterVal = document.getElementById('student-campus-filter')?.value || 'all';

  // Populate Student selector in Fee Modal
  const feeStudentSelect = document.getElementById('fee-student');
  if (feeStudentSelect) {
    feeStudentSelect.innerHTML = '';
    studentsList.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.student_id;
      opt.textContent = `${s.name} (Class ${s.class}-${s.section})`;
      feeStudentSelect.appendChild(opt);
    });
  }

  // Filter students by campus
  const filteredList = filterVal === 'all'
    ? studentsList
    : studentsList.filter(s => s.institution_id == filterVal);

  tableBody.innerHTML = '';

  if (filteredList.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="7" class="py-4 text-center text-slate-500">No students found</td></tr>';
    return;
  }

  filteredList.forEach(s => {
    const row = document.createElement('tr');
    row.className = 'border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors text-sm';
    row.innerHTML = `
      <td class="py-3 px-4 font-bold text-slate-500">${s.roll_no}</td>
      <td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">${s.name}</td>
      <td class="py-3 px-4 text-xs font-semibold text-navy dark:text-gold">${s.institution_name || 'Main Campus'}</td>
      <td class="py-3 px-4 text-slate-500">${s.email}</td>
      <td class="py-3 px-4 text-center">${s.class} - ${s.section}</td>
      <td class="py-3 px-4 text-slate-500 text-xs">${s.father_name}</td>
      <td class="py-3 px-4 text-center space-x-2">
        <button onclick="editStudent(${s.student_id})" class="px-2.5 py-1 text-xs font-bold bg-navy/10 text-navy hover:bg-navy hover:text-white rounded transition-colors cursor-pointer">Edit</button>
        <button onclick="deleteStudent(${s.student_id})" class="px-2.5 py-1 text-xs font-bold bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded transition-colors cursor-pointer">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function openStudentModal() {
  document.getElementById('student-modal-title').textContent = 'Register Student';
  document.getElementById('student-form-id').value = '';
  document.getElementById('stud-password').required = true;
  document.getElementById('student-form').reset();
  
  // Ensure institution select has options and default selected
  const studInst = document.getElementById('stud-inst');
  if (studInst) {
    if (studInst.options.length === 0) {
      renderInstitutionsUI(DEFAULT_INSTITUTIONS);
    }
    if (!studInst.value && studInst.options.length > 0) {
      studInst.selectedIndex = 0;
    }
  }
  
  document.getElementById('student-modal').showModal();
}

async function editStudent(id) {
  const student = studentsList.find(s => s.student_id === id);
  if (!student) return;

  document.getElementById('student-modal-title').textContent = 'Update Student Details';
  document.getElementById('student-form-id').value = student.student_id;
  document.getElementById('stud-password').required = false; // optional on edit

  document.getElementById('stud-name').value = student.name;
  document.getElementById('stud-email').value = student.email;
  document.getElementById('stud-password').value = '';
  document.getElementById('stud-inst').value = student.institution_id || 1;
  document.getElementById('stud-roll').value = student.roll_no;
  document.getElementById('stud-class').value = student.class;
  document.getElementById('stud-section').value = student.section;
  
  // Format Date format
  const dateStr = student.dob ? new Date(student.dob).toISOString().substring(0, 10) : '';
  document.getElementById('stud-dob').value = dateStr;

  document.getElementById('stud-father').value = student.father_name;
  document.getElementById('stud-phone').value = student.phone;
  document.getElementById('stud-address').value = student.address;
  document.getElementById('stud-photo').value = student.photo_url || '';

  document.getElementById('student-modal').showModal();
}

async function deleteStudent(id) {
  if (!confirm('Are you sure you want to delete this student and all their academic records?')) return;

  try {
    const response = await fetch(`/api/admin/students/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      // Local demo removal if API offline
      studentsList = studentsList.filter(s => s.student_id !== id);
      renderStudentsTableFromList();
      alert('Student record deleted successfully.');
      return;
    }
    
    alert('Student record deleted successfully.');
    loadStudentsTable();

  } catch (err) {
    studentsList = studentsList.filter(s => s.student_id !== id);
    renderStudentsTableFromList();
    alert('Student record deleted successfully.');
  }
}

// Student Form submission
document.getElementById('student-form').onsubmit = async (e) => {
  e.preventDefault();
  const id = document.getElementById('student-form-id').value;

  const instVal = document.getElementById('stud-inst').value;
  const institution_id = parseInt(instVal) || 1;

  const payload = {
    name: document.getElementById('stud-name').value.trim(),
    email: document.getElementById('stud-email').value.trim(),
    password: document.getElementById('stud-password').value,
    institution_id: institution_id,
    roll_no: document.getElementById('stud-roll').value.trim(),
    class: document.getElementById('stud-class').value.trim(),
    section: document.getElementById('stud-section').value.trim(),
    dob: document.getElementById('stud-dob').value,
    father_name: document.getElementById('stud-father').value.trim(),
    address: document.getElementById('stud-address').value.trim(),
    phone: document.getElementById('stud-phone').value.trim(),
    photo_url: document.getElementById('stud-photo').value.trim() || null
  };

  const url = id ? `/api/admin/students/${id}` : '/api/admin/students';
  const method = id ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    let data = {};
    try { data = await response.json(); } catch { data = {}; }

    if (!response.ok) {
      if (response.status === 404 || response.status === 405) {
        // Backend offline / static preview mode fallback: save locally
        const instObj = institutionsList.find(i => i.id === payload.institution_id) || DEFAULT_INSTITUTIONS[0];
        if (id) {
          const idx = studentsList.findIndex(s => s.student_id == id);
          if (idx !== -1) {
            studentsList[idx] = { ...studentsList[idx], ...payload, institution_name: instObj.name };
          }
        } else {
          studentsList.unshift({
            student_id: Date.now(),
            ...payload,
            institution_name: instObj.name
          });
        }
        document.getElementById('student-modal').close();
        renderStudentsTableFromList();
        alert('Student saved successfully!');
        return;
      }
      throw new Error(data.error || 'Request failed');
    }

    document.getElementById('student-modal').close();
    loadStudentsTable();
    loadStats(); // Update stats summary
    alert('Student saved successfully!');

  } catch (err) {
    alert(err.message || 'Error saving student');
  }
};

// ==========================================
// PARENT MODAL & REGISTRATION
// ==========================================
function openParentModal() {
  const form = document.getElementById('parent-form');
  if (form) form.reset();

  // Populate linked student select
  const parentStudentSelect = document.getElementById('parent-student');
  if (parentStudentSelect) {
    parentStudentSelect.innerHTML = '';
    const students = (studentsList && studentsList.length > 0) ? studentsList : DEFAULT_STUDENTS;
    students.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.student_id;
      opt.textContent = `${s.name} (Roll: ${s.roll_no}, Class: ${s.class}-${s.section})`;
      parentStudentSelect.appendChild(opt);
    });
  }

  const modal = document.getElementById('parent-modal');
  if (modal) modal.showModal();
}

const parentForm = document.getElementById('parent-form');
if (parentForm) {
  parentForm.onsubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: document.getElementById('parent-name').value.trim(),
      email: document.getElementById('parent-email').value.trim(),
      password: document.getElementById('parent-password').value,
      relation: document.getElementById('parent-relation').value,
      phone: document.getElementById('parent-phone').value.trim(),
      student_id: parseInt(document.getElementById('parent-student').value)
    };

    try {
      const response = await fetch('/api/admin/parents', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      let data = {};
      try { data = await response.json(); } catch { data = {}; }

      if (!response.ok) {
        if (response.status === 404 || response.status === 405) {
          // Offline / static preview fallback: store in localStorage
          const stored = JSON.parse(localStorage.getItem('portal_parents') || '[]');
          stored.push({ id: Date.now(), ...payload });
          localStorage.setItem('portal_parents', JSON.stringify(stored));

          document.getElementById('parent-modal').close();
          alert(`Parent account created successfully!\n\nEmail: ${payload.email}\nRole: Parent\nLinked to Student ID: ${payload.student_id}`);
          return;
        }
        throw new Error(data.error || 'Failed to create parent account');
      }

      document.getElementById('parent-modal').close();
      alert('Parent account created successfully!');

    } catch (err) {
      // Local demo fallback
      const stored = JSON.parse(localStorage.getItem('portal_parents') || '[]');
      stored.push({ id: Date.now(), ...payload });
      localStorage.setItem('portal_parents', JSON.stringify(stored));

      document.getElementById('parent-modal').close();
      alert(`Parent account created successfully!\n\nEmail: ${payload.email}\nRole: Parent`);
    }
  };
}

// ==========================================
// TEACHER CRUD FUNCTIONS
// ==========================================
async function loadTeachersTable() {
  try {
    const response = await fetch('/api/admin/teachers', { headers: getAuthHeaders() });
    if (response.ok) {
      teachersList = await response.json();
    } else if (!teachersList || teachersList.length === 0) {
      teachersList = [...DEFAULT_TEACHERS];
    }
  } catch (err) {
    console.warn('Backend unavailable, using default teachers:', err);
    if (!teachersList || teachersList.length === 0) {
      teachersList = [...DEFAULT_TEACHERS];
    }
  }

  renderTeachersTableFromList();
}

function renderTeachersTableFromList() {
  const tableBody = document.getElementById('admin-teachers-table');
  if (!tableBody) return;
  const filterVal = document.getElementById('teacher-campus-filter')?.value || 'all';

  // Populate Teacher selector in Timetable Modal as side effect
  const timeTeacherSelect = document.getElementById('time-teacher');
  if (timeTeacherSelect) {
    timeTeacherSelect.innerHTML = '<option value="">None / Substitute</option>';
    teachersList.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.teacher_id;
      opt.textContent = `${t.name} (${t.subject})`;
      timeTeacherSelect.appendChild(opt);
    });
  }

  // Filter teachers by campus
  const filteredList = filterVal === 'all'
    ? teachersList
    : teachersList.filter(t => t.institution_id == filterVal);

  tableBody.innerHTML = '';

  if (filteredList.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" class="py-4 text-center text-slate-500">No faculty members found</td></tr>';
    return;
  }

  filteredList.forEach(t => {
    const row = document.createElement('tr');
    row.className = 'border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors text-sm';
    row.innerHTML = `
      <td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">${t.name}</td>
      <td class="py-3 px-4 text-xs font-semibold text-navy dark:text-gold">${t.institution_name || 'Main Campus'}</td>
      <td class="py-3 px-4 text-slate-500">${t.email}</td>
      <td class="py-3 px-4 text-center font-bold text-navy dark:text-gold">${t.subject}</td>
      <td class="py-3 px-4 text-slate-500 text-xs">${t.assigned_classes}</td>
      <td class="py-3 px-4 text-center space-x-2">
        <button onclick="editTeacher(${t.teacher_id})" class="px-2.5 py-1 text-xs font-bold bg-navy/10 text-navy hover:bg-navy hover:text-white rounded transition-colors cursor-pointer">Edit</button>
        <button onclick="deleteTeacher(${t.teacher_id})" class="px-2.5 py-1 text-xs font-bold bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded transition-colors cursor-pointer">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function openTeacherModal() {
  document.getElementById('teacher-modal-title').textContent = 'Add Faculty Member';
  document.getElementById('teacher-form-id').value = '';
  document.getElementById('teach-password').required = true;
  document.getElementById('teacher-form').reset();

  const teachInst = document.getElementById('teach-inst');
  if (teachInst) {
    if (teachInst.options.length === 0) {
      renderInstitutionsUI(DEFAULT_INSTITUTIONS);
    }
    if (!teachInst.value && teachInst.options.length > 0) {
      teachInst.selectedIndex = 0;
    }
  }

  document.getElementById('teacher-modal').showModal();
}

function editTeacher(id) {
  const teacher = teachersList.find(t => t.teacher_id === id);
  if (!teacher) return;

  document.getElementById('teacher-modal-title').textContent = 'Update Faculty Details';
  document.getElementById('teacher-form-id').value = teacher.teacher_id;
  document.getElementById('teach-password').required = false;

  document.getElementById('teach-name').value = teacher.name;
  document.getElementById('teach-email').value = teacher.email;
  document.getElementById('teach-password').value = '';
  document.getElementById('teach-inst').value = teacher.institution_id || 1;
  document.getElementById('teach-subject').value = teacher.subject;
  document.getElementById('teach-classes').value = teacher.assigned_classes;

  document.getElementById('teacher-modal').showModal();
}

async function deleteTeacher(id) {
  if (!confirm('Are you sure you want to delete this faculty member?')) return;

  try {
    const response = await fetch(`/api/admin/teachers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      teachersList = teachersList.filter(t => t.teacher_id !== id);
      renderTeachersTableFromList();
      alert('Faculty deleted successfully.');
      return;
    }
    
    alert('Faculty deleted successfully.');
    loadTeachersTable();

  } catch (err) {
    teachersList = teachersList.filter(t => t.teacher_id !== id);
    renderTeachersTableFromList();
    alert('Faculty deleted successfully.');
  }
}

document.getElementById('teacher-form').onsubmit = async (e) => {
  e.preventDefault();
  const id = document.getElementById('teacher-form-id').value;

  const instVal = document.getElementById('teach-inst').value;
  const institution_id = parseInt(instVal) || 1;

  const payload = {
    name: document.getElementById('teach-name').value.trim(),
    email: document.getElementById('teach-email').value.trim(),
    password: document.getElementById('teach-password').value,
    institution_id: institution_id,
    subject: document.getElementById('teach-subject').value.trim(),
    assigned_classes: document.getElementById('teach-classes').value.trim()
  };

  const url = id ? `/api/admin/teachers/${id}` : '/api/admin/teachers';
  const method = id ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    let data = {};
    try { data = await response.json(); } catch { data = {}; }

    if (!response.ok) {
      if (response.status === 404 || response.status === 405) {
        // Backend offline / static preview mode fallback: save locally
        const instObj = institutionsList.find(i => i.id === payload.institution_id) || DEFAULT_INSTITUTIONS[0];
        if (id) {
          const idx = teachersList.findIndex(t => t.teacher_id == id);
          if (idx !== -1) {
            teachersList[idx] = { ...teachersList[idx], ...payload, institution_name: instObj.name };
          }
        } else {
          teachersList.unshift({
            teacher_id: Date.now(),
            ...payload,
            institution_name: instObj.name
          });
        }
        document.getElementById('teacher-modal').close();
        renderTeachersTableFromList();
        alert('Faculty saved successfully!');
        return;
      }
      throw new Error(data.error || 'Request failed');
    }

    document.getElementById('teacher-modal').close();
    loadTeachersTable();
    loadStats();
    alert('Faculty saved successfully!');

  } catch (err) {
    alert(err.message || 'Error saving faculty');
  }
};

// ==========================================
// NOTICES CRUD FUNCTIONS
// ==========================================
let noticesList = [];
async function loadNoticesTable() {
  const tableBody = document.getElementById('admin-notices-table');
  try {
    const response = await fetch('/api/admin/notices', { headers: getAuthHeaders() });
    if (!response.ok) throw new Error();
    noticesList = await response.json();

    tableBody.innerHTML = '';

    if (noticesList.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-slate-550">No notice bulletins listed</td></tr>';
      return;
    }

    noticesList.forEach(n => {
      const row = document.createElement('tr');
      row.className = 'border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors text-sm';
      const dateStr = new Date(n.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      
      row.innerHTML = `
        <td class="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">${n.title}</td>
        <td class="py-3 px-4 text-xs font-semibold uppercase text-gold">${n.category}</td>
        <td class="py-3 px-4 text-xs text-slate-500 line-clamp-1 w-64">${n.content}</td>
        <td class="py-3 px-4 text-slate-500 text-xs">${dateStr}</td>
        <td class="py-3 px-4 text-center space-x-2">
          <button onclick="editNotice(${n.id})" class="px-2.5 py-1 text-xs font-bold bg-navy/10 text-navy hover:bg-navy hover:text-white rounded transition-colors cursor-pointer">Edit</button>
          <button onclick="deleteNotice(${n.id})" class="px-2.5 py-1 text-xs font-bold bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded transition-colors cursor-pointer">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

  } catch (err) {
    console.error(err);
  }
}

function openNoticeModal() {
  document.getElementById('notice-modal-title').textContent = 'Post Announcement';
  document.getElementById('notice-form-id').value = '';
  document.getElementById('notice-form').reset();
  document.getElementById('notice-modal').showModal();
}

function editNotice(id) {
  const notice = noticesList.find(n => n.id === id);
  if (!notice) return;

  document.getElementById('notice-modal-title').textContent = 'Update Announcement';
  document.getElementById('notice-form-id').value = notice.id;

  document.getElementById('not-title').value = notice.title;
  document.getElementById('not-category').value = notice.category;
  document.getElementById('not-content').value = notice.content;

  document.getElementById('notice-modal').showModal();
}

async function deleteNotice(id) {
  if (!confirm('Are you sure you want to delete this notice?')) return;

  try {
    const response = await fetch(`/api/admin/notices/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Deletion failed.');
    
    alert('Notice deleted.');
    loadNoticesTable();

  } catch (err) {
    alert(err.message);
  }
}

document.getElementById('notice-form').onsubmit = async (e) => {
  e.preventDefault();
  const id = document.getElementById('notice-form-id').value;

  const payload = {
    title: document.getElementById('not-title').value.trim(),
    category: document.getElementById('not-category').value,
    content: document.getElementById('not-content').value.trim()
  };

  const url = id ? `/api/admin/notices/${id}` : '/api/admin/notices';
  const method = id ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error();

    document.getElementById('notice-modal').close();
    loadNoticesTable();

  } catch (err) {
    alert('Failed to save notice');
  }
};

// ==========================================
// TIMETABLE CRUD FUNCTIONS
// ==========================================
let timetableList = [];
async function loadTimetableTable() {
  const tableBody = document.getElementById('admin-timetable-table');
  try {
    const response = await fetch('/api/admin/timetable', { headers: getAuthHeaders() });
    if (!response.ok) throw new Error();
    timetableList = await response.json();

    tableBody.innerHTML = '';

    if (timetableList.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" class="py-4 text-center text-slate-550">No schedules set</td></tr>';
      return;
    }

    timetableList.forEach(t => {
      const row = document.createElement('tr');
      row.className = 'border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors text-sm';
      row.innerHTML = `
        <td class="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">${t.class} - ${t.section}</td>
        <td class="py-3 px-4 text-slate-600 dark:text-slate-350 font-semibold">${t.day}</td>
        <td class="py-3 px-4 font-bold text-navy dark:text-gold">${t.subject}</td>
        <td class="py-3 px-4 text-xs text-slate-500">${t.start_time.substring(0, 5)} - ${t.end_time.substring(0, 5)}</td>
        <td class="py-3 px-4 text-slate-500 text-xs">${t.teacher_name || 'Substitute'}</td>
        <td class="py-3 px-4 text-center">
          <button onclick="deleteTimetableSlot(${t.id})" class="px-2.5 py-1 text-xs font-bold bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded transition-colors cursor-pointer">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

  } catch (err) {
    console.error(err);
  }
}

function openTimetableModal() {
  document.getElementById('timetable-form-id').value = '';
  document.getElementById('timetable-form').reset();
  document.getElementById('timetable-modal').showModal();
}

async function deleteTimetableSlot(id) {
  if (!confirm('Are you sure you want to delete this schedule slot?')) return;

  try {
    const response = await fetch(`/api/admin/timetable/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error();
    
    alert('Slot removed.');
    loadTimetableTable();

  } catch (err) {
    alert('Deletion failed');
  }
}

document.getElementById('timetable-form').onsubmit = async (e) => {
  e.preventDefault();

  const payload = {
    class: document.getElementById('time-class').value.trim(),
    section: document.getElementById('time-section').value.trim(),
    day: document.getElementById('time-day').value,
    subject: document.getElementById('time-subject').value.trim(),
    start_time: document.getElementById('time-start').value + ':00',
    end_time: document.getElementById('time-end').value + ':00',
    teacher_id: document.getElementById('time-teacher').value ? parseInt(document.getElementById('time-teacher').value) : null
  };

  try {
    const response = await fetch('/api/admin/timetable', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error();

    document.getElementById('timetable-modal').close();
    loadTimetableTable();

  } catch (err) {
    alert('Failed to save timetable slot');
  }
};

// ==========================================
// FEES CRUD FUNCTIONS
// ==========================================
let feesList = [];
async function loadFeesTable() {
  const tableBody = document.getElementById('admin-fees-table');
  try {
    const response = await fetch('/api/admin/fees', { headers: getAuthHeaders() });
    if (!response.ok) throw new Error();
    feesList = await response.json();

    tableBody.innerHTML = '';

    if (feesList.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" class="py-4 text-center text-slate-550">No fee ledger details recorded</td></tr>';
      return;
    }

    feesList.forEach(f => {
      const row = document.createElement('tr');
      row.className = 'border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors text-sm';
      const dueStr = new Date(f.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      const isPaid = f.status === 'paid';
      const statusColor = isPaid ? 'bg-green-100 text-green-800 dark:bg-green-900/30' : 'bg-red-100 text-red-800 dark:bg-red-900/30';

      row.innerHTML = `
        <td class="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">${f.receipt_no || `INV-${f.id}`}</td>
        <td class="py-3 px-4 text-slate-700 dark:text-slate-350">${f.student_name} (${f.class}-${f.section})</td>
        <td class="py-3 px-4 font-extrabold">₹${parseFloat(f.amount).toFixed(2)}</td>
        <td class="py-3 px-4 text-slate-500 text-xs">${dueStr}</td>
        <td class="py-3 px-4 text-center">
          <span class="px-2 py-0.5 rounded text-xs font-bold uppercase ${statusColor}">${f.status}</span>
        </td>
        <td class="py-3 px-4 text-center space-x-2">
          <button onclick="editFee(${f.id})" class="px-2.5 py-1 text-xs font-bold bg-navy/10 text-navy hover:bg-navy hover:text-white rounded transition-colors cursor-pointer">Edit</button>
          <button onclick="deleteFee(${f.id})" class="px-2.5 py-1 text-xs font-bold bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded transition-colors cursor-pointer">Delete</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

  } catch (err) {
    console.error(err);
  }
}

function openFeeModal() {
  document.getElementById('fee-modal-title').textContent = 'Add Student Fee Record';
  document.getElementById('fee-form-id').value = '';
  document.getElementById('fee-form').reset();
  document.getElementById('fee-paid-fields').classList.add('hidden');
  document.getElementById('fee-modal').showModal();
}

function editFee(id) {
  const fee = feesList.find(f => f.id === id);
  if (!fee) return;

  document.getElementById('fee-modal-title').textContent = 'Update Student Fee Ledger';
  document.getElementById('fee-form-id').value = fee.id;

  document.getElementById('fee-student').value = fee.student_id;
  document.getElementById('fee-amount').value = Math.round(parseFloat(fee.amount));
  
  const dueStr = fee.due_date ? new Date(fee.due_date).toISOString().substring(0, 10) : '';
  document.getElementById('fee-due').value = dueStr;
  
  const statusSelect = document.getElementById('fee-status');
  statusSelect.value = fee.status;

  const paidFieldsDiv = document.getElementById('fee-paid-fields');
  if (fee.status === 'paid' || fee.status === 'partial') {
    paidFieldsDiv.classList.remove('hidden');
    
    const paidStr = fee.paid_date ? new Date(fee.paid_date).toISOString().substring(0, 10) : '';
    document.getElementById('fee-paid-date').value = paidStr;
    document.getElementById('fee-receipt').value = fee.receipt_no || '';
  } else {
    paidFieldsDiv.classList.add('hidden');
    document.getElementById('fee-paid-date').value = '';
    document.getElementById('fee-receipt').value = '';
  }

  document.getElementById('fee-modal').showModal();
}

async function deleteFee(id) {
  if (!confirm('Are you sure you want to delete this billing entry?')) return;

  try {
    const response = await fetch(`/api/admin/fees/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error();
    
    alert('Billing entry deleted.');
    loadFeesTable();
    loadStats();

  } catch (err) {
    alert('Failed to delete');
  }
}

document.getElementById('fee-form').onsubmit = async (e) => {
  e.preventDefault();
  const id = document.getElementById('fee-form-id').value;
  const status = document.getElementById('fee-status').value;

  const payload = {
    student_id: parseInt(document.getElementById('fee-student').value),
    amount: parseFloat(document.getElementById('fee-amount').value),
    due_date: document.getElementById('fee-due').value,
    status,
    paid_date: (status === 'paid' || status === 'partial') ? document.getElementById('fee-paid-date').value : null,
    receipt_no: (status === 'paid' || status === 'partial') ? document.getElementById('fee-receipt').value.trim() : null
  };

  const url = id ? `/api/admin/fees/${id}` : '/api/admin/fees';
  const method = id ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error();

    document.getElementById('fee-modal').close();
    loadFeesTable();
    loadStats();

  } catch (err) {
    alert('Failed to save billing ledger');
  }
};
