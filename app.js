document.addEventListener('DOMContentLoaded', () => {
  // State variables
  let currentStudent = StudentPortalData.studentProfile;
  let activeTab = 'dashboard';
  let activeAssignmentId = null;
  let selectedFile = null;

  // Cache DOM elements
  const loginScreen = document.getElementById('login-screen');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const appContainer = document.getElementById('app-container');
  
  const studentIdInput = document.getElementById('student-id');
  const passwordInput = document.getElementById('password');
  
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const sidebar = document.getElementById('sidebar');
  const mobileNavToggle = document.getElementById('mobile-toggle');
  
  const navLinks = document.querySelectorAll('.nav-links a');
  const contentSections = document.querySelectorAll('.content-section');
  const sectionTitle = document.getElementById('section-title');
  const sectionSubtitle = document.getElementById('section-subtitle');
  
  // Modals
  const assignmentDialog = document.getElementById('assignment-dialog');
  const paymentDialog = document.getElementById('payment-dialog');
  const announcementDialog = document.getElementById('announcement-dialog');
  
  // --- Authentication ---
  function checkAuth() {
    const isLoggedIn = localStorage.getItem('portal_logged_in') === 'true';
    if (isLoggedIn) {
      loginScreen.classList.add('hidden');
      appContainer.style.display = 'grid';
      initApp();
    } else {
      loginScreen.classList.remove('hidden');
      appContainer.style.display = 'none';
    }
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const studentId = studentIdInput.value.trim().toUpperCase();
    
    // Check credentials against mock data
    if (studentId === StudentPortalData.studentProfile.id) {
      localStorage.setItem('portal_logged_in', 'true');
      loginError.style.display = 'none';
      loginScreen.classList.add('hidden');
      appContainer.style.display = 'grid';
      initApp();
    } else {
      loginError.textContent = "Invalid Student ID. Use STU2026001";
      loginError.style.display = 'block';
    }
  });

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('portal_logged_in');
      checkAuth();
    });
  }

  // --- SPA Routing / Navigation ---
  function initNavigation() {
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.getAttribute('data-tab');
        switchTab(tab);
        
        // Close mobile sidebar if open
        if (sidebar.classList.contains('open')) {
          toggleMobileSidebar(false);
        }
      });
    });

    // Handle hash routing if page refreshed
    const hash = window.location.hash.substring(1);
    if (hash && ['dashboard', 'academics', 'profile', 'assignments', 'billing'].includes(hash)) {
      switchTab(hash);
    } else {
      switchTab('dashboard');
    }
  }

  function switchTab(tabName) {
    activeTab = tabName;
    window.location.hash = tabName;
    
    // Toggle active link
    navLinks.forEach(link => {
      if (link.getAttribute('data-tab') === tabName) {
        link.parentElement.classList.add('active');
      } else {
        link.parentElement.classList.remove('active');
      }
    });

    // Toggle content sections
    contentSections.forEach(section => {
      if (section.id === `${tabName}-section`) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });

    // Update Header Titles
    const titleMap = {
      dashboard: { title: "Dashboard", sub: `Welcome back, ${currentStudent.name}` },
      academics: { title: "Academic Records", sub: "View your marks, grades, and attendance metrics" },
      profile: { title: "Student Profile", sub: "Manage your personal and emergency contact information" },
      assignments: { title: "Assignments", sub: "Track homework tasks and submit assignments online" },
      billing: { title: "Fees & Invoices", sub: "View billing history and complete outstanding payments" }
    };

    if (titleMap[tabName]) {
      sectionTitle.textContent = titleMap[tabName].title;
      sectionSubtitle.textContent = titleMap[tabName].sub;
    }

    // Trigger rendering details for specific tabs
    renderSectionData(tabName);
  }

  // Mobile sidebar controls
  function toggleMobileSidebar(open) {
    if (open) {
      sidebar.classList.add('open');
      sidebarOverlay.classList.add('open');
    } else {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('open');
    }
  }

  if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', () => toggleMobileSidebar(true));
  }
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => toggleMobileSidebar(false));
  }

  // --- Dynamic Section Rendering ---
  function initApp() {
    initNavigation();
    updateDateDisplay();
    
    // Render top header profile badge
    const headerAvatar = document.querySelector('.user-badge img');
    const headerName = document.querySelector('.user-badge span');
    if (headerAvatar) headerAvatar.src = currentStudent.avatar;
    if (headerName) headerName.textContent = currentStudent.name.split(' ')[0]; // First name only
    
    // Load dashboard by default
    renderSectionData('dashboard');
  }

  function updateDateDisplay() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('en-US', options);
    const dateEl = document.getElementById('current-date');
    if (dateEl) dateEl.textContent = dateStr;
  }

  function renderSectionData(tabName) {
    switch (tabName) {
      case 'dashboard':
        renderDashboard();
        break;
      case 'academics':
        renderAcademics();
        break;
      case 'profile':
        renderProfile();
        break;
      case 'assignments':
        renderAssignments();
        break;
      case 'billing':
        renderBilling();
        break;
    }
  }

  // --- 1. Dashboard View ---
  function renderDashboard() {
    // Stat Counters
    const pendingAsmCount = StudentPortalData.assignments.filter(a => a.status === 'Pending').length;
    const overdueAsmCount = StudentPortalData.assignments.filter(a => a.status === 'Overdue').length;
    
    document.getElementById('dash-gpa').textContent = StudentPortalData.grades.gpa;
    document.getElementById('dash-attendance').textContent = `${StudentPortalData.attendance.overall}%`;
    document.getElementById('dash-assignments').textContent = pendingAsmCount;
    
    const unpaidAmt = StudentPortalData.billing.outstanding;
    const currency = StudentPortalData.billing.currency;
    document.getElementById('dash-fees').textContent = unpaidAmt > 0 ? `${currency}${unpaidAmt.toLocaleString()}` : 'No Dues';

    // Banner Details
    document.getElementById('banner-student-name').textContent = currentStudent.name;
    document.getElementById('banner-student-grade').textContent = currentStudent.grade;
    document.getElementById('banner-id').textContent = currentStudent.id;
    document.getElementById('banner-roll').textContent = currentStudent.rollNo;

    // Daily Timetable
    renderDailyTimetable();
    
    // Announcements
    renderAnnouncementsList();

    // Render Mini GPA Trend Chart (SVG)
    generateGPAChart();
  }

  function renderDailyTimetable() {
    const timetableContainer = document.getElementById('dash-timetable');
    if (!timetableContainer) return;
    
    // Get current day of the week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[new Date().getDay()];
    
    // Fallback to Monday if weekend
    const activeDay = (currentDay === 'Sunday' || currentDay === 'Saturday') ? 'Monday' : currentDay;
    
    document.getElementById('timetable-day-title').textContent = `${activeDay}'s Schedule`;
    
    const slots = StudentPortalData.timetable[activeDay] || [];
    
    if (slots.length === 0) {
      timetableContainer.innerHTML = '<p style="color: var(--text-muted); font-size:14px; text-align:center; padding: 20px;">No classes scheduled for today.</p>';
      return;
    }

    // Determine current hour to mock highlight current class
    const curHour = new Date().getHours();
    
    let html = '<div class="timetable-list">';
    slots.forEach((slot, index) => {
      // Mock class active states based on array index
      // Index 1 (Physics 10-11am) is highlighted active for demo purposes if testing midday, 
      // or we can base it on standard time
      const isActive = index === 1; // Default highlight the second period as active
      
      html += `
        <div class="timetable-item ${isActive ? 'active' : ''}">
          <div class="timetable-bullet"></div>
          <div class="timetable-time">${slot.time}</div>
          <div class="timetable-content">
            <h4>${slot.subject}</h4>
            <p>${slot.teacher} • ${slot.room}</p>
          </div>
        </div>
      `;
    });
    html += '</div>';
    timetableContainer.innerHTML = html;
  }

  function renderAnnouncementsList() {
    const announcementsContainer = document.getElementById('dash-announcements');
    if (!announcementsContainer) return;
    
    const notices = StudentPortalData.announcements;
    let html = '';
    
    notices.forEach(notice => {
      const categoryClass = notice.category.toLowerCase();
      html += `
        <div class="announcement-item" data-id="${notice.id}">
          <div class="announcement-header">
            <span class="announcement-badge ${categoryClass}">${notice.category}</span>
            <span class="announcement-date">${notice.date}</span>
          </div>
          <h4>${notice.title}</h4>
          <p>${notice.summary}</p>
        </div>
      `;
    });
    
    announcementsContainer.innerHTML = html;

    // Attach click events
    announcementsContainer.querySelectorAll('.announcement-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        openAnnouncementModal(id);
      });
    });
  }

  function openAnnouncementModal(id) {
    const notice = StudentPortalData.announcements.find(a => a.id === id);
    if (!notice) return;
    
    const body = announcementDialog.querySelector('.modal-body');
    const title = announcementDialog.querySelector('#announcement-title');
    
    title.textContent = notice.title;
    body.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:12px; margin-bottom:16px;">
        <span class="announcement-badge ${notice.category.toLowerCase()}" style="padding: 4px 12px; border-radius:20px; font-weight:600; font-size:11px; text-transform:uppercase;">${notice.category}</span>
        <span style="font-size:13px; color:var(--text-muted);">${notice.date}</span>
      </div>
      <p style="font-size:14px; line-height:1.6; white-space:pre-line; color:var(--text-main);">${notice.content}</p>
    `;
    
    announcementDialog.showModal();
  }

  // --- Dynamic SVG Line Chart ---
  function generateGPAChart() {
    const svg = document.getElementById('gpa-chart');
    if (!svg) return;
    
    // Clean previous children
    svg.innerHTML = '';
    
    // Add gradient defs
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#6366f1" stop-opacity="0.25"></stop>
        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.00"></stop>
      </linearGradient>
    `;
    svg.appendChild(defs);

    const data = [
      { term: "Term 1 Baseline", gpa: 3.50 },
      { term: "Term 1 Finals", gpa: 3.76 },
      { term: "Term 2 Baseline", gpa: 3.65 },
      { term: "Term 2 Finals", gpa: 3.88 }
    ];
    
    const width = svg.clientWidth || 400;
    const height = 200;
    
    const minG = 3.0;
    const maxG = 4.0;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;
    
    const graphWidth = width - paddingLeft - paddingRight;
    const graphHeight = height - paddingTop - paddingBottom;
    
    // Compute X and Y coords
    const points = data.map((d, i) => {
      const x = paddingLeft + (i / (data.length - 1)) * graphWidth;
      const y = paddingTop + graphHeight - ((d.gpa - minG) / (maxG - minG)) * graphHeight;
      return { x, y, term: d.term, val: d.gpa };
    });
    
    // Draw grid lines
    const gridY = [3.0, 3.25, 3.5, 3.75, 4.0];
    gridY.forEach(g => {
      const y = paddingTop + graphHeight - ((g - minG) / (maxG - minG)) * graphHeight;
      
      // Horizontal grid line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', paddingLeft);
      line.setAttribute('y1', y);
      line.setAttribute('x2', width - paddingRight);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', 'rgba(255, 255, 255, 0.04)');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);
      
      // Y-axis labels
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', paddingLeft - 10);
      label.setAttribute('y', y + 4);
      label.setAttribute('fill', 'var(--text-muted)');
      label.setAttribute('font-size', '10');
      label.setAttribute('text-anchor', 'end');
      label.textContent = g.toFixed(2);
      svg.appendChild(label);
    });
    
    // Create line path
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathD);
    path.setAttribute('stroke', 'url(#logoGrad)');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);
    
    // Create filled gradient area underneath
    const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + graphHeight} L ${points[0].x} ${paddingTop + graphHeight} Z`;
    const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    area.setAttribute('d', areaD);
    area.setAttribute('fill', 'url(#chartGrad)');
    svg.appendChild(area);
    
    // Draw dots & interactive labels
    points.forEach((p) => {
      // Circle dot
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', p.x);
      circle.setAttribute('cy', p.y);
      circle.setAttribute('r', '5');
      circle.setAttribute('fill', '#6366f1');
      circle.setAttribute('stroke', '#090d16');
      circle.setAttribute('stroke-width', '2');
      svg.appendChild(circle);
      
      // GPA value text above circle
      const valText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valText.setAttribute('x', p.x);
      valText.setAttribute('y', p.y - 12);
      valText.setAttribute('fill', 'var(--text-main)');
      valText.setAttribute('font-size', '11');
      valText.setAttribute('font-weight', '600');
      valText.setAttribute('text-anchor', 'middle');
      valText.textContent = p.val.toFixed(2);
      svg.appendChild(valText);
      
      // X-axis label
      const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      xLabel.setAttribute('x', p.x);
      xLabel.setAttribute('y', paddingTop + graphHeight + 20);
      xLabel.setAttribute('fill', 'var(--text-muted)');
      xLabel.setAttribute('font-size', '9');
      xLabel.setAttribute('text-anchor', 'middle');
      xLabel.textContent = p.term;
      svg.appendChild(xLabel);
    });
  }

  // --- 2. Academics View ---
  function renderAcademics() {
    // Calculate academic stats
    document.getElementById('acad-gpa').textContent = StudentPortalData.grades.gpa;
    document.getElementById('acad-attendance').textContent = `${StudentPortalData.attendance.overall}%`;
    
    // Trigger radial progress ring animations
    animateRadialProgress('acad-progress-ring', StudentPortalData.attendance.overall);
    
    // Render subjects attendance table details
    renderSubjectAttendance();
    
    // Term GPA selection and rendering
    const termSelect = document.getElementById('term-selector');
    if (termSelect) {
      // Re-populate term list if empty
      if (termSelect.options.length <= 1) {
        termSelect.innerHTML = '';
        StudentPortalData.grades.terms.forEach(term => {
          const opt = document.createElement('option');
          opt.value = term.id;
          opt.textContent = term.name;
          termSelect.appendChild(opt);
        });
      }
      
      renderTermGrades(termSelect.value);
      
      termSelect.onchange = () => {
        renderTermGrades(termSelect.value);
      };
    }

    // Transcript Download simulation
    const btnDownload = document.getElementById('btn-download-transcript');
    if (btnDownload) {
      btnDownload.onclick = () => {
        btnDownload.innerHTML = `
          <svg style="animation: spin 1s linear infinite;" viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          Generating PDF...
        `;
        btnDownload.style.pointerEvents = 'none';
        
        setTimeout(() => {
          btnDownload.innerHTML = `
            <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
            Download Academic Report Card
          `;
          btnDownload.style.pointerEvents = 'auto';
          
          // Trigger actual mock file download
          const docContent = `Academic Transcript: Aarav Sharma\nGrade: ${currentStudent.grade}\nOverall GPA: ${StudentPortalData.grades.gpa}\nAttendance: ${StudentPortalData.attendance.overall}%`;
          const blob = new Blob([docContent], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Aarav_Sharma_Academic_Transcript.txt`;
          link.click();
          URL.revokeObjectURL(url);
        }, 1500);
      };
    }
  }

  function animateRadialProgress(elementId, targetPercent) {
    const ring = document.getElementById(elementId);
    if (!ring) return;
    
    // Circumference = 2 * PI * r = 2 * 3.14159 * 45 = 282.74
    const circumference = 282.74;
    ring.style.strokeDasharray = circumference;
    
    // Initial state
    ring.style.strokeDashoffset = circumference;
    
    // Force reflow and set offset
    setTimeout(() => {
      const offset = circumference - (targetPercent / 100) * circumference;
      ring.style.strokeDashoffset = offset;
    }, 100);
  }

  function renderSubjectAttendance() {
    const list = document.getElementById('subject-attendance-list');
    if (!list) return;
    
    let html = '';
    StudentPortalData.attendance.bySubject.forEach(item => {
      const isGood = item.percent >= 90;
      const isWarn = item.percent >= 85 && item.percent < 90;
      const statusClass = isGood ? 'success' : (isWarn ? 'warning' : 'danger');
      
      html += `
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:10px; padding:14px 20px;">
          <div style="display:flex; flex-direction:column; gap:4px;">
            <span style="font-weight:600; font-size:14px;">${item.subject}</span>
            <span style="font-size:12px; color:var(--text-muted);">${item.present} present out of ${item.total} classes</span>
          </div>
          <span style="font-size:16px; font-weight:700; font-family:var(--font-heading); color: var(--${statusClass});">${item.percent}%</span>
        </div>
      `;
    });
    list.innerHTML = html;
  }

  function renderTermGrades(termId) {
    const tableBody = document.getElementById('grades-table-body');
    const displayGpa = document.getElementById('term-gpa-display');
    if (!tableBody) return;
    
    const term = StudentPortalData.grades.terms.find(t => t.id === termId);
    if (!term) return;
    
    displayGpa.textContent = `${term.gpa} GPA`;
    
    let html = '';
    term.subjects.forEach(subject => {
      let badgeClass = 'A';
      if (subject.grade.includes('+')) badgeClass = 'A-plus';
      else if (subject.grade.startsWith('B+')) badgeClass = 'B-plus';
      else if (subject.grade.startsWith('B')) badgeClass = 'B';
      else if (subject.grade.startsWith('C')) badgeClass = 'C';
      
      html += `
        <tr>
          <td class="td-subject">${subject.name}</td>
          <td>${subject.marks} / ${subject.total}</td>
          <td><span class="grade-badge ${badgeClass}">${subject.grade}</span></td>
          <td style="color: var(--text-muted); font-size: 13px; line-height: 1.4;">${subject.remarks}</td>
        </tr>
      `;
    });
    
    tableBody.innerHTML = html;
  }

  // --- 3. Profile View ---
  function renderProfile() {
    // Fill ID card details
    document.getElementById('id-avatar').src = currentStudent.avatar;
    document.getElementById('id-name').textContent = currentStudent.name;
    document.getElementById('id-grade').textContent = currentStudent.grade;
    document.getElementById('id-number').textContent = currentStudent.id;
    document.getElementById('id-roll').textContent = currentStudent.rollNo;
    document.getElementById('id-dob').textContent = currentStudent.dob;
    document.getElementById('id-blood').textContent = currentStudent.bloodGroup;
    
    // Fill profile fields
    document.getElementById('prof-name').textContent = currentStudent.name;
    document.getElementById('prof-id').textContent = currentStudent.id;
    document.getElementById('prof-grade').textContent = currentStudent.grade;
    document.getElementById('prof-roll').textContent = currentStudent.rollNo;
    document.getElementById('prof-email').textContent = currentStudent.email;
    document.getElementById('prof-phone').textContent = currentStudent.phone;
    document.getElementById('prof-dob').textContent = currentStudent.dob;
    document.getElementById('prof-blood').textContent = currentStudent.bloodGroup;
    document.getElementById('prof-address').textContent = currentStudent.address;

    // Guardian details
    document.getElementById('guard-name').textContent = currentStudent.guardian.name;
    document.getElementById('guard-relation').textContent = currentStudent.guardian.relation;
    document.getElementById('guard-phone').textContent = currentStudent.guardian.phone;
    document.getElementById('guard-email').textContent = currentStudent.guardian.email;
    
    // Emergency contact details
    document.getElementById('emerg-name').textContent = currentStudent.emergencyContact.name;
    document.getElementById('emerg-relation').textContent = currentStudent.emergencyContact.relation;
    document.getElementById('emerg-phone').textContent = currentStudent.emergencyContact.phone;
  }

  // --- 4. Assignments View ---
  function renderAssignments() {
    const tabContainer = document.querySelector('.tab-buttons');
    if (!tabContainer) return;
    
    // Get currently active tab filter
    const activeTabBtn = tabContainer.querySelector('.tab-btn.active');
    const filter = activeTabBtn ? activeTabBtn.getAttribute('data-filter') : 'all';
    
    // Setup filter button events once
    const tabBtns = tabContainer.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.onclick = () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderAssignments();
      };
    });

    const listContainer = document.getElementById('assignments-list');
    if (!listContainer) return;
    
    let list = StudentPortalData.assignments;
    if (filter === 'pending') {
      list = list.filter(a => a.status === 'Pending' || a.status === 'Overdue');
    } else if (filter === 'submitted') {
      list = list.filter(a => a.status === 'Submitted');
    }
    
    if (list.length === 0) {
      listContainer.innerHTML = '<p style="grid-column:span 2; text-align:center; padding: 40px; color: var(--text-muted);">No assignments found matching this filter.</p>';
      return;
    }
    
    let html = '';
    list.forEach(asm => {
      const isPending = asm.status === 'Pending';
      const isOverdue = asm.status === 'Overdue';
      const isSubmitted = asm.status === 'Submitted';
      
      let statusClass = 'pending';
      if (isOverdue) statusClass = 'overdue';
      if (isSubmitted) statusClass = 'submitted';
      
      let buttonHtml = '';
      if (isSubmitted) {
        buttonHtml = `
          <button class="btn-action success">
            Submitted
          </button>
        `;
      } else {
        const actionLabel = isOverdue ? 'Submit Late' : 'Submit Now';
        buttonHtml = `
          <button class="btn-action primary" onclick="window.PortalEvents.openSubmitDialog('${asm.id}')">
            ${actionLabel}
          </button>
        `;
      }

      html += `
        <div class="glass-panel assignment-card ${statusClass}">
          <div>
            <div class="assignment-card-header">
              <span class="assignment-subject">${asm.subject}</span>
              <span class="assignment-points">${asm.points} Points</span>
            </div>
            <h3>${asm.title}</h3>
            <p class="description">${asm.description}</p>
          </div>
          <div class="assignment-footer">
            <div class="assignment-due">
              <svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 3h5v5h-5v-5z"/></svg>
              <span>${isSubmitted ? `Submitted on ${asm.submittedAt}` : `Due: ${asm.dueDate}`}</span>
            </div>
            ${buttonHtml}
          </div>
        </div>
      `;
    });
    
    listContainer.innerHTML = html;
  }

  // Bind Submit Assignment Modal handlers globally so inline oncclicks work
  window.PortalEvents = {
    openSubmitDialog: (id) => {
      const asm = StudentPortalData.assignments.find(a => a.id === id);
      if (!asm) return;
      
      activeAssignmentId = id;
      selectedFile = null;
      
      // Reset dialog inputs
      const form = assignmentDialog.querySelector('#submit-assignment-form');
      if (form) form.reset();
      
      const fileInfo = assignmentDialog.querySelector('.file-info');
      const uploadArea = assignmentDialog.querySelector('.upload-area');
      if (fileInfo) fileInfo.style.display = 'none';
      if (uploadArea) uploadArea.style.display = 'flex';
      
      assignmentDialog.querySelector('#dialog-asm-title').textContent = asm.title;
      assignmentDialog.showModal();
    }
  };

  // Drag & Drop Handlers inside Assignment submission dialog
  const uploadArea = document.querySelector('.upload-area');
  const fileInput = document.getElementById('file-upload-input');
  const fileInfo = document.querySelector('.file-info');
  const fileNameDisplay = document.getElementById('file-name-display');
  const btnRemoveFile = document.getElementById('btn-remove-file');

  if (uploadArea && fileInput) {
    uploadArea.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
      }
    });

    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    });
  }

  function handleFileSelection(file) {
    selectedFile = file;
    fileNameDisplay.textContent = file.name;
    uploadArea.style.display = 'none';
    fileInfo.style.display = 'flex';
  }

  if (btnRemoveFile) {
    btnRemoveFile.addEventListener('click', (e) => {
      e.preventDefault();
      selectedFile = null;
      fileInput.value = '';
      uploadArea.style.display = 'flex';
      fileInfo.style.display = 'none';
    });
  }

  const submitAsmForm = document.getElementById('submit-assignment-form');
  if (submitAsmForm) {
    submitAsmForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!selectedFile) {
        alert("Please select a file to upload.");
        return;
      }

      // Update assignment mock status
      const asm = StudentPortalData.assignments.find(a => a.id === activeAssignmentId);
      if (asm) {
        asm.status = 'Submitted';
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        asm.submittedAt = `${dateStr} ${timeStr}`;
        asm.feedback = "Awaiting grading from teacher.";
      }

      assignmentDialog.close();
      renderAssignments();
    });
  }

  // --- 5. Billing View ---
  function renderBilling() {
    const currency = StudentPortalData.billing.currency;
    const outstanding = StudentPortalData.billing.outstanding;
    
    const outstandingEl = document.getElementById('bill-outstanding');
    const payBtn = document.getElementById('btn-trigger-payment');
    
    if (outstandingEl) {
      outstandingEl.textContent = outstanding > 0 ? `${currency}${outstanding.toLocaleString()}` : `${currency}0`;
    }
    
    if (payBtn) {
      if (outstanding <= 0) {
        payBtn.style.display = 'none';
      } else {
        payBtn.style.display = 'block';
        payBtn.onclick = () => openPaymentModal();
      }
    }

    renderInvoicesTable();
  }

  function renderInvoicesTable() {
    const body = document.getElementById('invoices-table-body');
    if (!body) return;
    
    const currency = StudentPortalData.billing.currency;
    let html = '';
    
    StudentPortalData.billing.invoices.forEach(inv => {
      const isPaid = inv.status === 'Paid';
      const statusLabel = isPaid ? 'Paid' : 'Unpaid';
      const statusClass = isPaid ? 'paid' : 'unpaid';
      
      html += `
        <tr>
          <td style="font-weight: 600;">${inv.id}</td>
          <td>${inv.title}</td>
          <td>${currency}${inv.amount.toLocaleString()}</td>
          <td>${isPaid ? `Paid on ${inv.paidDate}` : `Due: ${inv.dueDate}`}</td>
          <td><span class="invoice-status-badge ${statusClass}">${statusLabel}</span></td>
        </tr>
      `;
    });
    
    body.innerHTML = html;
  }

  function openPaymentModal() {
    // Reset payment dialog content
    const modalContent = paymentDialog.querySelector('.modal-content');
    const currency = StudentPortalData.billing.currency;
    const amount = StudentPortalData.billing.outstanding;
    
    modalContent.innerHTML = `
      <div class="modal-header">
        <h3>Simulated Bill Payment</h3>
        <button class="btn-close" onclick="document.getElementById('payment-dialog').close()">
          <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>
      <form id="payment-form">
        <div class="modal-body">
          <div style="background:rgba(99,102,241,0.06); border:1px solid rgba(99,102,241,0.15); border-radius:10px; padding:16px 20px; text-align:center;">
            <p style="font-size:12px; color:var(--text-muted); margin-bottom:4px; text-transform:uppercase; letter-spacing:0.05em; font-weight:600;">Amount Outstanding</p>
            <h4 style="font-size:28px; font-family:var(--font-heading); font-weight:800; color:var(--primary);">${currency}${amount.toLocaleString()}</h4>
          </div>
          <div class="form-group">
            <label for="pay-card-num">Card Number</label>
            <div class="input-wrapper">
              <input type="text" id="pay-card-num" placeholder="4111 2222 3333 4444" required maxlength="19">
              <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
            </div>
          </div>
          <div class="card-row">
            <div class="form-group">
              <label for="pay-card-expiry">Expiry Date</label>
              <input type="text" id="pay-card-expiry" placeholder="MM/YY" required maxlength="5" style="width:100%; padding:14px; background:rgba(15, 23, 42, 0.6); border:1px solid var(--border-color); border-radius:10px; color:var(--text-main); font-family:var(--font-body); font-size:15px; outline:none;">
            </div>
            <div class="form-group" style="grid-column:span 2">
              <label for="pay-card-cvv">CVV</label>
              <input type="password" id="pay-card-cvv" placeholder="•••" required maxlength="3" style="width:100%; padding:14px; background:rgba(15, 23, 42, 0.6); border:1px solid var(--border-color); border-radius:10px; color:var(--text-main); font-family:var(--font-body); font-size:15px; outline:none;">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary" onclick="document.getElementById('payment-dialog').close()">Cancel</button>
          <button type="submit" class="btn-login" style="margin:0; width:auto; padding:10px 24px;">Confirm & Pay</button>
        </div>
      </form>
    `;
    
    // Auto formatting fields
    const cardNum = document.getElementById('pay-card-num');
    const cardExp = document.getElementById('pay-card-expiry');
    const cardCvv = document.getElementById('pay-card-cvv');
    
    if (cardNum) {
      cardNum.addEventListener('input', (e) => {
        // Format with space every 4 digits
        let value = e.target.value.replace(/\D/g, '');
        let formatted = value.match(/.{1,4}/g);
        e.target.value = formatted ? formatted.join(' ') : '';
      });
    }

    if (cardExp) {
      cardExp.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 2) {
          e.target.value = value.substring(0, 2) + '/' + value.substring(2, 4);
        } else {
          e.target.value = value;
        }
      });
    }

    if (cardCvv) {
      cardCvv.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
      });
    }

    const payForm = document.getElementById('payment-form');
    if (payForm) {
      payForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Show spinner / processing state
        const confirmBtn = payForm.querySelector('button[type="submit"]');
        confirmBtn.innerHTML = `
          <svg style="animation: spin 1s linear infinite; width:16px; height:16px; margin-right:8px; display:inline-block; vertical-align:middle;" viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          Processing...
        `;
        confirmBtn.disabled = true;
        
        setTimeout(() => {
          // Complete payment
          StudentPortalData.billing.outstanding = 0;
          
          // Mark outstanding invoices as paid
          const now = new Date();
          const paidDateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
          
          StudentPortalData.billing.invoices.forEach(inv => {
            if (inv.status === 'Unpaid') {
              inv.status = 'Paid';
              inv.paidDate = paidDateStr;
              inv.paymentMethod = 'Credit Card';
            }
          });

          // Show success state
          modalContent.innerHTML = `
            <div class="success-state">
              <div class="success-icon">
                <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              </div>
              <h4>Payment Successful!</h4>
              <p>Receipt sent to ${currentStudent.email}. The outstanding balance is updated.</p>
              <button class="btn-login" style="width:160px;" onclick="document.getElementById('payment-dialog').close()">Done</button>
            </div>
          `;
          
          // Re-render billing section on dialog close
          paymentDialog.addEventListener('close', () => {
            renderBilling();
          }, { once: true });
          
        }, 1800);
      });
    }

    paymentDialog.showModal();
  }

  // Fallback for browsers that do not support native backdrop clicks on dialogs
  // (e.g. older safari versions)
  function setupDialogFallbacks() {
    [assignmentDialog, paymentDialog, announcementDialog].forEach(dialog => {
      if (!dialog) return;
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        dialog.addEventListener('click', (e) => {
          if (e.target !== dialog) return;
          const rect = dialog.getBoundingClientRect();
          const isInside = (
            rect.top <= e.clientY &&
            e.clientY <= rect.top + rect.height &&
            rect.left <= e.clientX &&
            e.clientX <= rect.left + rect.width
          );
          if (!isInside) dialog.close();
        });
      }
    });
  }

  setupDialogFallbacks();

  // Kick off app initial state checking
  checkAuth();
});
