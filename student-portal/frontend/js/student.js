// Student Dashboard Operations

const session = protectPage('student');
if (!session) {
  // Redirecting...
}

const { token, user } = session || {};
let charts = {}; // references to chart.js instances

document.addEventListener('DOMContentLoaded', () => {
  if (!session) return;

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
  try {
    const headers = getAuthHeaders();

    // 1. Profile Details
    const profileRes = await fetch('/api/students/profile', { headers });
    const profile = await profileRes.json();
    if (profileRes.ok) {
      renderProfile(profile);
    }

    // 2. Attendance Details
    const attendanceRes = await fetch('/api/students/attendance', { headers });
    const attendance = await attendanceRes.json();
    if (attendanceRes.ok) {
      renderAttendance(attendance);
    }

    // 3. Results / Marks
    const resultsRes = await fetch('/api/students/results', { headers });
    const results = await resultsRes.json();
    if (resultsRes.ok) {
      renderResults(results);
    }

    // 4. Fees Status
    const feesRes = await fetch('/api/students/fees', { headers });
    const fees = await feesRes.json();
    if (feesRes.ok) {
      renderFees(fees);
    }

    // 5. Timetable Schedule
    const timetableRes = await fetch('/api/students/timetable', { headers });
    const timetable = await timetableRes.json();
    if (timetableRes.ok) {
      renderTimetable(timetable, profile.class, profile.section);
    }

    // 6. Notices / Announcements
    const noticesRes = await fetch('/api/notices', { headers });
    const notices = await noticesRes.json();
    if (noticesRes.ok) {
      renderNotices(notices);
    }

    // 7. Homework / Assignments
    const assignmentsRes = await fetch('/api/students/assignments', { headers });
    const assignments = await assignmentsRes.json();
    if (assignmentsRes.ok) {
      renderAssignments(assignments);
    }

    // 8. Library Logs
    const libraryRes = await fetch('/api/students/library', { headers });
    const library = await libraryRes.json();
    if (libraryRes.ok) {
      renderLibrary(library);
    }

    // 9. Transport Logs
    const transportRes = await fetch('/api/students/transport', { headers });
    const transport = await transportRes.json();
    if (transportRes.ok) {
      renderTransport(transport);
    }

    // 10. Hostel Logs
    const hostelRes = await fetch('/api/students/hostel', { headers });
    const hostel = await hostelRes.json();
    if (hostelRes.ok) {
      renderHostel(hostel);
    }

  } catch (err) {
    console.error('Error loading student details:', err);
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
  document.getElementById('fee-outstanding-amt').textContent = `${data.currency}${data.outstanding.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
  document.getElementById('fee-paid-amt').textContent = `${data.currency}${data.paidTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}`;

  const tableBody = document.getElementById('fees-table-body');
  tableBody.innerHTML = '';

  if (data.invoices.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-slate-500">No transactions recorded</td></tr>';
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

    row.innerHTML = `
      <td class="py-3 font-semibold text-slate-800 dark:text-slate-200">${inv.receipt_no || `INV-${inv.id}`}</td>
      <td class="py-3 text-slate-600 dark:text-slate-300">Term Tuition / Board Fees</td>
      <td class="py-3 font-bold">${data.currency}${parseFloat(inv.amount).toFixed(2)}</td>
      <td class="py-3 text-slate-500 text-xs">${dueStr}</td>
      <td class="py-3">
        <span class="px-2 py-0.5 rounded text-xs font-bold uppercase ${badgeColor}">${inv.status}</span>
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
        <span class="text-slate-450 dark:text-slate-400 block text-xs">Pickup Stop Stop</span>
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
