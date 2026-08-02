/* ==========================================================================
   HACKATHONHUB - ULTRA-PREMIUM INTERACTIVE ENGINE & REAL-TIME SYNC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  initLiveClock();
  initAutoSuggestSearch();
  initMultiFilters();
  initNotificationCenter();
  initRegisterTriggers();
  initMobileDrawer();
  initStudentReviewCarousel();
  initCertificateVerification();
  initFaqAccordion();
  initAdminAuth();
  initLiveAnnouncementSync();
  renderDynamicEventsOnIndex();
  populateOpportunityDropdowns();
});

/* --------------------------------------------------------------------------
   0. LIVE ACCURATE CLOCK & CALENDAR ENGINE (IST FORMAT)
   -------------------------------------------------------------------------- */
function getLiveDateTimeString() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear();
  
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = String(hours).padStart(2, '0');

  return `📅 ${day} ${month} ${year} • ⏰ ${formattedHours}:${minutes}:${seconds} ${ampm} IST`;
}

function initLiveClock() {
  const clockEl = document.getElementById('live-form-clock');
  const adminClockEl = document.getElementById('admin-live-clock');

  function updateClocks() {
    const liveStr = getLiveDateTimeString();
    if (clockEl) clockEl.textContent = liveStr;
    if (adminClockEl) adminClockEl.textContent = liveStr;
  }

  updateClocks();
  setInterval(updateClocks, 1000);
}

/* --------------------------------------------------------------------------
   0. DYNAMIC ALL-OPPORTUNITIES DROPDOWN ENGINE
   -------------------------------------------------------------------------- */
const defaultOpportunityTracks = [
  'IIT Bombay Techfest AI Hackathon [FREE]',
  'CU HackNation 2026 National Coding Championship [FREE]',
  'Agentic & Generative AI Workshop [PAID]',
  'IIT Delhi Tryst Coding Sprint [FREE]',
  'AIIMS MedTech Innovation Summit [FREE]',
  'BITS Pilani APOGEE Case Challenge [FREE]',
  'CU Super-30 Placement & Hiring Drive [FREE]',
  'Cybersecurity & Ethical Hacking Masterclass [PAID]',
  'Full-Stack Web3 & Blockchain Internship [PAID]',
  'AI/ML Career Guidance National Webinar [FREE]',
  'UI/UX Design & Product Prototyping Challenge [FREE]',
  'EV & Quantum Computing Research Bootcamp [PAID]',
  'Other Custom Opportunity Track'
];

async function populateOpportunityDropdowns() {
  const userSelect = document.getElementById('course');
  const adminManualSelect = document.getElementById('m-course');
  const adminFilterSelect = document.getElementById('filter-course');

  const domTitles = [];
  document.querySelectorAll('.opp-card').forEach(card => {
    const titleEl = card.querySelector('.opp-title');
    const feeTag = card.querySelector('.opp-tag');
    if (titleEl) {
      const titleText = titleEl.textContent.trim();
      const feeText = feeTag ? feeTag.textContent.trim().toUpperCase() : '';
      const formattedOption = feeText ? `${titleText} [${feeText}]` : titleText;
      domTitles.push(formattedOption);
      domTitles.push(titleText);
    }
  });

  const publishedEvents = await getEvents();
  const customEventTitles = publishedEvents.flatMap(e => [
    `${e.title} [${(e.fee || 'free').toUpperCase()}]`,
    e.title
  ]);

  const allTracks = Array.from(new Set([
    ...domTitles,
    ...customEventTitles,
    ...defaultOpportunityTracks
  ])).filter(Boolean);

  if (userSelect) {
    const selectedVal = userSelect.value;
    userSelect.innerHTML = '<option value="" disabled selected>Select Opportunity Track / Event</option>';
    allTracks.forEach(track => {
      const opt = document.createElement('option');
      opt.value = track;
      opt.textContent = track;
      userSelect.appendChild(opt);
    });
    if (selectedVal) userSelect.value = selectedVal;
  }

  if (adminManualSelect) {
    const selectedVal = adminManualSelect.value;
    adminManualSelect.innerHTML = '';
    allTracks.forEach(track => {
      const opt = document.createElement('option');
      opt.value = track;
      opt.textContent = track;
      adminManualSelect.appendChild(opt);
    });
    if (selectedVal) adminManualSelect.value = selectedVal;
  }

  if (adminFilterSelect) {
    const selectedVal = adminFilterSelect.value;
    adminFilterSelect.innerHTML = '<option value="all">All Opportunity Tracks</option>';
    allTracks.forEach(track => {
      const opt = document.createElement('option');
      opt.value = track;
      opt.textContent = track;
      adminFilterSelect.appendChild(opt);
    });
    if (selectedVal) adminFilterSelect.value = selectedVal;
  }
}

/* --------------------------------------------------------------------------
   0. Admin Authentication & Session Management
   -------------------------------------------------------------------------- */
function initAdminAuth() {
  const authScreen = document.getElementById('admin-auth-screen');
  const mainLayout = document.getElementById('admin-main-layout');
  const loginForm = document.getElementById('admin-login-form');
  const errorMsg = document.getElementById('auth-error-msg');

  if (!authScreen || !mainLayout) return;

  const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
  const savedEmail = sessionStorage.getItem('admin_email') || 'sanjayjatchoudhary0@gmail.com';
  const loggedEmailEl = document.getElementById('admin-logged-email');
  if (loggedEmailEl) loggedEmailEl.textContent = savedEmail;

  if (isAuth) {
    authScreen.classList.add('hidden');
    mainLayout.classList.remove('hidden');
    initAdminPanel();
  } else {
    authScreen.classList.remove('hidden');
    mainLayout.classList.add('hidden');
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('admin_email').value.trim().toLowerCase();
      const password = document.getElementById('admin_password').value.trim();

      let authenticated = false;
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok && data.success) authenticated = true;
      } catch (err) {}

      const isEmailAdmin = email.includes('sanjay') || email.includes('admin') || email.includes('cu');
      const isPasswordCorrect = password === 'Sanjay@9351294898';

      if (authenticated || (isEmailAdmin && isPasswordCorrect)) {
        sessionStorage.setItem('admin_authenticated', 'true');
        sessionStorage.setItem('admin_email', email);
        if (loggedEmailEl) loggedEmailEl.textContent = email;
        authScreen.classList.add('hidden');
        mainLayout.classList.remove('hidden');
        if (errorMsg) errorMsg.classList.add('hidden');
        initAdminPanel();
      } else {
        if (errorMsg) {
          errorMsg.classList.remove('hidden');
          errorMsg.innerHTML = '❌ Incorrect Admin Password! Access Denied.';
        }
      }
    });
  }
}

function logoutAdmin() {
  sessionStorage.removeItem('admin_authenticated');
  window.location.href = 'admin.html';
}

/* --------------------------------------------------------------------------
   0. Database Sync Engine (MongoDB Atlas API + LocalStorage Fallback)
   -------------------------------------------------------------------------- */
async function initStorage() {
  try {
    const res = await fetch('/api/enquiries');
    if (res.ok) {
      console.log('⚡ MongoDB Atlas API Live Sync Active!');
      return;
    }
  } catch (e) {
    console.log('ℹ️ Running in LocalStorage fallback mode.');
  }

  if (!localStorage.getItem('cu_enquiries')) {
    const initialEnquiries = [
      {
        id: 'CU-LEAD-9012',
        date: getLiveDateTimeString(),
        name: 'Amanpreet Kaur',
        email: 'amanpreet.cse@cuchd.in',
        phone: '9351294898',
        course: 'CU HackNation 2026 [FREE]',
        college: 'Chandigarh University',
        message: 'Team Lead: Tech Titans. Members: Aman, Rahul, Priya, Vikas.',
        status: 'Confirmed'
      },
      {
        id: 'CU-LEAD-9013',
        date: getLiveDateTimeString(),
        name: 'Rohan Sharma',
        email: 'rohan.sharma@gmail.com',
        phone: '9812345678',
        course: 'IIT Bombay Techfest AI Hackathon [FREE]',
        college: 'Chandigarh University',
        message: 'Applying for AI Drone robotics competition. Github: https://github.com/rohan/ai-drone',
        status: 'Pending'
      }
    ];
    localStorage.setItem('cu_enquiries', JSON.stringify(initialEnquiries));
  }

  if (!localStorage.getItem('cu_notifications')) {
    const initialNotifs = [
      {
        id: 'NOTIF-101',
        title: '🎉 Application Approved!',
        body: 'Your registration for CU HackNation 2026 has been accepted by the Coordinator.',
        time: 'Just now',
        read: false
      }
    ];
    localStorage.setItem('cu_notifications', JSON.stringify(initialNotifs));
  }

  if (!localStorage.getItem('cu_events')) {
    const initialEvents = [
      {
        id: 'EV-101',
        title: 'IIT Bombay Techfest AI Hackathon',
        category: 'hackathon',
        fee: 'free',
        organizer: 'Techfest, IIT Bombay',
        prize: '₹3,50,000 Cash',
        desc: 'National robotics & AI innovation battle in autonomous drones.',
        location: 'Mumbai, Maharashtra',
        inst: 'iit'
      }
    ];
    localStorage.setItem('cu_events', JSON.stringify(initialEvents));
  }
}

async function getEnquiries() {
  try {
    const res = await fetch('/api/enquiries');
    if (res.ok) return await res.json();
  } catch (e) {}
  return JSON.parse(localStorage.getItem('cu_enquiries') || '[]');
}

async function saveEnquiryItem(item) {
  try {
    const res = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  const enquiries = JSON.parse(localStorage.getItem('cu_enquiries') || '[]');
  enquiries.unshift(item);
  localStorage.setItem('cu_enquiries', JSON.stringify(enquiries));
  return item;
}

async function getNotifications() {
  try {
    const res = await fetch('/api/notifications');
    if (res.ok) return await res.json();
  } catch (e) {}
  return JSON.parse(localStorage.getItem('cu_notifications') || '[]');
}

async function saveNotificationItem(item) {
  try {
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  const notifs = JSON.parse(localStorage.getItem('cu_notifications') || '[]');
  notifs.unshift(item);
  localStorage.setItem('cu_notifications', JSON.stringify(notifs));
  return item;
}

async function getEvents() {
  try {
    const res = await fetch('/api/events');
    if (res.ok) return await res.json();
  } catch (e) {}
  return JSON.parse(localStorage.getItem('cu_events') || '[]');
}

async function saveEventItem(item) {
  try {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  const events = JSON.parse(localStorage.getItem('cu_events') || '[]');
  events.unshift(item);
  localStorage.setItem('cu_events', JSON.stringify(events));
  return item;
}

/* --------------------------------------------------------------------------
   Render Dynamic Events onto Opportunity Cards Grid
   -------------------------------------------------------------------------- */
async function renderDynamicEventsOnIndex() {
  const grid = document.getElementById('opportunities-grid');
  if (!grid) return;

  const events = await getEvents();
  const customEvents = events.filter(e => !['EV-101', 'EV-102', 'EV-103'].includes(e.id));

  customEvents.forEach(ev => {
    if (document.getElementById(`custom-card-${ev.id}`)) return;

    const div = document.createElement('div');
    div.id = `custom-card-${ev.id}`;
    div.className = 'opp-card';
    div.setAttribute('data-category', ev.category || 'hackathon');
    div.setAttribute('data-fee', ev.fee || 'free');
    div.setAttribute('data-inst', ev.inst || 'cu');
    div.setAttribute('data-location', ev.location || 'Pan-India');
    div.setAttribute('data-college', ev.organizer || 'Chandigarh University');

    const isFree = ev.fee === 'free';

    div.innerHTML = `
      <div class="opp-header-banner bg-gradient-blue">
        <div class="opp-status-pill ${isFree ? 'pill-free' : 'pill-paid'}">${isFree ? '🎁 100% FREE REGISTRATION' : '📜 CERTIFICATION WORKSHOP'}</div>
        <div class="opp-category-badge">${escapeHtml((ev.organizer || 'CU').toUpperCase())}</div>
        <div class="opp-banner-icon">🌟</div>
      </div>
      <div class="opp-body">
        <div class="opp-organizer">
          <span class="org-logo">NEW</span>
          <span class="org-name">${escapeHtml(ev.organizer)}</span>
        </div>
        <h3 class="opp-title">${escapeHtml(ev.title)}</h3>
        <p class="opp-desc">${escapeHtml(ev.desc)}</p>

        <div class="opp-meta-list">
          <div class="opp-meta-item">
            <span class="meta-icon">🏆</span>
            <span><strong>Reward:</strong> ${escapeHtml(ev.prize)}</span>
          </div>
          <div class="opp-meta-item">
            <span class="meta-icon">📍</span>
            <span><strong>Location:</strong> ${escapeHtml(ev.location)}</span>
          </div>
        </div>

        <div class="opp-tags-row">
          <span class="opp-tag ${isFree ? 'tag-free' : ''}">${isFree ? '100% FREE' : 'Paid'}</span>
          <span class="opp-tag">${escapeHtml(ev.organizer)}</span>
        </div>

        <div class="opp-footer">
          <div class="deadline-wrap">
            <span class="d-lbl">Registration Fee</span>
            <span class="d-val ${isFree ? 'text-green' : 'text-red'}">${isFree ? 'FREE' : 'Paid'}</span>
          </div>
          <a href="#register" class="btn btn-primary btn-sm register-trigger-btn" data-event="${escapeHtml(ev.title)}">Register Now</a>
        </div>
      </div>
    `;

    grid.prepend(div);
  });

  await populateOpportunityDropdowns();
}

/* --------------------------------------------------------------------------
   1. AUTO-SUGGEST LOCATION & UNIVERSITY SEARCH ENGINE
   -------------------------------------------------------------------------- */
const suggestDatabase = [
  { type: 'location', title: 'Mohali, Punjab', sub: 'Chandigarh University Main Campus', query: 'Mohali' },
  { type: 'location', title: 'Mumbai, Maharashtra', sub: 'IIT Bombay Campus & Online', query: 'Mumbai' },
  { type: 'location', title: 'New Delhi', sub: 'IIT Delhi & AIIMS New Delhi Campus', query: 'Delhi' },
  { type: 'location', title: 'Pilani, Rajasthan', sub: 'BITS Pilani Campus', query: 'Pilani' },
  
  { type: 'college', title: 'Chandigarh University', sub: 'Mohali, Punjab • NAAC A+ Accredited', query: 'Chandigarh University' },
  { type: 'college', title: 'IIT Bombay', sub: 'Mumbai, Maharashtra • Techfest 2026', query: 'IIT Bombay' },
  { type: 'college', title: 'IIT Delhi', sub: 'New Delhi • Tryst 2026 Sprint', query: 'IIT Delhi' },
  { type: 'college', title: 'AIIMS New Delhi', sub: 'New Delhi • MedTech Innovation', query: 'AIIMS' },
  { type: 'college', title: 'BITS Pilani', sub: 'Pilani, Rajasthan • APOGEE Summit', query: 'BITS Pilani' },

  { type: 'event', title: 'CU HackNation 2026', sub: '24-Hour Hackathon (Mohali, Punjab)', query: 'HackNation' },
  { type: 'event', title: 'Agentic & Generative AI Workshop', sub: 'Edufabrica Practical Bootcamp', query: 'Agentic AI' },
  { type: 'event', title: 'IIT Bombay Techfest AI Hackathon', sub: 'Robotics & Autonomous AI', query: 'Techfest' },
  { type: 'event', title: 'CU Super-30 Placement Challenge', sub: 'Software SDE Hiring Drive', query: 'Placement' }
];

function initAutoSuggestSearch() {
  const searchInput = document.getElementById('hero-opportunity-search');
  const searchBtn = document.querySelector('.search-box-btn');
  const dropdown = document.getElementById('search-autocomplete');

  if (!searchInput) return;

  function executeSearchAndScroll(queryVal) {
    if (dropdown) dropdown.classList.add('hidden');
    searchQuery = (queryVal || searchInput.value || '').toLowerCase().trim();
    applyFilters();

    const targetSection = document.getElementById('opportunities');
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  searchInput.addEventListener('input', () => {
    const val = searchInput.value.toLowerCase().trim();
    searchQuery = val;
    applyFilters();

    if (!dropdown) return;

    if (val.length < 1) {
      dropdown.classList.add('hidden');
      return;
    }

    const matches = suggestDatabase.filter(item => {
      return item.title.toLowerCase().includes(val) ||
             item.sub.toLowerCase().includes(val) ||
             item.query.toLowerCase().includes(val);
    });

    if (matches.length === 0) {
      dropdown.classList.add('hidden');
      return;
    }

    dropdown.innerHTML = `<div class="suggest-category-header">Matched Locations & Universities</div>`;

    matches.forEach(item => {
      const div = document.createElement('div');
      div.className = 'suggest-item';
      const icon = item.type === 'location' ? '📍' : item.type === 'college' ? '🏛️' : '🏆';
      div.innerHTML = `
        <span class="suggest-icon">${icon}</span>
        <div class="suggest-info">
          <div class="suggest-title">${escapeHtml(item.title)}</div>
          <div class="suggest-sub">${escapeHtml(item.sub)}</div>
        </div>
      `;
      div.addEventListener('click', () => {
        searchInput.value = item.query;
        executeSearchAndScroll(item.query);
      });
      dropdown.appendChild(div);
    });

    dropdown.classList.remove('hidden');
  });

  if (searchBtn) {
    searchBtn.addEventListener('click', () => executeSearchAndScroll());
  }

  document.addEventListener('click', (e) => {
    if (dropdown && !dropdown.contains(e.target) && e.target !== searchInput) {
      dropdown.classList.add('hidden');
    }
  });
}

/* --------------------------------------------------------------------------
   2. MULTI-FILTER SHOWCASE ENGINE
   -------------------------------------------------------------------------- */
let activeCategory = 'all';
let activeFee = 'all';
let activeInst = 'all';
let searchQuery = '';

function initMultiFilters() {
  const catTabs = document.querySelectorAll('.unstop-tab');
  const feeTabs = document.querySelectorAll('.fee-tab');
  const instTabs = document.querySelectorAll('.inst-tab');

  catTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      catTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.getAttribute('data-category');
      applyFilters();
    });
  });

  feeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      feeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFee = tab.getAttribute('data-fee');
      applyFilters();
    });
  });

  instTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      instTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeInst = tab.getAttribute('data-inst');
      applyFilters();
    });
  });
}

function applyFilters() {
  const cards = document.querySelectorAll('.opp-card');
  const grid = document.getElementById('opportunities-grid');

  let visibleCount = 0;
  const terms = searchQuery ? searchQuery.split(/\s+/).filter(Boolean) : [];

  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category') || 'all';
    const cardFee = card.getAttribute('data-fee') || 'all';
    const cardInst = card.getAttribute('data-inst') || 'all';
    const cardLocation = (card.getAttribute('data-location') || '').toLowerCase();
    const cardCollege = (card.getAttribute('data-college') || '').toLowerCase();
    const cardText = card.textContent.toLowerCase();

    const matchesCat = activeCategory === 'all' || cardCat === activeCategory;
    const matchesFee = activeFee === 'all' || cardFee === activeFee;
    const matchesInst = activeInst === 'all' || cardInst === activeInst;

    let matchesSearch = true;
    if (terms.length > 0) {
      matchesSearch = terms.every(term => {
        return cardText.includes(term) || cardLocation.includes(term) || cardCollege.includes(term);
      });
    }

    if (matchesCat && matchesFee && matchesInst && matchesSearch) {
      card.style.display = 'flex';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  let emptyStateMsg = document.getElementById('search-empty-state');
  if (!emptyStateMsg && grid) {
    emptyStateMsg = document.createElement('div');
    emptyStateMsg.id = 'search-empty-state';
    emptyStateMsg.className = 'text-center hidden';
    emptyStateMsg.style.cssText = 'grid-column: 1 / -1; padding: 3rem; background: #FFF; border-radius: 16px; border: 1px solid #E2E8F0; width: 100%;';
    emptyStateMsg.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 0.5rem;">🔍</div>
      <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--primary-navy); margin-bottom: 0.5rem;">No Opportunities Found</h3>
      <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.25rem;">We couldn't find events matching your search filters.</p>
      <button class="btn btn-secondary btn-sm" onclick="resetAllFilters()">Reset Search Filters</button>
    `;
    grid.appendChild(emptyStateMsg);
  }

  if (emptyStateMsg) {
    if (visibleCount === 0) emptyStateMsg.classList.remove('hidden');
    else emptyStateMsg.classList.add('hidden');
  }
}

function resetAllFilters() {
  const searchInput = document.getElementById('hero-opportunity-search');
  if (searchInput) searchInput.value = '';
  searchQuery = '';
  activeCategory = 'all';
  activeFee = 'all';
  activeInst = 'all';

  document.querySelectorAll('.unstop-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.fee-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.inst-tab').forEach(t => t.classList.remove('active'));

  document.querySelector('.unstop-tab[data-category="all"]')?.classList.add('active');
  document.querySelector('.fee-tab[data-fee="all"]')?.classList.add('active');
  document.querySelector('.inst-tab[data-inst="all"]')?.classList.add('active');

  applyFilters();
}

/* --------------------------------------------------------------------------
   3. STUDENT NOTIFICATION POPOVER DROPDOWN
   -------------------------------------------------------------------------- */
function initNotificationCenter() {
  const bellBtn = document.getElementById('notif-bell-btn');
  const dropdown = document.getElementById('notif-dropdown');
  const closeBtn = document.getElementById('modal-notif-close');
  const markReadBtn = document.getElementById('btn-mark-all-read');
  const badgeCountEl = document.getElementById('notif-badge-count');
  const countTextEl = document.getElementById('notif-count-text');
  const notifListEl = document.getElementById('notif-list');

  const toastEl = document.getElementById('notif-toast');
  const toastCloseBtn = document.getElementById('toast-close-btn');

  renderNotifications();

  if (bellBtn && dropdown) {
    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });
  }
  if (closeBtn && dropdown) {
    closeBtn.addEventListener('click', () => dropdown.classList.add('hidden'));
  }

  document.addEventListener('click', (e) => {
    if (dropdown && !dropdown.contains(e.target) && bellBtn && !bellBtn.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });

  if (markReadBtn) {
    markReadBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      if (badgeCountEl) {
        badgeCountEl.textContent = '0';
        badgeCountEl.style.display = 'none';
      }
      if (countTextEl) countTextEl.textContent = '0 Unread Notifications';
      document.querySelectorAll('.notif-item').forEach(el => el.classList.remove('unread'));

      try {
        const notifs = JSON.parse(localStorage.getItem('cu_notifications') || '[]');
        notifs.forEach(n => n.read = true);
        localStorage.setItem('cu_notifications', JSON.stringify(notifs));
      } catch (err) {}

      try {
        await fetch('/api/notifications/read', { method: 'PATCH' });
      } catch (err) {}
    });
  }

  if (toastCloseBtn && toastEl) {
    toastCloseBtn.addEventListener('click', () => toastEl.classList.add('hidden'));
  }

  window.addEventListener('storage', async () => {
    await renderNotifications();
  });

  async function renderNotifications() {
    const notifs = await getNotifications();
    const unread = notifs.filter(n => !n.read).length;

    if (badgeCountEl) {
      badgeCountEl.textContent = unread;
      if (unread === 0) badgeCountEl.style.display = 'none';
      else badgeCountEl.style.display = 'flex';
    }
    if (countTextEl) countTextEl.textContent = `${unread} Unread Notifications`;

    if (!notifListEl) return;
    notifListEl.innerHTML = '';

    if (notifs.length === 0) {
      notifListEl.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #64748B;">
          📭 No notifications yet.
        </div>
      `;
      return;
    }

    notifs.forEach(item => {
      const div = document.createElement('div');
      div.className = `notif-item ${item.read ? '' : 'unread'}`;
      div.innerHTML = `
        <div class="notif-icon-wrap">🎉</div>
        <div class="notif-content-wrap">
          <h4 class="notif-title">${escapeHtml(item.title)}</h4>
          <p class="notif-body-text">${escapeHtml(item.body)}</p>
          <span class="notif-time">${item.time}</span>
        </div>
      `;
      notifListEl.appendChild(div);
    });
  }
}

function showToastNotification(title, body) {
  const toastEl = document.getElementById('notif-toast');
  const toastTitleEl = document.getElementById('toast-title');
  const toastBodyEl = document.getElementById('toast-body');

  if (!toastEl) return;
  if (toastTitleEl) toastTitleEl.textContent = title;
  if (toastBodyEl) toastBodyEl.textContent = body;

  toastEl.classList.remove('hidden');
  setTimeout(() => {
    toastEl.classList.add('hidden');
  }, 6000);
}

/* --------------------------------------------------------------------------
   4. LIVE ANNOUNCEMENT SYNC ENGINE
   -------------------------------------------------------------------------- */
function initLiveAnnouncementSync() {
  const savedMsg = localStorage.getItem('cu_announcement_text');
  const savedBadge = localStorage.getItem('cu_announcement_badge');

  if (savedMsg) {
    document.querySelectorAll('.announcement-text').forEach(el => el.textContent = savedMsg);
  }
  if (savedBadge) {
    document.querySelectorAll('.badge-new').forEach(el => el.textContent = savedBadge);
  }
}

/* --------------------------------------------------------------------------
   5. Student Registration Form Submission
   -------------------------------------------------------------------------- */
function initRegisterTriggers() {
  const courseSelect = document.getElementById('course');
  const enquiryForm = document.getElementById('enquiry-form');

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.register-trigger-btn');
    if (btn && courseSelect) {
      const eventName = btn.getAttribute('data-event');
      if (eventName) {
        let matched = false;
        const searchName = eventName.toLowerCase().trim();

        for (let i = 0; i < courseSelect.options.length; i++) {
          const optText = courseSelect.options[i].text.toLowerCase();
          const optVal = courseSelect.options[i].value.toLowerCase();
          if (optText.includes(searchName) || optVal.includes(searchName)) {
            courseSelect.selectedIndex = i;
            matched = true;
            break;
          }
        }

        if (!matched) {
          const newOpt = document.createElement('option');
          newOpt.value = eventName;
          newOpt.textContent = eventName;
          courseSelect.appendChild(newOpt);
          courseSelect.value = eventName;
        }
      }
    }
  });

  if (enquiryForm) {
    enquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const newApplication = {
        id: 'CU-LEAD-' + Math.floor(1000 + Math.random() * 9000),
        date: getLiveDateTimeString(),
        name: document.getElementById('full_name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        course: document.getElementById('course').value,
        college: document.getElementById('college').value.trim() || 'All India College',
        message: document.getElementById('message').value.trim() || 'No additional notes',
        status: 'Pending'
      };

      await saveEnquiryItem(newApplication);

      const modal = document.getElementById('success-modal');
      const modalMsg = document.getElementById('success-modal-msg');
      if (modalMsg) {
        modalMsg.innerHTML = `
          Thank you <strong>${escapeHtml(newApplication.name)}</strong>! Your application for <strong>${escapeHtml(newApplication.course)}</strong> has been registered on <span style="color: var(--brand-cyan); font-weight: 800;">${newApplication.date}</span>.
        `;
      }
      if (modal) modal.classList.remove('hidden');

      enquiryForm.reset();
    });

    const modalCloseBtn = document.getElementById('modal-success-close');
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => {
        document.getElementById('success-modal')?.classList.add('hidden');
      });
    }
  }
}

/* --------------------------------------------------------------------------
   6. Mobile Drawer Navigation
   -------------------------------------------------------------------------- */
function initMobileDrawer() {
  const toggleBtn = document.getElementById('menu-toggle-btn');
  const closeBtn = document.getElementById('menu-close-btn');
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('mobile-overlay');

  if (!drawer || !overlay) return;

  function openDrawer() {
    drawer.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  document.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/* --------------------------------------------------------------------------
   7. STUDENT REVIEW COMMENTS & STRICT ADMIN APPROVAL MODERATION ENGINE
   -------------------------------------------------------------------------- */
async function getReviews() {
  let reviews = [];
  try {
    const res = await fetch('/api/reviews');
    if (res.ok) {
      reviews = await res.json();
    } else {
      reviews = JSON.parse(localStorage.getItem('cu_reviews') || '[]');
    }
  } catch (e) {
    reviews = JSON.parse(localStorage.getItem('cu_reviews') || '[]');
  }

  // Ensure every review has an explicit status (defaulting to 'Pending' if missing)
  return reviews.map(r => ({
    ...r,
    status: r.status || 'Pending'
  }));
}

async function saveReviewItem(item) {
  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  const reviews = JSON.parse(localStorage.getItem('cu_reviews') || '[]');
  reviews.unshift(item);
  localStorage.setItem('cu_reviews', JSON.stringify(reviews));
  return item;
}

function initStudentReviewCarousel() {
  const track = document.getElementById('testimonial-track');
  const form = document.getElementById('student-review-form');

  if (!track) return;

  renderReviews();

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('rev_name').value.trim();
      const detail = document.getElementById('rev_detail').value.trim();
      const ratingVal = parseInt(document.getElementById('rev_rating').value, 10);
      const comment = document.getElementById('rev_comment').value.trim();

      const stars = '⭐'.repeat(ratingVal);
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'ST';

      // STRICT PENDING STATUS: Comment will ONLY go to Admin Panel and WILL NOT display on student panel until Admin approves!
      const newReview = {
        id: 'REV-' + Date.now(),
        name,
        detail,
        rating: stars,
        comment,
        initials,
        date: getLiveDateTimeString(),
        status: 'Pending'
      };

      await saveReviewItem(newReview);
      form.reset();

      await saveNotificationItem({
        id: 'NOTIF-' + Date.now(),
        title: '💬 New Student Comment Request Received!',
        body: `${name} (${detail}) submitted a review: "${comment}". Awaiting coordinator approval in Admin Console.`,
        time: 'Just now',
        read: false
      });

      showToastNotification('⌛ Review Sent to Admin Queue!', `Thank you ${name}! Your comment has been sent to the Admin Console for approval.`);
      alert(`⌛ Thank you ${name}!\n\nYour experience comment has been submitted to the Admin Panel.\n\nIt will NOT display on the Student Portal until the Admin approves it in the Admin Console!`);
    });
  }
}

async function renderReviews() {
  const track = document.getElementById('testimonial-track');
  const dotsContainer = document.getElementById('carousel-dots');
  if (!track) return;

  const deletedIds = JSON.parse(localStorage.getItem('cu_deleted_reviews') || '[]');
  const customReviews = await getReviews();

  const defaultReviews = [
    {
      id: 'REV-DEF-1',
      name: 'Aditya',
      detail: 'BE-CSE_AIML, Chandigarh University',
      rating: '⭐⭐⭐⭐⭐',
      comment: 'HackathonHub makes finding free national hackathons and Agentic AI bootcamps effortless. As an AI/ML student, I registered for top coding sprints across IITs and CU seamlessly!',
      hasPhoto: true
    },
    {
      id: 'REV-DEF-2',
      name: 'Rohan Sharma',
      detail: 'B.Tech AI & Data Science, CU',
      rating: '⭐⭐⭐⭐⭐',
      comment: 'The search bar auto-suggesting locations (Mohali, Mumbai, Delhi) and colleges makes finding tech events super fast!',
      initials: 'RS'
    }
  ];

  // STRICT FILTER: ONLY DISPLAY REVIEWS THAT ARE EXPLICITLY APPROVED BY ADMIN! PENDING REVIEWS WILL NEVER SHOW!
  const approvedCustom = customReviews.filter(r => r.status === 'Approved');
  const allLive = [...defaultReviews, ...approvedCustom].filter(r => !deletedIds.includes(r.id));

  let html = '';

  allLive.forEach((r, idx) => {
    const isActive = idx === 0 ? 'active' : '';
    const avatarHtml = r.hasPhoto
      ? `<img src="aditya.jpg" alt="Aditya Passport Photo" class="t-avatar-img" />`
      : `<span style="font-size: 1.25rem; font-weight: 800;">${escapeHtml(r.initials || 'ST')}</span>`;

    html += `
      <div class="testimonial-card ${isActive}">
        <div class="t-quote-mark">&ldquo;</div>
        <p class="t-comment">"${escapeHtml(r.comment)}"</p>
        <div class="t-author">
          <div class="t-avatar" style="${!r.hasPhoto ? 'background: linear-gradient(135deg, #00E5FF 0%, #7C3AED 100%); color: #FFF;' : ''}">
            ${avatarHtml}
          </div>
          <div class="t-info">
            <h4 class="t-name">${escapeHtml(r.name)}</h4>
            <span class="t-detail">${escapeHtml(r.detail)}</span>
            <div class="t-rating">${r.rating}</div>
          </div>
        </div>
      </div>
    `;
  });

  track.innerHTML = html;

  const cards = track.querySelectorAll('.testimonial-card');
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    cards.forEach((c, idx) => {
      const dot = document.createElement('span');
      dot.className = `dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('data-index', idx);
      dotsContainer.appendChild(dot);
    });
  }

  setupCarouselNavigation(cards, track, dotsContainer);
}

function setupCarouselNavigation(cards, track, dotsContainer) {
  const prevBtn = document.getElementById('t-prev');
  const nextBtn = document.getElementById('t-next');
  const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];

  let currentIndex = 0;
  let autoplayTimer = null;

  function goToSlide(index) {
    if (cards.length === 0) return;
    if (index < 0) index = cards.length - 1;
    if (index >= cards.length) index = 0;
    currentIndex = index;

    cards.forEach((card, idx) => {
      if (idx === currentIndex) card.classList.add('active');
      else card.classList.remove('active');
    });

    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, idx) => {
      if (idx === currentIndex) dot.classList.add('active');
      else dot.classList.remove('active');
    });
  }

  if (prevBtn) prevBtn.onclick = () => { goToSlide(currentIndex - 1); resetAutoplay(); };
  if (nextBtn) nextBtn.onclick = () => { goToSlide(currentIndex + 1); resetAutoplay(); };

  dots.forEach(dot => {
    dot.onclick = () => {
      const idx = parseInt(dot.getAttribute('data-index'), 10);
      goToSlide(idx);
      resetAutoplay();
    };
  });

  function startAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => { goToSlide(currentIndex + 1); }, 5000);
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  startAutoplay();
}

/* --------------------------------------------------------------------------
   8. Certificate Verification Engine
   -------------------------------------------------------------------------- */
function initCertificateVerification() {
  const form = document.getElementById('verify-form');
  const input = document.getElementById('cert-id');
  const resultBox = document.getElementById('verify-result');

  if (!form || !input || !resultBox) return;

  const certDb = {
    'CU-2026-8942': {
      name: 'Amanpreet Kaur',
      course: 'Cybersecurity & Ethical Hacking Masterclass',
      issueDate: 'July 15, 2026',
      grade: 'A+ (Distinction)',
      issuer: 'Chandigarh University & Ethical Edufabrica',
      msmeNo: 'MSME-PB-03-99412'
    },
    'CU-2026-5511': {
      name: 'Rohan Sharma',
      course: 'Agentic AI & Generative AI Workshop',
      issueDate: 'June 28, 2026',
      grade: 'A (Excellence)',
      issuer: 'Chandigarh University & Ethical Edufabrica',
      msmeNo: 'MSME-PB-03-88210'
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const queryId = input.value.trim().toUpperCase();
    if (!queryId) return;

    resultBox.classList.remove('hidden', 'valid', 'invalid');

    if (certDb[queryId]) {
      const data = certDb[queryId];
      resultBox.classList.add('valid');
      resultBox.innerHTML = `
        <div style="font-weight: 800; font-size: 1.1rem; color: #16A34A; margin-bottom: 0.5rem;">
          ✓ VERIFIED AUTHENTIC CERTIFICATE
        </div>
        <p style="margin-bottom: 0.3rem;"><strong>Student Name:</strong> ${escapeHtml(data.name)}</p>
        <p style="margin-bottom: 0.3rem;"><strong>Course:</strong> ${escapeHtml(data.course)}</p>
        <p style="margin-bottom: 0.3rem;"><strong>Issue Date:</strong> ${data.issueDate}</p>
        <p style="margin-bottom: 0.3rem;"><strong>Grade Achieved:</strong> ${data.grade}</p>
        <p style="margin-bottom: 0.3rem;"><strong>Recognized By:</strong> ${data.issuer}</p>
        <p style="font-size: 0.8rem; opacity: 0.8; margin-top: 0.5rem;">MSME Registration Code: ${data.msmeNo}</p>
      `;
    } else {
      resultBox.classList.add('invalid');
      resultBox.innerHTML = `
        <div style="font-weight: 800; font-size: 1.1rem; color: #DC2626; margin-bottom: 0.5rem;">
          ❌ CERTIFICATE ID NOT FOUND
        </div>
        <p>No matching record found for ID: <code>${escapeHtml(queryId)}</code>.</p>
      `;
    }
  });
}

/* --------------------------------------------------------------------------
   9. FAQ Accordion
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(otherItem => otherItem.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });
}

/* --------------------------------------------------------------------------
   10. ENTERPRISE ADMIN PANEL DASHBOARD ENGINE & REVIEW MODERATION QUEUE
   -------------------------------------------------------------------------- */
function initAdminPanel() {
  initAdminSidebarTabs();
  renderAdminDashboard();
  renderAdminEvents();
  renderAdminReviews();
  populateOpportunityDropdowns();

  const searchInput = document.getElementById('admin-search');
  const courseFilter = document.getElementById('filter-course');
  const statusFilter = document.getElementById('filter-status');
  const exportBtn = document.getElementById('btn-export-csv');

  if (searchInput) searchInput.addEventListener('input', renderAdminDashboard);
  if (courseFilter) courseFilter.addEventListener('change', renderAdminDashboard);
  if (statusFilter) statusFilter.addEventListener('change', renderAdminDashboard);
  if (exportBtn) exportBtn.addEventListener('click', exportEnquiriesToCSV);

  // Manual Student Entry Form
  const manualForm = document.getElementById('manual-lead-form');
  if (manualForm) {
    manualForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newLead = {
        id: 'CU-LEAD-' + Math.floor(1000 + Math.random() * 9000),
        date: getLiveDateTimeString(),
        name: document.getElementById('m-name').value.trim(),
        email: document.getElementById('m-email').value.trim(),
        phone: document.getElementById('m-phone').value.trim(),
        course: document.getElementById('m-course').value,
        college: document.getElementById('m-college').value.trim() || 'Chandigarh University',
        message: 'Manually added by Admin',
        status: document.getElementById('m-status').value
      };

      await saveEnquiryItem(newLead);

      if (newLead.status === 'Confirmed') {
        await saveNotificationItem({
          id: 'NOTIF-' + Date.now(),
          title: '🎉 Application Accepted!',
          body: `Registration confirmed for ${newLead.name} (${newLead.course}).`,
          time: 'Just now',
          read: false
        });
      }

      window.closeAddManualLeadModal();
      manualForm.reset();
      await renderAdminDashboard();
    });
  }

  // INSTANT PUBLISH NEW EVENT / INTERNSHIP FORM
  const addEventForm = document.getElementById('add-event-form');
  if (addEventForm) {
    addEventForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('ev-title').value.trim();
      const category = document.getElementById('ev-category').value;
      const fee = document.getElementById('ev-fee').value;
      const organizer = document.getElementById('ev-organizer').value.trim();
      const prize = document.getElementById('ev-prize').value.trim();
      const desc = document.getElementById('ev-desc').value.trim() || 'No description provided';

      const newEv = {
        id: 'EV-' + Math.floor(100 + Math.random() * 900),
        title,
        category,
        fee,
        organizer,
        prize,
        desc,
        location: 'Pan-India / Online',
        inst: 'cu'
      };

      await saveEventItem(newEv);
      await populateOpportunityDropdowns();

      await saveNotificationItem({
        id: 'NOTIF-' + Date.now(),
        title: '🔥 New Opportunity Published!',
        body: `${title} by ${organizer} is now live! Register before seats fill up.`,
        time: 'Just now',
        read: false
      });

      window.closeAddEventModal();
      addEventForm.reset();
      await renderAdminEvents();
      await renderDynamicEventsOnIndex();
      showToastNotification('🔥 New Opportunity Published!', title);
      alert('🚀 Event / Internship successfully published & added to Opportunity dropdown!');
    });
  }

  // INSTANT PUSH NOTIFICATION FORM DISPATCHER
  const pushForm = document.getElementById('push-notif-form');
  if (pushForm) {
    pushForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('p-title').value.trim();
      const body = document.getElementById('p-body').value.trim();

      const notif = {
        id: 'NOTIF-' + Date.now(),
        title: title,
        body: body,
        time: 'Just now',
        read: false
      };

      await saveNotificationItem(notif);
      pushForm.reset();
      showToastNotification(title, body);
      alert('📢 Push notification dispatched live to all students!');
    });
  }
}

async function renderAdminReviews() {
  const tbody = document.getElementById('reviews-tbody');
  const emptyState = document.getElementById('reviews-empty-state');
  if (!tbody) return;

  const deletedIds = JSON.parse(localStorage.getItem('cu_deleted_reviews') || '[]');

  const defaultReviews = [
    {
      id: 'REV-DEF-1',
      name: 'Aditya',
      detail: 'BE-CSE_AIML, Chandigarh University',
      rating: '⭐⭐⭐⭐⭐',
      comment: 'HackathonHub makes finding free national hackathons and Agentic AI bootcamps effortless. As an AI/ML student, I registered for top coding sprints across IITs and CU seamlessly!',
      status: 'Approved'
    },
    {
      id: 'REV-DEF-2',
      name: 'Rohan Sharma',
      detail: 'B.Tech AI & Data Science, CU',
      rating: '⭐⭐⭐⭐⭐',
      comment: 'The search bar auto-suggesting locations (Mohali, Mumbai, Delhi) and colleges makes finding tech events super fast!',
      status: 'Approved'
    }
  ];

  const customReviews = await getReviews();
  const allReviews = [...defaultReviews, ...customReviews].filter(r => !deletedIds.includes(r.id));

  tbody.innerHTML = '';

  if (allReviews.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  } else {
    if (emptyState) emptyState.classList.add('hidden');
  }

  allReviews.forEach(r => {
    const isApproved = r.status === 'Approved';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong style="color: var(--brand-cyan);">${escapeHtml(r.id)}</strong></td>
      <td><strong>${escapeHtml(r.name)}</strong></td>
      <td>${escapeHtml(r.detail)}</td>
      <td>${r.rating}</td>
      <td style="max-width: 250px;">"${escapeHtml(r.comment)}"</td>
      <td>
        <span class="status-pill ${isApproved ? 'status-confirmed' : 'status-pending'}">${isApproved ? 'APPROVED & LIVE' : 'PENDING APPROVAL'}</span>
      </td>
      <td>
        <div style="display: flex; gap: 0.4rem;">
          ${!isApproved ? `<button class="btn btn-primary btn-sm" onclick="approveStudentReview('${r.id}')">✓ Accept & Publish</button>` : ''}
          <button class="btn btn-secondary btn-sm" onclick="rejectStudentReview('${r.id}')" style="color: #EF4444; border-color: #FCA5A5;">❌ ${isApproved ? 'Delete Live' : 'Reject'}</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function approveStudentReview(id) {
  try {
    await fetch(`/api/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Approved' })
    });
  } catch (e) {}

  const reviews = JSON.parse(localStorage.getItem('cu_reviews') || '[]');
  const rev = reviews.find(r => r.id === id);
  if (rev) {
    rev.status = 'Approved';
    localStorage.setItem('cu_reviews', JSON.stringify(reviews));
  }

  await renderAdminReviews();
  await renderReviews(); // Live update student panel
  alert('✅ Comment Accepted & Approved! It is now published live on the Student Panel carousel.');
}

async function rejectStudentReview(id) {
  try {
    await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
  } catch (e) {}

  const reviews = JSON.parse(localStorage.getItem('cu_reviews') || '[]');
  const filtered = reviews.filter(r => r.id !== id);
  localStorage.setItem('cu_reviews', JSON.stringify(filtered));

  const deletedIds = JSON.parse(localStorage.getItem('cu_deleted_reviews') || '[]');
  if (!deletedIds.includes(id)) {
    deletedIds.push(id);
    localStorage.setItem('cu_deleted_reviews', JSON.stringify(deletedIds));
  }

  await renderAdminReviews();
  await renderReviews(); // Live update student panel
  alert('❌ Comment Rejected & Removed! It will NOT be displayed on the Student Panel.');
}

function initAdminSidebarTabs() {
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  const tabContents = document.querySelectorAll('.admin-tab-content');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const targetTabId = link.getAttribute('data-tab');
      tabContents.forEach(content => {
        if (content.id === targetTabId) {
          content.classList.remove('hidden');
          content.classList.add('active');
        } else {
          content.classList.add('hidden');
          content.classList.remove('active');
        }
      });
    });
  });
}

async function renderAdminDashboard() {
  const tbody = document.getElementById('enquiries-tbody');
  if (!tbody) return;

  const enquiries = await getEnquiries();
  
  const total = enquiries.length;
  const pending = enquiries.filter(e => e.status === 'Pending').length;
  const confirmed = enquiries.filter(e => e.status === 'Confirmed').length;
  const totalEstRevenue = confirmed * 1499;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-pending').textContent = pending;
  document.getElementById('stat-confirmed').textContent = confirmed;
  document.getElementById('stat-revenue').textContent = '₹' + totalEstRevenue.toLocaleString('en-IN');

  const searchVal = (document.getElementById('admin-search')?.value || '').toLowerCase();
  const courseVal = document.getElementById('filter-course')?.value || 'all';
  const statusVal = document.getElementById('filter-status')?.value || 'all';

  const filtered = enquiries.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchVal) ||
                          item.email.toLowerCase().includes(searchVal) ||
                          item.phone.includes(searchVal) ||
                          item.college.toLowerCase().includes(searchVal);
    const matchesCourse = courseVal === 'all' || item.course === courseVal;
    const matchesStatus = statusVal === 'all' || item.status === statusVal;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  tbody.innerHTML = '';

  filtered.forEach(lead => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong style="color: var(--brand-cyan);">${escapeHtml(lead.id)}</strong></td>
      <td><span style="font-size: 0.825rem; font-weight: 700; color: var(--primary-navy);">${escapeHtml(lead.date)}</span></td>
      <td>
        <div class="student-meta-name">${escapeHtml(lead.name)}</div>
        <span class="student-meta-sub">${escapeHtml(lead.email)} • 📞 ${escapeHtml(lead.phone)}</span>
      </td>
      <td><strong>${escapeHtml(lead.course)}</strong></td>
      <td>${escapeHtml(lead.college)}</td>
      <td>
        <span class="status-pill status-${lead.status.toLowerCase()}">${escapeHtml(lead.status)}</span>
      </td>
      <td>
        <div style="display: flex; gap: 0.4rem;">
          <button class="btn btn-secondary btn-sm" onclick="viewStudentDetails('${lead.id}')">👁️ View</button>
          <select class="table-actions-dropdown" onchange="updateLeadStatus('${lead.id}', this.value)">
            <option value="Pending" ${lead.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Confirmed" ${lead.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
            <option value="Cancelled" ${lead.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function updateLeadStatus(id, newStatus) {
  try {
    await fetch(`/api/enquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
  } catch (e) {}

  const enquiries = await getEnquiries();
  const lead = enquiries.find(e => e.id === id);
  if (lead) {
    lead.status = newStatus;
    localStorage.setItem('cu_enquiries', JSON.stringify(enquiries));

    if (newStatus === 'Confirmed') {
      await saveNotificationItem({
        id: 'NOTIF-' + Date.now(),
        title: '🎉 Application Approved!',
        body: `Congratulations ${lead.name}! Your application for ${lead.course} has been accepted.`,
        time: 'Just now',
        read: false
      });
      showToastNotification('🎉 Application Approved!', `Accepted ${lead.name} for ${lead.course}`);
    }
  }

  await renderAdminDashboard();
}

async function viewStudentDetails(id) {
  const enquiries = await getEnquiries();
  const lead = enquiries.find(e => e.id === id);
  if (!lead) return;

  const modal = document.getElementById('view-student-modal');
  const title = document.getElementById('v-title');
  const content = document.getElementById('v-content');
  const acceptBtn = document.getElementById('v-accept-btn');

  if (title) title.textContent = `${lead.name}'s Application Details`;
  if (content) {
    content.innerHTML = `
      <p style="margin-bottom: 0.5rem;"><strong>Application Lead ID:</strong> <span style="color: var(--brand-cyan); font-weight: 800;">${escapeHtml(lead.id)}</span></p>
      <p style="margin-bottom: 0.5rem;"><strong>Registration Date & Time:</strong> <span style="color: #059669; font-weight: 800;">${escapeHtml(lead.date)}</span></p>
      <p style="margin-bottom: 0.5rem;"><strong>Student Full Name:</strong> ${escapeHtml(lead.name)}</p>
      <p style="margin-bottom: 0.5rem;"><strong>Email Address:</strong> <a href="mailto:${escapeHtml(lead.email)}" style="color: var(--brand-cyan);">${escapeHtml(lead.email)}</a></p>
      <p style="margin-bottom: 0.5rem;"><strong>Mobile Number:</strong> <a href="tel:${escapeHtml(lead.phone)}" style="color: var(--brand-cyan);">+91 ${escapeHtml(lead.phone)}</a></p>
      <p style="margin-bottom: 0.5rem;"><strong>College / Institute:</strong> ${escapeHtml(lead.college)}</p>
      <p style="margin-bottom: 0.5rem;"><strong>Applied Event / Course:</strong> <strong>${escapeHtml(lead.course)}</strong></p>
      <p style="margin-bottom: 0.5rem;"><strong>Application Status:</strong> <span class="status-pill status-${lead.status.toLowerCase()}">${escapeHtml(lead.status)}</span></p>
      <div style="background: #070B19; padding: 1rem; border-radius: 12px; margin-top: 0.75rem; border: 1px solid var(--border-cyber);">
        <strong style="color: var(--brand-cyan); display: block; margin-bottom: 0.25rem;">Team Notes & Github Summary:</strong>
        <p style="font-size: 0.875rem; color: #CBD5E1;">${escapeHtml(lead.message || 'No additional notes provided.')}</p>
      </div>
    `;
  }

  if (acceptBtn) {
    acceptBtn.onclick = async () => {
      await updateLeadStatus(id, 'Confirmed');
      closeViewStudentModal();
    };
  }

  if (modal) modal.classList.remove('hidden');
}

function closeViewStudentModal() {
  const modal = document.getElementById('view-student-modal');
  if (modal) modal.classList.add('hidden');
}

async function renderAdminEvents() {
  const grid = document.getElementById('events-grid-admin');
  if (!grid) return;

  const events = await getEvents();
  grid.innerHTML = '';

  events.forEach(ev => {
    const div = document.createElement('div');
    div.className = 'event-card-admin';
    div.innerHTML = `
      <div>
        <h4>${escapeHtml(ev.title)}</h4>
        <p style="font-size: 0.85rem; color: #64748B; margin-bottom: 0.5rem;"><strong>Organizer:</strong> ${escapeHtml(ev.organizer)}</p>
        <p style="font-size: 0.85rem; color: #64748B; margin-bottom: 0.75rem;"><strong>Prize / Reward:</strong> ${escapeHtml(ev.prize)}</p>
      </div>
      <div class="flex-between">
        <span class="status-pill ${ev.fee === 'free' ? 'status-confirmed' : 'status-pending'}">${ev.fee === 'free' ? '100% FREE' : 'PAID'}</span>
        <button class="btn btn-secondary btn-sm" onclick="deleteEventItem('${ev.id}')" style="color: #EF4444; border-color: #FCA5A5;">🗑️ Delete</button>
      </div>
    `;
    grid.appendChild(div);
  });
}

async function deleteEventItem(id) {
  try {
    await fetch(`/api/events/${id}`, { method: 'DELETE' });
  } catch (e) {}

  const events = await getEvents();
  const filtered = events.filter(e => e.id !== id);
  localStorage.setItem('cu_events', JSON.stringify(filtered));

  await renderAdminEvents();
  await populateOpportunityDropdowns();
  alert('🗑️ Opportunity removed from catalog.');
}

function openAddManualLeadModal() {
  const modal = document.getElementById('manual-lead-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeAddManualLeadModal() {
  const modal = document.getElementById('manual-lead-modal');
  if (modal) modal.classList.add('hidden');
}

function openAddEventModal() {
  const modal = document.getElementById('add-event-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeAddEventModal() {
  const modal = document.getElementById('add-event-modal');
  if (modal) modal.classList.add('hidden');
}

function exportEnquiriesToCSV() {
  getEnquiries().then(enquiries => {
    if (enquiries.length === 0) {
      alert('No enquiries to export!');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,ID,Date,Name,Email,Phone,Course,College,Status\n';
    enquiries.forEach(e => {
      csvContent += `"${e.id}","${e.date}","${e.name}","${e.email}","${e.phone}","${e.course}","${e.college}","${e.status}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HackHub_Student_Applications_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
