/**
 * CivicPulse - Data Model and Mock Database Engine
 * Handles sample seeding, persistent localStorage synchronization, and query utilities.
 */

const STORAGE_KEY_COMPLAINTS = 'civicpulse_complaints_v1';
const STORAGE_KEY_ORGS = 'civicpulse_orgs_v1';
const STORAGE_KEY_NOTIFS = 'civicpulse_notifications_v1';

// Preset Categories with icon and designated department
const CIVIC_CATEGORIES = [
  { id: 'potholes', name: 'Roads & Potholes', icon: 'cone', dept: 'PWD & Road Works', slaHours: 24 },
  { id: 'garbage', name: 'Garbage & Waste', icon: 'trash-2', dept: 'Solid Waste Mgmt', slaHours: 12 },
  { id: 'streetlights', name: 'Broken Streetlights', icon: 'lightbulb', dept: 'Electricity Board', slaHours: 24 },
  { id: 'water_leak', name: 'Water Pipe Leakage', icon: 'droplet', dept: 'Water & Sewerage', slaHours: 8 },
  { id: 'drainage', name: 'Drainage & Sewer Clog', icon: 'waves', dept: 'Water & Sewerage', slaHours: 16 },
  { id: 'illegal_dumping', name: 'Illegal Debris Dumping', icon: 'alert-triangle', dept: 'Solid Waste Mgmt', slaHours: 24 },
  { id: 'traffic_sign', name: 'Traffic / Broken Signage', icon: 'signpost', dept: 'Traffic Infrastructure', slaHours: 48 },
  { id: 'parks', name: 'Parks & Public Spaces', icon: 'trees', dept: 'Horticulture & Parks', slaHours: 72 },
  { id: 'other', name: 'Other Civic Hazards', icon: 'help-circle', dept: 'General Municipal Corp', slaHours: 48 }
];

// Preset Organizations
const INITIAL_ORGS = [
  {
    id: 'org-pwd',
    name: 'Public Works & Road Maintenance Division',
    shortName: 'PWD & Roads',
    type: 'Municipal Department',
    zone: 'Central & South Municipal Zones',
    officerInCharge: 'Er. Rajesh Varma (Executive Engineer)',
    contact: '+91 11 2345 6789',
    verified: true,
    activeTickets: 8
  },
  {
    id: 'org-waste',
    name: 'Municipal Solid Waste & Sanitation Bureau',
    shortName: 'Solid Waste Mgmt',
    type: 'Municipal Department',
    zone: 'All City Wards (Zone 1 - 8)',
    officerInCharge: 'Dr. Sunita Rao (Chief Sanitation Officer)',
    contact: '+91 11 9876 5432',
    verified: true,
    activeTickets: 5
  },
  {
    id: 'org-water',
    name: 'City Jal Board & Water Infrastructure',
    shortName: 'Water & Sewerage',
    type: 'Public Utility Board',
    zone: 'Urban Metropolitan District',
    officerInCharge: 'Rameshwar Dayal (Zonal Director)',
    contact: '+91 11 5566 7788',
    verified: true,
    activeTickets: 4
  },
  {
    id: 'org-ngo-green',
    name: 'Clean City Green Life Citizen Foundation',
    shortName: 'CleanCity NGO',
    type: 'Verified NGO Partner',
    zone: 'Ward 40 to 45',
    officerInCharge: 'Meera Iyer (Operations Lead)',
    contact: '+91 98112 34567',
    verified: true,
    activeTickets: 2
  }
];

// Initial Realistic Complaints Seed Data
const INITIAL_COMPLAINTS = [
  {
    id: 'CIV-2026-000101',
    title: 'Hazardous deep crater pothole near Metro Station Gate 3',
    category: 'potholes',
    categoryName: 'Roads & Potholes',
    description: 'A deep 2.5-foot crater has developed directly in the right lane after the rain. Two two-wheelers have already skidded here this morning.',
    status: 'In Progress',
    priority: 'High',
    citizenName: 'Rahul Sharma',
    citizenContact: 'rahul.s@example.com',
    assignedOrgId: 'org-pwd',
    assignedOrgName: 'PWD & Road Works',
    location: {
      lat: 28.6145,
      lng: 77.2088,
      address: 'Near Metro Gate 3, Ring Road, Sector 14'
    },
    photoBefore: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    photoAfter: null,
    createdAt: '2026-08-19T08:30:00Z',
    updatedAt: '2026-08-20T09:15:00Z',
    timeline: [
      {
        status: 'Submitted',
        actor: 'Rahul Sharma (Citizen)',
        timestamp: '2026-08-19 08:30 AM',
        note: 'Issue reported with live camera capture and verified GPS coordinates.'
      },
      {
        status: 'Under Review',
        actor: 'Control Room Dispatcher',
        timestamp: '2026-08-19 09:45 AM',
        note: 'High severity verified. Pothole depth poses urgent safety hazard.'
      },
      {
        status: 'Assigned',
        actor: 'PWD Road Works',
        timestamp: '2026-08-19 11:20 AM',
        note: 'Assigned to Field Crew #4 (Lead Supervisor: Anil Kumar).'
      },
      {
        status: 'In Progress',
        actor: 'Field Supervisor Anil Kumar',
        timestamp: '2026-08-20 09:15 AM',
        note: 'Cold-mix asphalt patching team deployed on site with safety cones.'
      }
    ]
  },
  {
    id: 'CIV-2026-000098',
    title: 'Commercial garbage bin overflowing onto sidewalk',
    category: 'garbage',
    categoryName: 'Garbage & Waste',
    description: 'Sanitation bin has not been cleared for 3 days. Waste is spilling onto the pedestrian walking track and causing foul odor.',
    status: 'Resolved',
    priority: 'High',
    citizenName: 'Rahul Sharma',
    citizenContact: 'rahul.s@example.com',
    assignedOrgId: 'org-waste',
    assignedOrgName: 'Solid Waste Mgmt',
    location: {
      lat: 28.6210,
      lng: 77.2155,
      address: 'Main Market Square, Block B, Green Park'
    },
    photoBefore: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
    photoAfter: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-18T10:15:00Z',
    updatedAt: '2026-08-19T14:40:00Z',
    timeline: [
      {
        status: 'Submitted',
        actor: 'Rahul Sharma (Citizen)',
        timestamp: '2026-08-18 10:15 AM',
        note: 'Garbage accumulation reported.'
      },
      {
        status: 'Assigned',
        actor: 'Sanitation Bureau',
        timestamp: '2026-08-18 11:00 AM',
        note: 'Dispatched Compactor Truck Unit 12.'
      },
      {
        status: 'In Progress',
        actor: 'Sanitation Crew',
        timestamp: '2026-08-18 01:20 PM',
        note: 'Clearing waste and sanitizing area with disinfectant powder.'
      },
      {
        status: 'Resolved',
        actor: 'Dr. Sunita Rao (Sanitation Officer)',
        timestamp: '2026-08-19 02:40 PM',
        note: 'Sidewalk fully cleared and power-washed. Photographic proof uploaded.'
      }
    ]
  },
  {
    id: 'CIV-2026-000104',
    title: 'High-pressure clean water pipe bursting across street',
    category: 'water_leak',
    categoryName: 'Water Pipe Leakage',
    description: 'Main potable water supply pipe ruptured at junction. Gallons of drinking water flowing down the street for past 4 hours.',
    status: 'Submitted',
    priority: 'High',
    citizenName: 'Pooja Verma',
    citizenContact: 'pooja.v@example.com',
    assignedOrgId: 'org-water',
    assignedOrgName: 'Water & Sewerage',
    location: {
      lat: 28.6080,
      lng: 77.2210,
      address: 'Opposite Community Center, 5th Cross Road'
    },
    photoBefore: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
    photoAfter: null,
    createdAt: '2026-08-20T06:45:00Z',
    updatedAt: '2026-08-20T06:45:00Z',
    timeline: [
      {
        status: 'Submitted',
        actor: 'Pooja Verma (Citizen)',
        timestamp: '2026-08-20 06:45 AM',
        note: 'Urgent leak reported with live camera footage.'
      }
    ]
  },
  {
    id: 'CIV-2026-000095',
    title: '4 Consecutive LED Streetlights non-functional in dark lane',
    category: 'streetlights',
    categoryName: 'Broken Streetlights',
    description: 'The entire stretch from House 12 to 28 is pitch dark every evening, leading to safety concerns for female commuters.',
    status: 'In Progress',
    priority: 'Medium',
    citizenName: 'Rahul Sharma',
    citizenContact: 'rahul.s@example.com',
    assignedOrgId: 'org-pwd',
    assignedOrgName: 'Electricity Board',
    location: {
      lat: 28.6180,
      lng: 77.2020,
      address: 'Lane 4, Pocket C, Residential Colony'
    },
    photoBefore: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    photoAfter: null,
    createdAt: '2026-08-17T19:30:00Z',
    updatedAt: '2026-08-19T16:00:00Z',
    timeline: [
      {
        status: 'Submitted',
        actor: 'Rahul Sharma (Citizen)',
        timestamp: '2026-08-17 07:30 PM',
        note: 'Reported non-functional streetlights.'
      },
      {
        status: 'Under Review',
        actor: 'Control Room',
        timestamp: '2026-08-18 10:00 AM',
        note: 'Feeder pillar issue detected in electrical zone.'
      },
      {
        status: 'In Progress',
        actor: 'Electrical Lineman Team',
        timestamp: '2026-08-19 04:00 PM',
        note: 'Replacing shorted capacitor and LED luminaire drivers.'
      }
    ]
  },
  {
    id: 'CIV-2026-000089',
    title: 'Broken stormwater drainage cover creating open death trap',
    category: 'drainage',
    categoryName: 'Drainage & Sewer Clog',
    description: 'Concrete slab over 6-foot drain collapsed under heavy vehicle. Pedestrians could fall inside during night.',
    status: 'Resolved',
    priority: 'High',
    citizenName: 'Rahul Sharma',
    citizenContact: 'rahul.s@example.com',
    assignedOrgId: 'org-pwd',
    assignedOrgName: 'PWD & Road Works',
    location: {
      lat: 28.6250,
      lng: 77.2050,
      address: 'Corner of Avenue 9 and 2nd Crossway'
    },
    photoBefore: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    photoAfter: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-15T11:00:00Z',
    updatedAt: '2026-08-17T17:30:00Z',
    timeline: [
      {
        status: 'Submitted',
        actor: 'Rahul Sharma (Citizen)',
        timestamp: '2026-08-15 11:00 AM',
        note: 'Complaint filed.'
      },
      {
        status: 'In Progress',
        actor: 'PWD Concrete Team',
        timestamp: '2026-08-16 09:30 AM',
        note: 'Reinforced concrete slab cast and placed over drain.'
      },
      {
        status: 'Resolved',
        actor: 'Er. Rajesh Varma (PWD)',
        timestamp: '2026-08-17 05:30 PM',
        note: 'Heavy-duty steel-reinforced cover installed and leveled with road surface.'
      }
    ]
  },
  {
    id: 'CIV-2026-000106',
    title: 'Broken swings and shattered glass in Children Public Park',
    category: 'parks',
    categoryName: 'Parks & Public Spaces',
    description: 'Children swing chains are broken with sharp rusted edges. Broken glass bottles littered around sandbox area.',
    status: 'Under Review',
    priority: 'Medium',
    citizenName: 'Amit Trivedi',
    citizenContact: 'amit.t@example.com',
    assignedOrgId: 'org-ngo-green',
    assignedOrgName: 'CleanCity NGO',
    location: {
      lat: 28.6110,
      lng: 77.2180,
      address: 'Central Park Gate 2, Mayur Vihar'
    },
    photoBefore: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    photoAfter: null,
    createdAt: '2026-08-20T07:15:00Z',
    updatedAt: '2026-08-20T08:00:00Z',
    timeline: [
      {
        status: 'Submitted',
        actor: 'Amit Trivedi',
        timestamp: '2026-08-20 07:15 AM',
        note: 'Reported with photos.'
      },
      {
        status: 'Under Review',
        actor: 'Horticulture Team',
        timestamp: '2026-08-20 08:00 AM',
        note: 'Coordinating with local citizen foundation for safety sweep.'
      }
    ]
  }
];

// Initial In-App Notifications
const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Official Proof Uploaded',
    message: 'PWD uploaded after-work evidence photo for complaint CIV-2026-000089 (Drainage Cover).',
    time: '10 mins ago',
    read: false,
    complaintId: 'CIV-2026-000089',
    type: 'resolved'
  },
  {
    id: 'notif-2',
    title: 'Field Team Deployed',
    message: 'Field Crew #4 dispatched for your Pothole complaint CIV-2026-000101.',
    time: '2 hours ago',
    read: false,
    complaintId: 'CIV-2026-000101',
    type: 'progress'
  },
  {
    id: 'notif-3',
    title: 'New Complaint Registered',
    message: 'Water Pipe Leakage ticket CIV-2026-000104 logged successfully.',
    time: '3 hours ago',
    read: true,
    complaintId: 'CIV-2026-000104',
    type: 'submitted'
  }
];

// Data Store Controller
const dataStore = {
  complaints: [],
  orgs: [],
  notifications: [],

  init() {
    // Load from localStorage or seed
    const cachedComplaints = localStorage.getItem(STORAGE_KEY_COMPLAINTS);
    if (cachedComplaints) {
      try {
        this.complaints = JSON.parse(cachedComplaints);
      } catch (e) {
        this.complaints = [...INITIAL_COMPLAINTS];
      }
    } else {
      this.complaints = [...INITIAL_COMPLAINTS];
      this.saveComplaints();
    }

    const cachedOrgs = localStorage.getItem(STORAGE_KEY_ORGS);
    if (cachedOrgs) {
      try {
        this.orgs = JSON.parse(cachedOrgs);
      } catch (e) {
        this.orgs = [...INITIAL_ORGS];
      }
    } else {
      this.orgs = [...INITIAL_ORGS];
      this.saveOrgs();
    }

    const cachedNotifs = localStorage.getItem(STORAGE_KEY_NOTIFS);
    if (cachedNotifs) {
      try {
        this.notifications = JSON.parse(cachedNotifs);
      } catch (e) {
        this.notifications = [...INITIAL_NOTIFICATIONS];
      }
    } else {
      this.notifications = [...INITIAL_NOTIFICATIONS];
      this.saveNotifications();
    }
  },

  saveComplaints() {
    localStorage.setItem(STORAGE_KEY_COMPLAINTS, JSON.stringify(this.complaints));
  },

  saveOrgs() {
    localStorage.setItem(STORAGE_KEY_ORGS, JSON.stringify(this.orgs));
  },

  saveNotifications() {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(this.notifications));
  },

  getAllComplaints() {
    return this.complaints;
  },

  getComplaintById(id) {
    return this.complaints.find(c => c.id === id);
  },

  addComplaint(complaint) {
    this.complaints.unshift(complaint);
    this.saveComplaints();

    // Add corresponding notification
    this.addNotification({
      title: 'Complaint Registered',
      message: `Your issue "${complaint.title.substring(0, 30)}..." has been logged as ${complaint.id}.`,
      complaintId: complaint.id,
      type: 'submitted'
    });

    return complaint;
  },

  updateComplaintStatus(id, newStatus, note, actorName, evidencePhoto = null) {
    const complaint = this.getComplaintById(id);
    if (!complaint) return false;

    complaint.status = newStatus;
    complaint.updatedAt = new Date().toISOString();

    if (evidencePhoto) {
      complaint.photoAfter = evidencePhoto;
    }

    const nowStr = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    complaint.timeline.push({
      status: newStatus,
      actor: actorName || 'Authorized Officer',
      timestamp: nowStr,
      note: note || `Status updated to ${newStatus}`
    });

    this.saveComplaints();

    // Add alert notification
    this.addNotification({
      title: `Status: ${newStatus}`,
      message: `Complaint ${complaint.id} was updated to "${newStatus}" by ${actorName || 'Authority'}.`,
      complaintId: complaint.id,
      type: newStatus.toLowerCase().replace(/\s+/g, '_')
    });

    return true;
  },

  addNotification(notif) {
    const item = {
      id: 'notif-' + Date.now(),
      title: notif.title,
      message: notif.message,
      time: 'Just now',
      read: false,
      complaintId: notif.complaintId || null,
      type: notif.type || 'info'
    };
    this.notifications.unshift(item);
    this.saveNotifications();
  },

  markAllRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
  },

  generateComplaintId() {
    const num = this.complaints.length + 107;
    return `CIV-2026-${String(num).padStart(6, '0')}`;
  },

  resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY_COMPLAINTS);
    localStorage.removeItem(STORAGE_KEY_ORGS);
    localStorage.removeItem(STORAGE_KEY_NOTIFS);
    this.init();
  }
};

// Initialize on script load
dataStore.init();
