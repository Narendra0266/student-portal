// Parent Dashboard Operations

const session = protectPage('parent');
if (!session) {
  // Redirecting...
}

const { token, user } = session || {};
let charts = {}; // references to chart.js instances

document.addEventListener('DOMContentLoaded', () => {
  if (!session) return;

  setupNavigation();
  setupMobileSidebar();

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
    const profileRes = await fetch('/api/parents/child-profile', { headers });
    const profile = await profileRes.json();
    if (profileRes.ok) {
      renderProfile(profile);
    }

    // 2. Attendance Details
    const attendanceRes = await fetch('/api/parents/child-attendance', { headers });
    const attendance = await attendanceRes.json();
    if (attendanceRes.ok) {
      renderAttendance(attendance);
    }

    // 3. Results / Marks
    const resultsRes = await fetch('/api/parents/child-results', { headers });
    const results = await resultsRes.json();
    if (resultsRes.ok) {
      renderResults(results);
    }

    // 4. Fees Status
    const feesRes = await fetch('/api/parents/child-fees', { headers });
    const fees = await feesRes.json();
    if (feesRes.ok) {
      renderFees(fees);
    }

    // 5. Timetable Schedule
    const timetableRes = await fetch('/api/parents/child-timetable', { headers });
    const timetable = await timetableRes.json();
    if (timetableRes.ok) {
      renderTimetable(timetable, profile.class, profile.section);
    }

  } catch (err) {
    console.error('Error loading parent dashboard details:', err);
  }
}

// 1. Profile rendering
function renderProfile(profile) {
  // Cache user data in top bar
  document.getElementById('user-display-name').textContent = user.name || 'Parent User';

  // Welcomer
  document.getElementById('welcome-parent-name').textContent = user.name || 'Parent User';
  document.getElementById('welcome-child-name').textContent = profile.name;
  document.getElementById('welcome-roll').textContent = profile.roll_no;
  document.getElementById('welcome-class-section').textContent = `${profile.class} - ${profile.section}`;

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
  document.getElementById('prof-guardian-email').textContent = profile.guardian.email;
  document.getElementById('prof-guardian-phone').textContent = profile.guardian.phone;
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
    let textColor = 'text-green-600';
    if (sub.percent < 75) {
      progressColor = 'bg-red-500';
      textColor = 'text-red-600';
    } else if (sub.percent < 85) {
      progressColor = 'bg-amber-500';
      textColor = 'text-amber-600';
    }

    const item = document.createElement('div');
    item.className = 'p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4';
    item.innerHTML = `
      <div class="flex-grow space-y-1 w-full">
        <div class="flex justify-between text-sm font-semibold">
          <span>${sub.subject}</span>
          <span class="${textColor}">${sub.percent}%</span>
        </div>
        <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div class="${progressColor} h-full" style="width: ${sub.percent}%"></div>
        </div>
      </div>
      <div class="text-xs text-slate-500 shrink-0">
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
            color: '#64748b',
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

  // Display GPA
  document.getElementById('results-gpa').textContent = `${data.gpa} GPA`;

  // Function to render chart and table for selected term
  const displayTermResults = (termId) => {
    const term = data.terms.find(t => t.id === termId);
    if (!term) return;

    // Render table
    const tableBody = document.getElementById('results-table-body');
    tableBody.innerHTML = '';

    term.subjects.forEach(sub => {
      let gradeBadgeColor = 'bg-navy text-white';
      if (sub.grade.startsWith('A')) gradeBadgeColor = 'bg-green-100 text-green-800';
      else if (sub.grade.startsWith('B')) gradeBadgeColor = 'bg-blue-100 text-blue-800';
      else if (sub.grade.startsWith('C')) gradeBadgeColor = 'bg-amber-100 text-amber-800';

      const row = document.createElement('tr');
      row.className = 'border-b border-slate-100 hover:bg-slate-50/50 transition-colors';
      row.innerHTML = `
        <td class="py-3 px-4 font-semibold text-slate-800">${sub.name}</td>
        <td class="py-3 px-4 text-center font-bold">${sub.marks}</td>
        <td class="py-3 px-4 text-center text-slate-500">${sub.total}</td>
        <td class="py-3 px-4 text-center">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${gradeBadgeColor}">${sub.grade}</span>
        </td>
        <td class="py-3 px-4 text-xs text-slate-500">${sub.remarks}</td>
      `;
      tableBody.appendChild(row);
    });

    // Render Bar Chart
    const ctx = document.getElementById('marks-bar-chart').getContext('2d');
    if (charts.results) {
      charts.results.destroy();
    }

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
            grid: { color: '#e2e8f0' },
            ticks: { color: '#64748b' }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#64748b' }
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
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';

    const row = document.createElement('tr');
    row.className = 'border-b border-slate-100 hover:bg-slate-50/50 transition-colors';
    
    // Format Date
    const dueStr = new Date(inv.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    row.innerHTML = `
      <td class="py-3 font-semibold text-slate-800">${inv.receipt_no || `INV-${inv.id}`}</td>
      <td class="py-3 text-slate-600">Term Tuition / Board Fees</td>
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
    card.className = 'bg-slate-50 rounded-xl p-5 border border-slate-200/50 space-y-4';
    
    let slotsHtml = '';
    if (slots.length === 0) {
      slotsHtml = '<p class="text-xs text-slate-400 italic text-center py-4">No classes scheduled</p>';
    } else {
      slots.forEach(slot => {
        slotsHtml += `
          <div class="flex items-start gap-3 border-l-2 border-gold pl-3 py-1">
            <div class="space-y-0.5">
              <span class="text-xs text-slate-500 block">${slot.time}</span>
              <h5 class="text-sm font-semibold text-slate-850">${slot.subject}</h5>
              <span class="text-[10px] text-slate-400 block">${slot.teacher} • ${slot.room}</span>
            </div>
          </div>
        `;
      });
    }

    card.innerHTML = `
      <h4 class="font-bold text-navy border-b border-slate-200 pb-2 flex justify-between items-center text-sm">
        <span>${day}</span>
        <span class="text-xs text-slate-400 font-normal">${slots.length} Classes</span>
      </h4>
      <div class="space-y-3">
        ${slotsHtml}
      </div>
    `;

    container.appendChild(card);
  });
}


// ================= UPGRADE LOGIC (PAYMENTS, MESSAGES, PRINT) =================

// PDF Download
document.addEventListener('DOMContentLoaded', () => {
  const btnDownload = document.getElementById('btn-download-pdf');
  if (btnDownload) {
    btnDownload.addEventListener('click', () => {
      window.print();
    });
  }

  // Payment Modal Logic
  const btnPayFees = document.getElementById('btn-pay-fees');
  const modal = document.getElementById('payment-modal');
  const modalCard = document.getElementById('payment-modal-card');
  const btnCloseModal = document.getElementById('close-payment-modal');
  const btnSubmitPayment = document.getElementById('btn-submit-payment');

  if (btnPayFees && modal) {
    btnPayFees.addEventListener('click', () => {
      modal.classList.remove('hidden');
      setTimeout(() => {
        modalCard.classList.remove('scale-95', 'opacity-0');
        modalCard.classList.add('scale-100', 'opacity-100');
      }, 10);
    });

    const closeModal = () => {
      modalCard.classList.remove('scale-100', 'opacity-100');
      modalCard.classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    };

    btnCloseModal.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    btnSubmitPayment.addEventListener('click', async () => {
      btnSubmitPayment.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
      btnSubmitPayment.disabled = true;

      try {
        const response = await fetch('/api/parents/pay-fees', {
          method: 'POST',
          headers: getAuthHeaders()
        });
        
        if (response.ok) {
          btnSubmitPayment.innerHTML = '<i class="fa-solid fa-check text-green-400"></i> Payment Successful!';
          btnSubmitPayment.classList.replace('bg-navy', 'bg-green-600');
          setTimeout(() => {
            closeModal();
            window.location.reload(); // Refresh to show updated fees
          }, 1500);
        } else {
          btnSubmitPayment.innerHTML = '<i class="fa-solid fa-xmark"></i> Payment Failed';
          btnSubmitPayment.classList.replace('bg-navy', 'bg-red-600');
          setTimeout(() => {
            btnSubmitPayment.innerHTML = 'Try Again';
            btnSubmitPayment.classList.replace('bg-red-600', 'bg-navy');
            btnSubmitPayment.disabled = false;
          }, 2000);
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  // Messages Logic
  const messagesTab = document.querySelector('[data-tab="messages"]');
  if (messagesTab) {
    messagesTab.addEventListener('click', () => {
      loadMessages();
    });
  }

  const chatForm = document.getElementById('chat-form');
  if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('chat-input');
      const content = input.value.trim();
      if (!content) return;

      input.disabled = true;
      try {
        const response = await fetch('/api/parents/messages', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            receiver_id: 4, // Assuming Teacher ID is 4 for simulation
            content: content
          })
        });
        
        if (response.ok) {
          input.value = '';
          loadMessages();
        }
      } catch (err) {
        console.error('Error sending message:', err);
      }
      input.disabled = false;
      input.focus();
    });
  }
});

async function loadMessages() {
  const chatHistory = document.getElementById('chat-history');
  if (!chatHistory) return;

  try {
    const response = await fetch('/api/parents/messages', {
      headers: getAuthHeaders()
    });
    
    if (response.ok) {
      const messages = await response.json();
      chatHistory.innerHTML = '';
      
      if (messages.length === 0) {
        chatHistory.innerHTML = '<div class="text-center text-xs text-slate-400 my-4">No messages yet. Send a message to the class teacher.</div>';
        return;
      }
      
      messages.forEach(msg => {
        const isMe = msg.sender_id === user.id;
        const align = isMe ? 'self-end bg-navy text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl' : 'self-start bg-white border border-slate-200 text-slate-700 rounded-tl-2xl rounded-tr-2xl rounded-br-2xl';
        
        const msgDiv = document.createElement('div');
        msgDiv.className = `max-w-[75%] p-3 text-sm shadow-sm ${align}`;
        msgDiv.innerHTML = `
          <p>${msg.content}</p>
          <span class="text-[9px] block mt-1 ${isMe ? 'text-slate-300' : 'text-slate-400'}">${new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        `;
        chatHistory.appendChild(msgDiv);
      });

      // Scroll to bottom
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }
  } catch (err) {
    console.error('Error loading messages:', err);
  }
}
