/**
 * BitAware - Master Application Controller
 * Handles routing, role switching, complaint submission wizard, authority actions,
 * interactive timelines, and toast notifications.
 */

const app = {
  currentRole: 'citizen', // 'citizen', 'authority-pwd', 'authority-waste', 'authority-water', 'admin'
  currentView: 'landing',
  previousView: 'landing',
  activeComplaintId: null,
  latestSubmittedId: null,
  selectedCategory: 'potholes',
  selectedEvidencePhoto: null,

  init() {
    this.renderCategoryGrid();
    this.renderNotificationsList();
    this.updateRoleUI();
    this.navigateTo('landing');

    // Initial Lucide Icons Render
    if (window.lucide) {
      lucide.createIcons();
    }
  },

  // Navigation Controller
  navigateTo(viewId) {
    this.previousView = this.currentView;
    this.currentView = viewId;

    // Hide all view sections
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));

    // Highlight active desktop nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('bg-blue-50', 'text-blue-600', 'font-bold');
      link.classList.add('text-slate-600');
    });

    const activeNav = document.getElementById(`nav-${viewId}`);
    if (activeNav) {
      activeNav.classList.add('bg-blue-50', 'text-blue-600', 'font-bold');
      activeNav.classList.remove('text-slate-600');
    }

    // Show target section
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
      target.classList.remove('hidden');
      target.classList.add('animate-fadeIn');
    }

    // Trigger view-specific renderers
    if (viewId === 'citizen-dashboard') {
      this.renderCitizenDashboard();
    } else if (viewId === 'authority-dashboard') {
      this.renderAuthorityDashboard();
    } else if (viewId === 'map-view') {
      setTimeout(() => {
        mapModule.initFullMap();
      }, 100);
    } else if (viewId === 'admin-dashboard') {
      this.renderAdminDashboard();
    }

    // Refresh icons
    if (window.lucide) lucide.createIcons();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // Role Management
  toggleRoleMenu() {
    const menu = document.getElementById('role-menu');
    menu.classList.toggle('hidden');
  },

  switchRole(newRole) {
    this.currentRole = newRole;
    this.updateRoleUI();
    this.toggleRoleMenu();

    this.showToast(`Active persona: ${this.getRoleDisplayName(newRole)}`, 'info');

    // Auto-navigate to appropriate workspace
    if (newRole === 'citizen') {
      this.navigateTo('citizen-dashboard');
    } else if (newRole.startsWith('authority')) {
      this.navigateTo('authority-dashboard');
    } else if (newRole === 'admin') {
      this.navigateTo('admin-dashboard');
    }
  },

  getRoleDisplayName(role) {
    switch (role) {
      case 'citizen': return 'Citizen (Rahul Sharma)';
      case 'authority-pwd': return 'Authority (PWD & Roads)';
      case 'authority-waste': return 'Authority (Solid Waste)';
      case 'authority-water': return 'Authority (Water Board)';
      case 'admin': return 'Platform Administrator';
      default: return 'User';
    }
  },

  updateRoleUI() {
    const label = document.getElementById('current-role-label');
    if (label) {
      label.innerText = this.getRoleDisplayName(this.currentRole);
    }

    // Update Authority Dashboard titles based on active dept
    const authTitle = document.getElementById('auth-org-title');
    const authBadge = document.getElementById('auth-org-badge');

    if (authTitle && authBadge) {
      if (this.currentRole === 'authority-waste') {
        authTitle.innerText = 'Municipal Solid Waste & Sanitation Bureau';
        authBadge.innerText = 'Solid Waste Dept • Citywide';
      } else if (this.currentRole === 'authority-water') {
        authTitle.innerText = 'City Jal Board & Water Infrastructure';
        authBadge.innerText = 'Water & Sewerage • Central';
      } else {
        authTitle.innerText = 'Public Works & Road Maintenance Division';
        authBadge.innerText = 'Municipal Corp • Zone 2';
      }
    }
  },

  // ================= CITIZEN PORTAL =================
  renderCitizenDashboard() {
    const complaints = dataStore.getAllComplaints().filter(c => c.citizenName === 'Rahul Sharma' || c.citizenContact === 'rahul.s@example.com');
    
    // Calculate statistics
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
    const pending = complaints.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length;

    const elTotal = document.getElementById('citizen-stat-total');
    const elRes = document.getElementById('citizen-stat-resolved');
    const elProg = document.getElementById('citizen-stat-inprogress');
    const elPend = document.getElementById('citizen-stat-pending');

    if (elTotal) elTotal.innerText = total;
    if (elRes) elRes.innerText = resolved;
    if (elProg) elProg.innerText = inProgress;
    if (elPend) elPend.innerText = pending;

    this.renderCitizenComplaints();
  },

  renderCitizenComplaints() {
    const filter = document.getElementById('citizen-filter-status')?.value || 'all';
    const container = document.getElementById('citizen-complaints-list');
    if (!container) return;

    let complaints = dataStore.getAllComplaints().filter(c => c.citizenName === 'Rahul Sharma' || c.citizenContact === 'rahul.s@example.com');

    if (filter !== 'all') {
      complaints = complaints.filter(c => c.status === filter);
    }

    if (complaints.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-slate-400">
          <i data-lucide="inbox" class="w-10 h-10 mx-auto mb-2 text-slate-300"></i>
          <p class="text-sm font-semibold">No complaints found under this filter</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = complaints.map(c => {
      const color = mapModule.statusColors[c.status]?.bg || '#3b82f6';
      return `
        <div class="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition cursor-pointer" onclick="app.viewComplaintDetails('${c.id}')">
          <div class="flex items-start gap-4">
            <div class="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 shadow-sm relative">
              <img src="${c.photoBefore}" class="w-full h-full object-cover" alt="Complaint photo"/>
              <span class="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/70 text-white text-[8px] font-mono">LIVE</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs font-bold text-blue-600">${c.id}</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase" style="background-color: ${color}">${c.status}</span>
                <span class="text-[10px] text-slate-400 font-semibold">• ${c.categoryName}</span>
              </div>
              <h4 class="font-bold text-sm text-slate-900 mt-1">${c.title}</h4>
              <p class="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                📍 ${c.location.address}
              </p>
            </div>
          </div>
          <div class="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
            <span class="text-[11px] text-slate-400">Updated: ${new Date(c.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
            <button class="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800">
              <span>Track Progress</span>
              <i data-lucide="chevron-right" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
  },

  // ================= TICKET SEARCH TRACKER =================
  trackTicketById(customInputId) {
    const input = document.getElementById(customInputId || 'home-track-input');
    const ticketId = input ? input.value.trim() : '';

    if (!ticketId) {
      this.showToast('Please enter a Complaint / Ticket ID.', 'warning');
      return;
    }

    const complaint = dataStore.getComplaintById(ticketId);
    if (complaint) {
      this.showToast(`Found Ticket ${complaint.id}!`, 'success');
      this.viewComplaintDetails(complaint.id);
    } else {
      this.showToast(`No complaint found matching "${ticketId}". Check ID format e.g., CIV-2026-000101`, 'error');
    }
  },

  // ================= REPORT ISSUE WIZARD =================
  startReportIssue() {
    this.navigateTo('report-wizard');
    this.resetReportWizard();
    this.wizardShowStep(1);

    // Prompt location detection early
    locationModule.detectLiveGPS();
  },

  cancelReportWizard() {
    cameraModule.stopCamera();
    this.navigateTo(this.previousView || 'citizen-dashboard');
  },

  resetReportWizard() {
    cameraModule.reset();
    document.getElementById('wizard-title-input').value = '';
    document.getElementById('wizard-desc-input').value = '';
    document.getElementById('wizard-success').classList.add('hidden');
    this.selectCategory('potholes');
  },

  wizardShowStep(stepNum) {
    document.querySelectorAll('.wizard-step').forEach(el => el.classList.add('hidden'));
    document.getElementById(`wizard-step-${stepNum}`).classList.remove('hidden');

    // Update Progress Bar
    const progressPercents = ['25%', '50%', '75%', '100%'];
    document.getElementById('step-bar-progress').style.width = progressPercents[stepNum - 1];

    for (let i = 1; i <= 4; i++) {
      const node = document.getElementById(`step-node-${i}`);
      if (i <= stepNum) {
        node.classList.remove('bg-slate-200', 'text-slate-600');
        node.classList.add('bg-blue-600', 'text-white');
      } else {
        node.classList.remove('bg-blue-600', 'text-white');
        node.classList.add('bg-slate-200', 'text-slate-600');
      }
    }

    if (stepNum === 2) {
      setTimeout(() => {
        mapModule.initWizardMap();
      }, 150);
    } else if (stepNum === 4) {
      this.populateReviewStep();
    }

    if (window.lucide) lucide.createIcons();
  },

  wizardNext(nextStep) {
    if (nextStep === 2) {
      if (!cameraModule.capturedImageData) {
        this.showToast('Please capture or select a photo of the civic issue.', 'warning');
        cameraModule.loadPresetCivicPhoto();
        return;
      }
    } else if (nextStep === 4) {
      const title = document.getElementById('wizard-title-input').value.trim();
      const desc = document.getElementById('wizard-desc-input').value.trim();
      if (!title) {
        this.showToast('Please enter an issue title.', 'warning');
        document.getElementById('wizard-title-input').focus();
        return;
      }
      if (!desc) {
        this.showToast('Please enter a brief description.', 'warning');
        document.getElementById('wizard-desc-input').focus();
        return;
      }
    }
    this.wizardShowStep(nextStep);
  },

  wizardPrev(prevStep) {
    this.wizardShowStep(prevStep);
  },

  renderCategoryGrid() {
    const grid = document.getElementById('category-selector-grid');
    if (!grid) return;

    grid.innerHTML = CIVIC_CATEGORIES.map(cat => `
      <div id="cat-card-${cat.id}" onclick="app.selectCategory('${cat.id}')" class="category-card p-3 rounded-2xl border ${this.selectedCategory === cat.id ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold shadow-sm' : 'border-slate-200 bg-white text-slate-700 font-medium'} flex items-center gap-2.5 cursor-pointer hover:border-blue-300 transition">
        <div class="w-8 h-8 rounded-xl ${this.selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'} flex items-center justify-center flex-shrink-0">
          <i data-lucide="${cat.icon}" class="w-4 h-4"></i>
        </div>
        <div class="text-left">
          <span class="text-xs block leading-snug">${cat.name}</span>
          <span class="text-[9px] text-slate-400 block">${cat.dept}</span>
        </div>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  },

  selectCategory(catId) {
    this.selectedCategory = catId;
    this.renderCategoryGrid();
  },

  populateReviewStep() {
    const category = CIVIC_CATEGORIES.find(c => c.id === this.selectedCategory) || CIVIC_CATEGORIES[0];
    const title = document.getElementById('wizard-title-input').value.trim();
    const desc = document.getElementById('wizard-desc-input').value.trim();
    const priority = document.querySelector('input[name="wizard-priority"]:checked')?.value || 'Medium';

    document.getElementById('review-photo').src = cameraModule.capturedImageData;
    document.getElementById('review-category-badge').innerText = category.name;
    document.getElementById('review-title').innerText = title || 'Untitled Civic Issue';
    document.getElementById('review-address').innerHTML = `<i data-lucide="map-pin" class="w-3.5 h-3.5 text-red-500"></i> ${locationModule.currentAddress}`;
    document.getElementById('review-priority').innerText = priority;
    document.getElementById('review-desc').innerText = `"${desc}"`;
    document.getElementById('review-target-dept').innerText = category.dept;

    if (window.lucide) lucide.createIcons();
  },

  submitNewComplaint() {
    const submitBtn = document.getElementById('btn-submit-complaint');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="animate-spin mr-2">⏳</span> Registering Ticket...`;

    const category = CIVIC_CATEGORIES.find(c => c.id === this.selectedCategory) || CIVIC_CATEGORIES[0];
    const title = document.getElementById('wizard-title-input').value.trim();
    const desc = document.getElementById('wizard-desc-input').value.trim();
    const priority = document.querySelector('input[name="wizard-priority"]:checked')?.value || 'Medium';
    const newId = dataStore.generateComplaintId();

    const newComplaint = {
      id: newId,
      title: title,
      category: category.id,
      categoryName: category.name,
      description: desc,
      status: 'Submitted',
      priority: priority,
      citizenName: 'Rahul Sharma',
      citizenContact: 'rahul.s@example.com',
      assignedOrgId: 'org-pwd',
      assignedOrgName: category.dept,
      location: {
        lat: locationModule.currentLat,
        lng: locationModule.currentLng,
        address: locationModule.currentAddress
      },
      photoBefore: cameraModule.capturedImageData,
      photoAfter: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          status: 'Submitted',
          actor: 'Rahul Sharma (Citizen)',
          timestamp: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          note: 'Civic issue reported with live camera capture & verified GPS location on BitAware.'
        }
      ]
    };

    setTimeout(() => {
      dataStore.addComplaint(newComplaint);
      this.latestSubmittedId = newId;

      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Confirm & Submit</span>`;

      // Show Success Screen
      document.querySelectorAll('.wizard-step').forEach(el => el.classList.add('hidden'));
      document.getElementById('wizard-success').classList.remove('hidden');
      document.getElementById('success-complaint-id').innerText = newId;

      this.showToast(`Complaint ${newId} submitted successfully to BitAware!`, 'success');
      this.renderNotificationsList();
    }, 600);
  },

  // ================= COMPLAINT DETAILS & TIMELINE =================
  viewComplaintDetails(complaintId) {
    const complaint = dataStore.getComplaintById(complaintId);
    if (!complaint) {
      this.showToast('Complaint not found.', 'warning');
      return;
    }

    this.activeComplaintId = complaintId;
    this.navigateTo('complaint-details');

    document.getElementById('detail-id').innerText = complaint.id;
    document.getElementById('detail-timestamp').innerText = `Reported on ${new Date(complaint.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`;
    document.getElementById('detail-title').innerText = complaint.title;
    document.getElementById('detail-desc').innerText = complaint.description;
    document.getElementById('detail-category').innerText = complaint.categoryName;
    document.getElementById('detail-dept').innerText = complaint.assignedOrgName;
    document.getElementById('detail-reporter').innerText = `${complaint.citizenName} (Verified Citizen)`;
    document.getElementById('detail-address-text').innerText = complaint.location.address;

    // Status Pill
    const statusPill = document.getElementById('detail-status-pill');
    statusPill.innerText = complaint.status;
    statusPill.style.backgroundColor = mapModule.statusColors[complaint.status]?.bg || '#3b82f6';
    statusPill.style.color = '#ffffff';

    // Priority Pill
    const priorityPill = document.getElementById('detail-priority-pill');
    priorityPill.innerText = `${complaint.priority} Priority`;

    // Photos
    document.getElementById('detail-photo-before').src = complaint.photoBefore;
    const photoAfter = document.getElementById('detail-photo-after');
    const photoPlaceholder = document.getElementById('detail-photo-after-placeholder');
    const evidenceBadge = document.getElementById('detail-evidence-badge');

    if (complaint.photoAfter) {
      photoAfter.src = complaint.photoAfter;
      photoAfter.classList.remove('hidden');
      photoPlaceholder.classList.add('hidden');
      evidenceBadge.innerText = 'Work Proof Verified';
      evidenceBadge.className = 'text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded';
    } else {
      photoAfter.classList.add('hidden');
      photoPlaceholder.classList.remove('hidden');
      evidenceBadge.innerText = 'Pending Work Proof';
      evidenceBadge.className = 'text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded';
    }

    // Mini Map
    mapModule.initDetailMiniMap(complaint.location.lat, complaint.location.lng);

    // Render Timeline
    this.renderTimelineFlow(complaint.timeline);

    // Set select box for authority
    const statusSelect = document.getElementById('action-status-select');
    if (statusSelect) statusSelect.value = complaint.status;

    if (window.lucide) lucide.createIcons();
  },

  renderTimelineFlow(timeline) {
    const container = document.getElementById('detail-timeline-flow');
    if (!container) return;

    container.innerHTML = timeline.map((event, idx) => {
      const color = mapModule.statusColors[event.status]?.bg || '#3b82f6';
      return `
        <div class="relative pl-6 pb-2 group">
          <span class="absolute -left-[7px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm" style="background-color: ${color}"></span>
          <div class="flex items-center justify-between">
            <span class="font-bold text-xs text-slate-900">${event.status}</span>
            <span class="text-[10px] text-slate-400 font-mono">${event.timestamp}</span>
          </div>
          <p class="text-[11px] font-semibold text-blue-700 mt-0.5">${event.actor}</p>
          <p class="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-snug">${event.note}</p>
        </div>
      `;
    }).join('');
  },

  navigateBackFromDetails() {
    this.navigateTo(this.previousView || 'citizen-dashboard');
  },

  // Authority Action Execution
  handleEvidenceUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedEvidencePhoto = e.target.result;
      this.showToast('Resolution evidence photo selected!', 'success');
    };
    reader.readAsDataURL(file);
  },

  quickAddPresetEvidence() {
    this.selectedEvidencePhoto = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80';
    this.showToast('Sample resolution proof photo attached.', 'info');
  },

  submitAuthorityAction() {
    const status = document.getElementById('action-status-select').value;
    const note = document.getElementById('action-comment-input').value.trim();
    const actorName = this.getRoleDisplayName(this.currentRole);

    if (!this.activeComplaintId) return;

    const success = dataStore.updateComplaintStatus(
      this.activeComplaintId,
      status,
      note || `Status updated to ${status} following on-site protocol.`,
      actorName,
      this.selectedEvidencePhoto
    );

    if (success) {
      this.selectedEvidencePhoto = null;
      document.getElementById('action-comment-input').value = '';
      this.showToast(`Updated complaint to "${status}"`, 'success');
      this.viewComplaintDetails(this.activeComplaintId);
      this.renderNotificationsList();
    }
  },

  // ================= AUTHORITY DASHBOARD =================
  renderAuthorityDashboard() {
    const complaints = dataStore.getAllComplaints();

    const assigned = complaints.length;
    const newItems = complaints.filter(c => c.status === 'Submitted').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const urgent = complaints.filter(c => c.priority === 'High').length;

    const elAss = document.getElementById('auth-kpi-assigned');
    const elNew = document.getElementById('auth-kpi-new');
    const elProg = document.getElementById('auth-kpi-inprogress');
    const elRes = document.getElementById('auth-kpi-resolved');
    const elUrg = document.getElementById('auth-kpi-urgent');

    if (elAss) elAss.innerText = assigned;
    if (elNew) elNew.innerText = newItems;
    if (elProg) elProg.innerText = inProgress;
    if (elRes) elRes.innerText = resolved;
    if (elUrg) elUrg.innerText = urgent;

    analyticsModule.renderCharts();
    this.renderAuthorityQueue();
  },

  renderAuthorityQueue() {
    const statusFilter = document.getElementById('auth-filter-status')?.value || 'all';
    const priorityFilter = document.getElementById('auth-filter-priority')?.value || 'all';
    const tbody = document.getElementById('auth-queue-table-body');
    if (!tbody) return;

    let complaints = dataStore.getAllComplaints();

    if (statusFilter !== 'all') {
      complaints = complaints.filter(c => c.status === statusFilter);
    }
    if (priorityFilter !== 'all') {
      complaints = complaints.filter(c => c.priority === priorityFilter);
    }

    if (complaints.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-slate-400">No records found matching filters.</td></tr>`;
      return;
    }

    tbody.innerHTML = complaints.map(c => {
      const color = mapModule.statusColors[c.status]?.bg || '#3b82f6';
      const prioColor = c.priority === 'High' ? 'text-rose-600 bg-rose-50' : c.priority === 'Medium' ? 'text-amber-600 bg-amber-50' : 'text-slate-600 bg-slate-50';
      return `
        <tr class="hover:bg-slate-50 transition">
          <td class="py-3 px-4 font-mono font-bold text-blue-600">${c.id}</td>
          <td class="py-3 px-4">
            <img src="${c.photoBefore}" class="w-10 h-10 rounded-lg object-cover border border-slate-200" alt="Thumbnail">
          </td>
          <td class="py-3 px-4 max-w-xs">
            <span class="text-[10px] uppercase font-bold text-slate-400 block">${c.categoryName}</span>
            <span class="font-bold text-slate-800 line-clamp-1">${c.title}</span>
          </td>
          <td class="py-3 px-4 text-[11px] text-slate-500 max-w-xs truncate">${c.location.address}</td>
          <td class="py-3 px-4">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${prioColor}">${c.priority}</span>
          </td>
          <td class="py-3 px-4">
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold text-white" style="background-color: ${color}">${c.status}</span>
          </td>
          <td class="py-3 px-4 text-right">
            <button onclick="app.viewComplaintDetails('${c.id}')" class="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 font-bold px-3 py-1.5 rounded-lg transition text-[11px]">
              Manage
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  // ================= ADMIN DASHBOARD =================
  renderAdminDashboard() {
    this.renderAdminOrgs();
    this.renderAdminCategories();
    this.renderAdminAudit();
  },

  setAdminTab(tab) {
    ['orgs', 'categories', 'system'].forEach(t => {
      document.getElementById(`admin-tab-${t}`).classList.remove('bg-blue-600', 'text-white');
      document.getElementById(`admin-tab-${t}`).classList.add('text-slate-600');
      document.getElementById(`admin-content-${t}`).classList.add('hidden');
    });

    document.getElementById(`admin-tab-${tab}`).classList.add('bg-blue-600', 'text-white');
    document.getElementById(`admin-tab-${tab}`).classList.remove('text-slate-600');
    document.getElementById(`admin-content-${tab}`).classList.remove('hidden');
  },

  renderAdminOrgs() {
    const list = document.getElementById('admin-orgs-list');
    if (!list) return;

    list.innerHTML = INITIAL_ORGS.map(org => `
      <div class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <h4 class="font-bold text-slate-900 text-sm">${org.name}</h4>
            <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">✓ Verified</span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">${org.type} • Zone: ${org.zone}</p>
          <p class="text-[11px] text-slate-400 mt-0.5">Lead: ${org.officerInCharge} | ${org.contact}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl">${org.activeTickets} Active Tickets</span>
        </div>
      </div>
    `).join('');
  },

  renderAdminCategories() {
    const list = document.getElementById('admin-categories-list');
    if (!list) return;

    list.innerHTML = CIVIC_CATEGORIES.map(c => `
      <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <i data-lucide="${c.icon}" class="w-5 h-5"></i>
          </div>
          <div>
            <h4 class="font-bold text-slate-900 text-xs">${c.name}</h4>
            <p class="text-[11px] text-slate-500">Route to: ${c.dept}</p>
          </div>
        </div>
        <div class="text-right">
          <span class="text-[10px] text-slate-400 uppercase font-bold block">SLA Target</span>
          <span class="text-xs font-bold text-blue-600">${c.slaHours} Hours</span>
        </div>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  },

  renderAdminAudit() {
    const container = document.getElementById('admin-audit-logs');
    if (!container) return;

    const complaints = dataStore.getAllComplaints();
    const logs = [];

    complaints.forEach(c => {
      c.timeline.forEach(t => {
        logs.push({
          time: t.timestamp,
          text: `[${c.id}] Status -> ${t.status} by "${t.actor}" (${t.note})`
        });
      });
    });

    container.innerHTML = logs.slice(0, 10).map(l => `
      <div class="p-2.5 bg-slate-900 text-emerald-400 rounded-xl border border-slate-800">
        <span class="text-slate-500">[${l.time}]</span> ${l.text}
      </div>
    `).join('');
  },

  // Organization Registration Modal
  openAddOrgModal() {
    const modal = document.getElementById('register-org-modal');
    if (modal) modal.classList.remove('hidden');
  },

  closeAddOrgModal() {
    const modal = document.getElementById('register-org-modal');
    if (modal) modal.classList.add('hidden');
  },

  submitNewOrg() {
    const name = document.getElementById('new-org-name')?.value.trim();
    const type = document.getElementById('new-org-type')?.value;
    const zone = document.getElementById('new-org-zone')?.value.trim();
    const lead = document.getElementById('new-org-lead')?.value.trim();
    const phone = document.getElementById('new-org-phone')?.value.trim();

    if (!name) {
      this.showToast('Please enter an organization name.', 'warning');
      return;
    }

    dataStore.registerNewOrg({
      name: name,
      type: type,
      zone: zone || 'Metropolitan Ward 1-10',
      officerInCharge: lead || 'Authorized Lead',
      contact: phone || '+91 11 2345 6789'
    });

    this.closeAddOrgModal();
    this.showToast(`Organization "${name}" registered and verified!`, 'success');
    this.renderAdminOrgs();
  },

  // ================= NOTIFICATIONS DRAWER =================
  toggleNotifications() {
    const drawer = document.getElementById('notifications-drawer');
    drawer.classList.toggle('hidden');
    this.renderNotificationsList();
  },

  renderNotificationsList() {
    const list = document.getElementById('notifications-list');
    const badge = document.getElementById('notif-badge');
    if (!list) return;

    const notifs = dataStore.notifications;
    const unreadCount = notifs.filter(n => !n.read).length;

    if (badge) {
      if (unreadCount > 0) {
        badge.innerText = unreadCount;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }

    if (notifs.length === 0) {
      list.innerHTML = `<div class="p-6 text-center text-xs text-slate-400">No new notifications</div>`;
      return;
    }

    list.innerHTML = notifs.map(n => `
      <div class="p-3.5 hover:bg-blue-50 transition cursor-pointer ${n.read ? 'opacity-70' : 'bg-blue-50/40 font-medium'}" onclick="app.clickNotification('${n.complaintId}')">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-bold text-slate-900">${n.title}</span>
          <span class="text-[10px] text-slate-400">${n.time}</span>
        </div>
        <p class="text-xs text-slate-600 leading-snug">${n.message}</p>
      </div>
    `).join('');
  },

  clickNotification(complaintId) {
    if (complaintId) {
      this.toggleNotifications();
      this.viewComplaintDetails(complaintId);
    }
  },

  markAllNotificationsRead() {
    dataStore.markAllRead();
    this.renderNotificationsList();
    this.showToast('All notifications marked as read', 'info');
  },

  // Toast Notifications
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const bgColors = {
      success: 'bg-emerald-600 text-white',
      warning: 'bg-amber-600 text-white',
      error: 'bg-rose-600 text-white',
      info: 'bg-slate-900 text-white'
    };

    toast.className = `px-4 py-3 rounded-2xl shadow-xl ${bgColors[type] || bgColors.info} text-xs font-semibold flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0 pointer-events-auto`;
    toast.innerHTML = `
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 20);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
};

// Initialize App on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  app.init();
});
