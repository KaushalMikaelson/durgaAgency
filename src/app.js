// Main Application Controller for Maa Durga Engineering - Tractor Showroom & Sales OS
import { store } from './store.js';
import { icons, renderIcon } from './icons.js';
import { matchTractor } from './recommendation.js';
import { calculateBuyingScore, getTodayCallsQueue } from './buyingScore.js';

import { evaluateUsedTractor } from './exchangeEvaluator.js';
import { generateFollowUpSequences, createWhatsAppUrl } from './whatsapp.js';
import { queryBusinessAdvisor } from './aiAdvisor.js';

// --- ON-SCREEN TOAST NOTIFICATION SYSTEM ---
export function showToast(message, type = 'success', title = '') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;

  let iconSvg = '';
  let defaultTitle = '';
  if (type === 'success') {
    iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    defaultTitle = 'Success';
  } else if (type === 'warning') {
    iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    defaultTitle = 'Attention';
  } else if (type === 'error') {
    iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    defaultTitle = 'Error';
  } else {
    iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    defaultTitle = 'Showroom Notice';
  }

  const finalTitle = title || defaultTitle;

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-content">
      <div class="toast-title">${finalTitle}</div>
      <div class="toast-msg">${message}</div>
    </div>
    <button class="toast-close-btn" title="Dismiss">&times;</button>
    <div class="toast-progress"></div>
  `;

  const closeBtn = toast.querySelector('.toast-close-btn');
  const dismiss = () => {
    if (toast.classList.contains('toast-dismissing')) return;
    toast.classList.add('toast-dismissing');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 280);
  };

  if (closeBtn) closeBtn.addEventListener('click', dismiss);
  const timer = setTimeout(dismiss, 4000);
  toast.addEventListener('mouseenter', () => clearTimeout(timer));

  container.appendChild(toast);
}

if (typeof window !== 'undefined') {
  window.alert = function(msg) {
    showToast(String(msg), 'info', 'Showroom Notice');
  };
// --- AUTHENTIC BILL BOOK TEMPLATE HELPERS (data/New Doc template) ---
export function numberToIndianWords(n) {
  const num = Math.floor(Math.abs(Number(n) || 0));
  if (num === 0) return 'Zero Rupees Only';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  function convertTwo(val) {
    if (val < 20) return a[val];
    return b[Math.floor(val / 10)] + (val % 10 !== 0 ? ' ' + a[val % 10] : '');
  }
  function convertThree(val) {
    const h = Math.floor(val / 100);
    const rem = val % 100;
    let s = '';
    if (h > 0) s += a[h] + ' Hundred';
    if (rem > 0) s += (s ? ' ' : '') + convertTwo(rem);
    return s;
  }
  const cr = Math.floor(num / 10000000);
  let r = num % 10000000;
  const lk = Math.floor(r / 100000);
  r = r % 100000;
  const th = Math.floor(r / 1000);
  r = r % 1000;
  const hu = r;
  const parts = [];
  if (cr > 0) parts.push(convertThree(cr) + ' Crore');
  if (lk > 0) parts.push(convertThree(lk) + ' Lakh');
  if (th > 0) parts.push(convertThree(th) + ' Thousand');
  if (hu > 0) parts.push(convertThree(hu));
  return parts.join(' ') + ' Rupees Only';
}

export function getMaaDurgaSvg() {
  return `<svg viewBox="0 0 120 120" width="76" height="76" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="56" fill="#ffffff" stroke="#000000" stroke-width="2.5"/>
    <circle cx="60" cy="60" r="51" fill="none" stroke="#000000" stroke-width="1" stroke-dasharray="2.5,2.5"/>
    <path d="M60 12 L60 22 M40 18 L46 26 M80 18 L74 26 M25 32 L33 37 M95 32 L87 37 M18 50 L27 52 M102 50 L93 52" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M36 50 C36 34, 48 24, 60 20 C72 24, 84 34, 84 50 Z" fill="#ffffff" stroke="#000000" stroke-width="2"/>
    <path d="M42 46 C48 36, 54 30, 60 28 C66 30, 72 36, 78 46" fill="none" stroke="#000000" stroke-width="1.5"/>
    <path d="M60 14 L60 24 M56 18 C58 16, 62 16, 64 18" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
    <circle cx="60" cy="34" r="3.5" fill="#000000"/>
    <circle cx="50" cy="40" r="2.5" fill="#000000"/>
    <circle cx="70" cy="40" r="2.5" fill="#000000"/>
    <path d="M34 50 L86 50" stroke="#000000" stroke-width="2.5"/>
    <path d="M38 52 C38 76, 48 88, 60 92 C72 88, 82 76, 82 52" fill="#ffffff" stroke="#000000" stroke-width="2"/>
    <path d="M60 52 C58 55, 58 58, 60 61 C62 58, 62 55, 60 52 Z" fill="#b91c1c" stroke="#b91c1c" stroke-width="0.5"/>
    <circle cx="60" cy="67" r="2.2" fill="#b91c1c"/>
    <path d="M44 64 C48 61, 53 61, 56 63" fill="none" stroke="#000000" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M76 64 C72 61, 67 61, 64 63" fill="none" stroke="#000000" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M43 68 C47 64, 52 64, 56 68 C52 72, 47 72, 43 68 Z" fill="#ffffff" stroke="#000000" stroke-width="1.6"/>
    <circle cx="49.5" cy="68" r="2.2" fill="#000000"/>
    <path d="M77 68 C73 64, 68 64, 64 68 C68 72, 73 72, 77 68 Z" fill="#ffffff" stroke="#000000" stroke-width="1.6"/>
    <circle cx="70.5" cy="68" r="2.2" fill="#000000"/>
    <path d="M60 65 L60 76 L62 76" fill="none" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="56.5" cy="77" r="3.2" fill="none" stroke="#000000" stroke-width="1.2"/>
    <path d="M53.5 77 C48 78, 43 75, 40 70" fill="none" stroke="#000000" stroke-width="0.8" stroke-dasharray="1,1"/>
    <path d="M53 82 C56 81, 64 81, 67 82 C64 86, 56 86, 53 82 Z" fill="#b91c1c" stroke="#000000" stroke-width="1"/>
    <line x1="53" y1="82" x2="67" y2="82" stroke="#000000" stroke-width="0.8"/>
    <circle cx="34" cy="64" r="3" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>
    <circle cx="86" cy="64" r="3" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>
  </svg>`;
}

export function getChakraSvg() {
  return `<svg viewBox="0 0 100 100" width="76" height="76" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#000000" stroke-width="3"/>
    <circle cx="50" cy="50" r="42" fill="none" stroke="#000000" stroke-width="1"/>
    <circle cx="50" cy="50" r="7" fill="#000000"/>
    <line x1="50" y1="4" x2="50" y2="96" stroke="#000000" stroke-width="2.5"/>
    <line x1="10.2" y1="27" x2="89.8" y2="73" stroke="#000000" stroke-width="2.5"/>
    <line x1="10.2" y1="73" x2="89.8" y2="27" stroke="#000000" stroke-width="2.5"/>
  </svg>`;
}

export function renderMaaDurgaBillHTML(bill, isPureBlank = false, isLive = false) {
  const nextAutoNo = (typeof store !== 'undefined' && store.getNextBillNumber) ? store.getNextBillNumber() : '87';
  const b = bill || {};
  const billNumber = b.billNumber || nextAutoNo;
  const dateStr = b.date || new Date().toISOString().split('T')[0];

  const items = b.items || [];
  const minRows = 10;
  const filledCount = items.length;
  const emptyRowsCount = Math.max(0, minRows - filledCount);

  let rowsHtml = '';
  if (isLive) {
    items.forEach((item, idx) => {
      const p = item.paise !== undefined && item.paise !== null && item.paise !== '' ? String(item.paise).padStart(2, '0') : '00';
      rowsHtml += `
        <tr class="mdd-live-row">
          <td style="width:70px; text-align:center; padding:2px;">
            <input type="text" class="mdd-sheet-table-input mdd-live-qty" value="${item.qty || (idx + 1)}" placeholder="${idx + 1}" style="text-align:center; font-weight:700;" />
          </td>
          <td style="padding:2px;">
            <input type="text" class="mdd-sheet-table-input mdd-live-desc" value="${item.desc || ''}" placeholder="विवरण (Item / Service / Diesel)" style="font-weight:600;" />
          </td>
          <td style="width:90px; text-align:right; padding:2px;">
            <input type="number" class="mdd-sheet-table-input mdd-live-rupees" value="${item.rupees !== undefined ? item.rupees : ''}" placeholder="0" min="0" style="text-align:right; font-weight:700; font-family:monospace, sans-serif; font-size:15px;" />
          </td>
          <td style="width:45px; text-align:center; padding:2px;">
            <input type="number" class="mdd-sheet-table-input mdd-live-paise" value="${p}" placeholder="00" min="0" max="99" style="text-align:center; font-family:monospace, sans-serif; font-size:13.5px;" />
          </td>
        </tr>
      `;
    });

    for (let i = 0; i < emptyRowsCount; i++) {
      const rowNum = filledCount + i + 1;
      rowsHtml += `
        <tr class="mdd-live-row">
          <td style="width:70px; text-align:center; padding:2px;">
            <input type="text" class="mdd-sheet-table-input mdd-live-qty" placeholder="${rowNum}" style="text-align:center; font-weight:700;" />
          </td>
          <td style="padding:2px;">
            <input type="text" class="mdd-sheet-table-input mdd-live-desc" placeholder="विवरण..." style="font-weight:600;" />
          </td>
          <td style="width:90px; text-align:right; padding:2px;">
            <input type="number" class="mdd-sheet-table-input mdd-live-rupees" placeholder="0" min="0" style="text-align:right; font-weight:700; font-family:monospace, sans-serif; font-size:15px;" />
          </td>
          <td style="width:45px; text-align:center; padding:2px;">
            <input type="number" class="mdd-sheet-table-input mdd-live-paise" placeholder="00" min="0" max="99" style="text-align:center; font-family:monospace, sans-serif; font-size:13.5px;" />
          </td>
        </tr>
      `;
    }
  } else if (isPureBlank) {
    for (let i = 0; i < minRows; i++) {
      rowsHtml += `
        <tr class="empty-row">
          <td style="width:70px;">&nbsp;</td>
          <td>&nbsp;</td>
          <td style="width:90px;">&nbsp;</td>
          <td style="width:45px;">&nbsp;</td>
        </tr>
      `;
    }
  } else {
    items.forEach((item, idx) => {
      const p = item.paise !== undefined && item.paise !== null && item.paise !== '' ? String(item.paise).padStart(2, '0') : '00';
      rowsHtml += `
        <tr>
          <td style="width:70px; text-align:center; font-weight:700;">${item.qty || (idx + 1)}</td>
          <td style="font-weight:600;">${item.desc || ''}</td>
          <td style="width:90px; text-align:right; font-weight:700; font-family:monospace, sans-serif; font-size:15px;">${item.rupees ? Number(item.rupees).toLocaleString('en-IN') : ''}</td>
          <td style="width:45px; text-align:center; font-family:monospace, sans-serif; font-size:14px;">${p}</td>
        </tr>
      `;
    });

    for (let i = 0; i < emptyRowsCount; i++) {
      rowsHtml += `
        <tr class="empty-row">
          <td style="width:70px;">&nbsp;</td>
          <td>&nbsp;</td>
          <td style="width:90px;">&nbsp;</td>
          <td style="width:45px;">&nbsp;</td>
        </tr>
      `;
    }
  }

  const totalR = isPureBlank ? '' : (b.totalRupees !== undefined ? Number(b.totalRupees).toLocaleString('en-IN') : '0');
  const totalP = isPureBlank ? '' : (b.totalPaise ? String(b.totalPaise).padStart(2, '0') : '00');
  const words = isPureBlank ? '' : (b.amountWords || (b.totalRupees ? numberToIndianWords(b.totalRupees) : ''));

  return `
    <div class="mdd-bill-sheet" id="printableMddBill">
      <!-- Top Bar with ESTIMATE and Phone -->
      <div class="mdd-top-bar">
        <div class="mdd-estimate-pill">ESTIMATE</div>
        <div class="mdd-top-phone">Mob.: ${b.phone || '9931227178'}</div>
      </div>

      <!-- Header: Durga Logo | Center Shop Name & Address | Chakra Logo -->
      <div class="mdd-header-main">
        <div class="mdd-emblem-left">
          ${getMaaDurgaSvg()}
        </div>
        <div class="mdd-title-center">
          <div class="mdd-shop-name">माँ दुर्गा डीजल</div>
          <div class="mdd-address-lines">
            पता: महावीर मार्केट, महादेव स्थान, करमलीचक<br>
            बाईपास, एन. एच. - 30, पटना सिटी
          </div>
        </div>
        <div class="mdd-emblem-right">
          ${getChakraSvg()}
        </div>
      </div>

      <!-- Sub-Header: No. and Date -->
      <div class="mdd-meta-grid">
        <div class="mdd-bill-no-label">
          <span>नं० :</span>
          <span class="mdd-bill-no-val" id="mddLiveBillNoVal">${billNumber}</span>
          <span class="badge badge-success no-print" style="font-size:10px; margin-left:6px; padding:2px 6px;">⚡ Auto</span>
        </div>
        <div class="mdd-date-field">
          <span>दिनांक :</span>
          ${isLive ? `
            <input type="date" class="mdd-sheet-input" id="mddLiveDate" value="${dateStr}" style="width:130px; text-align:center; font-size:13px; font-weight:700;" />
          ` : `
            <span class="mdd-dots-line" style="min-width:130px; text-align:center;">${dateStr}</span>
          `}
        </div>
      </div>

      <!-- Customer Row: M/s -->
      <div class="mdd-customer-section">
        <div class="mdd-cust-row">
          <span>मेसर्स</span>
          ${isLive ? `
            <input type="text" class="mdd-sheet-input" id="mddLiveCustomer" placeholder="ग्राहक का नाम / फर्म का नाम (e.g. Ramesh Chandra)..." value="${(b.customerName || '').replace(/^मेसर्स\s*/i, '')}" style="font-size:15px; font-weight:800; color:#1e3a8a;" />
          ` : (isPureBlank ? `
            <span class="mdd-dots-line"></span>
          ` : `
            <span class="mdd-dots-line">${(b.customerName || '').replace(/^मेसर्स\s*/i, '')}</span>
          `)}
        </div>
        <div class="mdd-cust-row">
          ${isLive ? `
            <input type="text" class="mdd-sheet-input" id="mddLiveAddress" placeholder="पता / गांव व जिला / गाड़ी विवरण (e.g. Kalyanpur, Gorakhpur)..." value="${b.address || ''}" style="font-size:13px;" />
          ` : (isPureBlank ? `
            <span class="mdd-dots-line" style="width:100%;"></span>
          ` : `
            <span class="mdd-dots-line" style="width:100%;">${b.address || ''}</span>
          `)}
        </div>
      </div>

      <!-- Items Table Grid -->
      <div class="mdd-table-wrapper">
        <table class="mdd-table">
          <thead>
            <tr>
              <th rowspan="2" style="width:70px; vertical-align:middle;">संख्या</th>
              <th rowspan="2" style="vertical-align:middle;">विवरण</th>
              <th colspan="2" class="dam-header" style="width:135px;">दाम</th>
            </tr>
            <tr>
              <th class="mdd-sub-th" style="width:90px;">रू०</th>
              <th class="mdd-sub-th" style="width:45px;">पै०</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="text-align:right;">
                <span class="mdd-total-badge">Total</span>
              </td>
              <td style="width:90px; text-align:right; font-size:16px; font-weight:900; font-family:monospace, sans-serif;">
                <span id="mddLiveTotalRupees">${totalR}</span>
              </td>
              <td style="width:45px; text-align:center; font-size:14px; font-weight:800; font-family:monospace, sans-serif;">
                <span id="mddLiveTotalPaise">${totalP}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      ${isLive ? `
        <div class="no-print" style="margin-top:10px; padding:8px 12px; background:#f1f5f9; border-radius:6px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
            <span style="font-size:11px; font-weight:800; color:#475569;">+ QUICK PRESETS:</span>
            <button type="button" class="preset-pill" onclick="window.app.addLiveSheetItem('डीजल (Diesel 40L)', '40 L', 3760, 0)">+ 40L Diesel</button>
            <button type="button" class="preset-pill" onclick="window.app.addLiveSheetItem('इंजन ऑयल Mobil 15W40', '1 Can', 2450, 0)">+ Mobil 15W40</button>
            <button type="button" class="preset-pill" onclick="window.app.addLiveSheetItem('डीजल फिल्टर किट (Bosch)', '2 Pc', 680, 0)">+ Filter Kit</button>
            <button type="button" class="preset-pill" onclick="window.app.addLiveSheetItem('रोटावेटर ब्लेड सेट', '1 Set', 4200, 0)">+ Rotavator Blades</button>
            <button type="button" class="preset-pill" onclick="window.app.addLiveSheetItem('सर्विस व लेबर चार्ज', '1 Job', 350, 0)">+ Service</button>
          </div>
          <button type="button" class="quick-action-btn btn-sm btn-outline" onclick="window.app.addLiveSheetBlankRow()" style="background:#ffffff;">
            + Add Extra Line
          </button>
        </div>
      ` : ''}

      <!-- Words and Signature Footer -->
      <div class="mdd-footer">
        <div class="mdd-words-row">
          <span style="white-space:nowrap;">Rs. in words</span>
          <span class="mdd-dots-line" id="mddLiveWordsVal" style="font-weight:700; font-size:13.5px; padding-left:8px;">${words}</span>
        </div>
        <div class="mdd-words-row" style="height:14px;">
          <span class="mdd-dots-line" style="width:100%;"></span>
        </div>
        <div class="mdd-sign-row">
          <div class="mdd-sign-box">
            हस्ताक्षर
          </div>
        </div>
      </div>
    </div>
  `;
}

class TractorOSApp {
  constructor() {
    this.currentTab = 'dashboard';
    this.init();
  }

  init() {
    this.bindEvents();
    this.renderSidebar();
    this.renderCurrentView();

    // Re-render when store data changes
    store.subscribe(() => {
      this.renderSidebar();
      this.renderCurrentView();
    });
  }

  bindEvents() {
    // Mobile sidebar toggle
    const toggleBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.querySelector('.sidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // Navigation item clicks
    document.querySelectorAll('.nav-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = btn.dataset.tab;
        if (tab) {
          this.switchTab(tab);
          if (window.innerWidth <= 768 && sidebar) {
            sidebar.classList.remove('open');
          }
        }
      });
    });

    // Close modals on backdrop click or close button
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.closest('.modal-close-btn')) {
          this.closeAllModals();
        }
      });
    });
  }

  switchTab(tabName) {
    if (tabName === 'exchange' || tabName === 'recommend' || tabName === 'emi' || tabName === 'quotations') tabName = 'dashboard';
    this.currentTab = tabName;
    document.querySelectorAll('.nav-item-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update Topbar Title
    const titleEl = document.getElementById('topbarTitle');
    const subtitleEl = document.getElementById('topbarSubtitle');
    const titles = {
      dashboard: { title: "Executive Command Center", sub: "Daily sales calls, today's cash flow & monthly showroom P&L" },
      leads: { title: "Customer & Lead CRM", sub: "Farmer profiles, village mapping & algorithmic buying score" },
      inventory: { title: "Tractor Inventory & Landed Margins", sub: "Live showroom stock, specifications & unit profitability" },
      billing: { title: "Billing Command Center (माँ दुर्गा डीजल)", sub: "Official Maa Durga Diesel bills, estimates & customer receipts" },
      demos: { title: "Field Demos & Track Testing", sub: "Rotavator/Plough demonstration logs, diesel consumption & feedback" },
      expenses: { title: "Showroom Expenses & Unit Cost Tagging", sub: "Fast entry, approval workflow & per-tractor landed cost" },
      cashflow: { title: "Cash & Bank Ledger", sub: "Cash-in vs Cash-out tracking distinct from accounting profit" },
      villageMap: { title: "Village-Level Territory Analytics", sub: "Geographic demand clustering, crop patterns & route planning" },
      aiAdvisor: { title: "Grounded Business AI Advisor", sub: "Quantitative diagnostic assistant operating on your real ledger" }
    };

    if (titleEl && titles[tabName]) {
      titleEl.textContent = titles[tabName].title;
      subtitleEl.textContent = titles[tabName].sub;
    }

    this.renderCurrentView();
  }

  closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
  }

  openModal(modalId) {
    this.closeAllModals();
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  renderSidebar() {
    const leads = store.getLeads();
    const hotCount = leads.filter(l => (l.buyingScore || 0) >= 75).length;
    const hotBadge = document.getElementById('hotLeadsBadge');
    if (hotBadge) {
      hotBadge.textContent = `${hotCount} Hot`;
    }

    const expenses = store.getExpenses();
    const pendingExpCount = expenses.filter(e => e.status === 'Pending Approval').length;
    const pendingExpBadge = document.getElementById('pendingExpBadge');
    if (pendingExpBadge) {
      if (pendingExpCount > 0) {
        pendingExpBadge.textContent = `${pendingExpCount} Pending`;
        pendingExpBadge.style.display = 'inline-block';
      } else {
        pendingExpBadge.style.display = 'none';
      }
    }
  }

  renderCurrentView() {
    const content = document.getElementById('mainContentArea');
    if (!content) return;

    switch (this.currentTab) {
      case 'dashboard':
        content.innerHTML = this.renderDashboardHTML();
        this.bindDashboardEvents();
        break;
      case 'leads':
        content.innerHTML = this.renderLeadsHTML();
        this.bindLeadsEvents();
        break;
      case 'recommend':
        content.innerHTML = this.renderRecommendationHTML();
        this.bindRecommendationEvents();
        break;
      case 'inventory':
        content.innerHTML = this.renderInventoryHTML();
        this.bindInventoryEvents();
        break;
      case 'billing':
        content.innerHTML = this.renderBillingHTML();
        this.bindBillingEvents();
        break;
      case 'exchange':
        content.innerHTML = this.renderExchangeHTML();
        this.bindExchangeEvents();
        break;

      case 'demos':
        content.innerHTML = this.renderDemosHTML();
        this.bindDemosEvents();
        break;
      case 'expenses':
        content.innerHTML = this.renderExpensesHTML();
        this.bindExpensesEvents();
        break;
      case 'cashflow':
        content.innerHTML = this.renderCashFlowHTML();
        this.bindCashFlowEvents();
        break;
      case 'villageMap':
        content.innerHTML = this.renderVillageMapHTML();
        break;
      case 'aiAdvisor':
        content.innerHTML = this.renderAiAdvisorHTML();
        this.bindAiAdvisorEvents();
        break;
      default:
        content.innerHTML = this.renderDashboardHTML();
    }
  }

  // =========================================================================
  // 1. DASHBOARD / EXECUTIVE COMMAND CENTER
  // =========================================================================
  renderDashboardHTML() {
    const snapshot = store.getFinancialSnapshot();
    const leads = store.getLeads();
    const hotLeads = leads.filter(l => (l.buyingScore || 0) >= 75);
    const todayCalls = getTodayCallsQueue(leads);
    const expenses = store.getExpenses();
    const pendingExpenses = expenses.filter(e => e.status === 'Pending Approval');
    const demos = store.getDemos();
    const tractors = store.getTractors();

    return `
      <!-- Action Command Banner -->
      <div class="command-banner">
        <div class="command-banner-info">
          <h3>${renderIcon('flame')} Today's Priority: Call ${todayCalls.length} Hot Leads First</h3>
          <p>The system has prioritized your customer queues based on purchase readiness, pricing follow-ups, and village demos.</p>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="quick-action-btn btn-gold" id="dashStartCallingBtn">
            ${renderIcon('phone')} Start Calling Queue
          </button>
          <button class="quick-action-btn btn-outline" style="color:#fff; border-color:rgba(255,255,255,0.3);" id="dashAddLeadBtn">
            ${renderIcon('plus')} New Lead
          </button>
        </div>
      </div>

      <!-- Financial & Operations Metric Grid -->
      <div class="metric-grid">
        <div class="metric-card gold">
          <div class="metric-top">
            <span class="metric-label">Sales Revenue (Sep)</span>
            <div class="metric-icon-wrap gold">${renderIcon('rupee')}</div>
          </div>
          <div class="metric-value">₹${(snapshot.salesRevenue / 100000).toFixed(2)}L</div>
          <div class="metric-sub">5 Tractors Delivered this month</div>
        </div>

        <div class="metric-card success">
          <div class="metric-top">
            <span class="metric-label">Gross Showroom Profit</span>
            <div class="metric-icon-wrap success">${renderIcon('calculator')}</div>
          </div>
          <div class="metric-value">₹${(snapshot.grossProfit / 100000).toFixed(2)}L</div>
          <div class="metric-sub">Avg Margin: ~15% OEM Spread</div>
        </div>

        <div class="metric-card danger">
          <div class="metric-top">
            <span class="metric-label">Total Expenses</span>
            <div class="metric-icon-wrap danger">${renderIcon('expense')}</div>
          </div>
          <div class="metric-value">₹${(snapshot.totalExpenses / 100000).toFixed(2)}L</div>
          <div class="metric-sub">Salaries, Fuel, Rent, Transport</div>
        </div>

        <div class="metric-card info">
          <div class="metric-top">
            <span class="metric-label">Actual Net Profit</span>
            <div class="metric-icon-wrap info">${renderIcon('bank')}</div>
          </div>
          <div class="metric-value">₹${(snapshot.netProfit / 100000).toFixed(2)}L</div>
          <div class="metric-sub" style="color:var(--success); font-weight:700;">Net Cash Flow: +₹${(snapshot.netCashFlow / 100000).toFixed(2)}L</div>
        </div>
      </div>

      <!-- Quick Operations Counter Strip -->
      <div class="metric-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 24px;">
        <div class="metric-card" style="padding:14px 18px;">
          <span style="font-size:11px; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">🔥 Hot Buying Leads</span>
          <div style="font-size:22px; font-weight:800; color:var(--danger); margin-top:4px;">${hotLeads.length} Farmers</div>
        </div>
        <div class="metric-card" style="padding:14px 18px;">
          <span style="font-size:11px; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">🚜 Field Demos</span>
          <div style="font-size:22px; font-weight:800; color:var(--primary); margin-top:4px;">${demos.length} Active / Scheduled</div>
        </div>
        <div class="metric-card" style="padding:14px 18px;">
          <span style="font-size:11px; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">📦 Available Inventory</span>
          <div style="font-size:22px; font-weight:800; color:var(--accent-dark); margin-top:4px;">16 Units in Yard</div>
        </div>
        <div class="metric-card" style="padding:14px 18px;">
          <span style="font-size:11px; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">⏳ Pending Approvals</span>
          <div style="font-size:22px; font-weight:800; color:var(--warning); margin-top:4px;">${pendingExpenses.length} Expenses</div>
        </div>
      </div>

      <!-- 2-Column Dashboard Breakdown -->
      <div class="dashboard-grid-2col">
        <!-- Left: Today's Action Call Queue -->
        <div class="panel-card">
          <div class="panel-header">
            <div>
              <div class="panel-title">${renderIcon('phone')} High-Priority Calling Queue (Today)</div>
              <div class="panel-subtitle">Algorithmic selection based on buying score and expected purchase date</div>
            </div>
            <span class="badge badge-hot">${todayCalls.length} Leads</span>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Farmer / Lead</th>
                  <th>Village</th>
                  <th>Model & Budget</th>
                  <th>Buying Score</th>
                  <th>Next Immediate Action</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${todayCalls.map(lead => {
                  const score = lead.computedScore ? lead.computedScore.score : (lead.buyingScore || 80);
                  const tractor = tractors.find(t => t.id === lead.interestedModelId);
                  const tractorName = tractor ? `${tractor.brand} ${tractor.model}` : '50 HP Tractor';
                  return `
                    <tr>
                      <td>
                        <strong>${lead.name}</strong><br>
                        <span style="font-size:11px; color:var(--text-muted);">${lead.phone}</span>
                      </td>
                      <td>${lead.village || 'Sadar'}</td>
                      <td>
                        <span style="font-weight:700; color:var(--primary);">${tractorName}</span><br>
                        <span style="font-size:11px; color:var(--text-secondary);">Max: ₹${((lead.budgetMax || 850000) / 100000).toFixed(1)}L</span>
                      </td>
                      <td>
                        <div class="prob-container">
                          <div class="prob-track">
                            <div class="prob-fill ${score >= 75 ? 'hot' : 'warm'}" style="width: ${score}%;"></div>
                          </div>
                          <span style="font-size:11px; font-weight:800;">${score}%</span>
                        </div>
                      </td>
                      <td style="max-width:220px; font-size:12px;">
                        <span style="color:var(--danger); font-weight:600;">${lead.nextAction || 'Call to confirm financing'}</span>
                      </td>
                      <td>
                        <div style="display:flex; gap:6px;">
                          <a href="tel:${lead.phone}" class="quick-action-btn btn-sm btn-primary" title="Direct Phone Call">
                            ${renderIcon('phone')} Call
                          </a>
                          <button class="quick-action-btn btn-sm btn-whatsapp open-wa-btn" data-lead-id="${lead.id}" title="Send WhatsApp Sequence">
                            ${renderIcon('whatsapp')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right: Monthly Expense & Profitability Breakdown -->
        <div class="panel-card">
          <div class="panel-header">
            <div>
              <div class="panel-title">${renderIcon('expense')} Expense Categories (September)</div>
              <div class="panel-subtitle">Live expense distribution & margin leakage</div>
            </div>
            <button class="quick-action-btn btn-sm btn-outline" id="dashFastExpenseBtn">
              ${renderIcon('plus')} Fast Entry
            </button>
          </div>

          <div style="display:flex; flex-direction:column; gap:14px;">
            ${Object.entries(snapshot.categoryTotals).map(([cat, amt]) => {
              const pct = snapshot.totalExpenses > 0 ? Math.round((amt / snapshot.totalExpenses) * 100) : 0;
              return `
                <div>
                  <div style="display:flex; justify-content:space-between; font-size:12.5px; margin-bottom:4px;">
                    <span style="font-weight:700;">${cat}</span>
                    <span style="font-weight:800; color:var(--text-primary);">₹${amt.toLocaleString('en-IN')} <span style="font-weight:500; color:var(--text-muted);">(${pct}%)</span></span>
                  </div>
                  <div style="height:6px; background:var(--bg-main); border-radius:var(--radius-full); overflow:hidden;">
                    <div style="height:100%; width:${pct}%; background:var(--brand-gradient);"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Unit Profitability Callout -->
          <div style="margin-top:20px; padding:14px; background:var(--primary-light); border-radius:var(--radius-md); border:1px solid #bbf7d0;">
            <div style="font-size:12.5px; font-weight:800; color:var(--primary-dark); display:flex; align-items:center; gap:6px;">
              ${renderIcon('tractor')} Tractor Unit Margin Intelligence
            </div>
            <p style="font-size:11.5px; color:var(--primary); margin-top:4px; line-height:1.4;">
              Did you know? Tagging inward freight & repair costs directly to chassis serial numbers reveals true net margins per unit (e.g. VST Zetor 5011: ₹68,500 true profit vs ₹80,000 nominal gross).
            </p>
          </div>
        </div>
      </div>
    `;
  }

  bindDashboardEvents() {
    const callBtn = document.getElementById('dashStartCallingBtn');
    if (callBtn) {
      callBtn.addEventListener('click', () => this.switchTab('leads'));
    }

    const addLeadBtn = document.getElementById('dashAddLeadBtn');
    if (addLeadBtn) {
      addLeadBtn.addEventListener('click', () => this.openNewLeadModal());
    }

    const fastExpBtn = document.getElementById('dashFastExpenseBtn');
    if (fastExpBtn) {
      fastExpBtn.addEventListener('click', () => this.openFastExpenseModal());
    }

    document.querySelectorAll('.open-wa-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const leadId = btn.dataset.leadId;
        this.openWhatsAppSequenceModal(leadId);
      });
    });
  }

  // =========================================================================
  // 2. CUSTOMER & LEAD CRM
  // =========================================================================
  renderLeadsHTML() {
    const leads = store.getLeads();
    const tractors = store.getTractors();

    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div style="display:flex; gap:10px; align-items:center;">
          <input type="text" id="leadSearchInput" class="form-input" placeholder="Search by farmer name, village, phone..." style="width:280px;" />
          <select id="leadStageFilter" class="form-select" style="width:160px;">
            <option value="ALL">All Stages</option>
            <option value="HOT">🔥 Hot Leads</option>
            <option value="Price / Estimate Sent">Price / Estimate Sent</option>
            <option value="Demo Scheduled">Demo Scheduled</option>
            <option value="Negotiation">In Negotiation</option>
            <option value="New Enquiry">New Enquiry</option>
          </select>
        </div>
        <button class="quick-action-btn btn-primary" id="openNewLeadBtn">
          ${renderIcon('plus')} Add New Farmer Lead
        </button>
      </div>

      <div class="panel-card">
        <div class="table-responsive">
          <table class="data-table" id="leadsTable">
            <thead>
              <tr>
                <th>Farmer Name & Contact</th>
                <th>Village & Land</th>
                <th>Crops & Soil</th>
                <th>Current Tractor</th>
                <th>Interested Model</th>
                <th>Buying Score</th>
                <th>Finance / Exchange</th>
                <th>Next Action</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${leads.map(lead => {
                const scoreObj = calculateBuyingScore(lead);
                const tractor = tractors.find(t => t.id === lead.interestedModelId);
                const tractorNamePart = tractor ? `<strong style="color:var(--primary);">${tractor.brand} ${tractor.model}</strong>` : (lead.interestedModelName ? `<strong style="color:var(--primary);">${lead.interestedModelName}</strong>` : '');
                const budgetPart = (lead.budgetMax !== null && lead.budgetMax !== undefined && lead.budgetMax !== '' && Number(lead.budgetMax) > 0) ? `<span style="font-size:11.5px; color:var(--text-secondary);">Budget: ₹${(Number(lead.budgetMax) / 100000).toFixed(1)}L</span>` : '';
                const modelBudgetContent = (tractorNamePart && budgetPart) ? `${tractorNamePart}<br>${budgetPart}` : (tractorNamePart || budgetPart || '<span style="color:var(--text-muted);">-</span>');

                const villagePart = lead.village ? `<strong>${lead.village}</strong>` : '';
                const landPart = (lead.landAcres !== null && lead.landAcres !== undefined && lead.landAcres !== '' && Number(lead.landAcres) > 0) ? `<span style="font-size:12px; color:var(--text-secondary);">${lead.landAcres} Acres</span>` : '';
                const villageLandContent = (villagePart && landPart) ? `${villagePart}<br>${landPart}` : (villagePart || landPart || '<span style="color:var(--text-muted);">-</span>');

                const cropsPart = (lead.crops && lead.crops.length > 0) ? `<span>🌾 ${lead.crops.join(', ')}</span>` : '';
                const soilPart = lead.soilType ? `<span style="color:var(--text-muted); font-size:11px;">${lead.soilType}</span>` : '';
                const cropsSoilContent = (cropsPart && soilPart) ? `${cropsPart}<br>${soilPart}` : (cropsPart || soilPart || '<span style="color:var(--text-muted);">-</span>');

                const finPart = lead.financeRequired === true ? `<span>Finance: <strong>Yes${lead.financeBank ? ' (' + lead.financeBank + ')' : ''}</strong></span>` : (lead.financeRequired === false ? '<span>Finance: <strong>Cash</strong></span>' : '');
                const exPart = lead.exchangeWanted === true ? '<span>Exchange: <strong>Yes</strong></span>' : (lead.exchangeWanted === false ? '<span>Exchange: <strong>No</strong></span>' : '');
                const finExContent = (finPart && exPart) ? `${finPart}<br>${exPart}` : (finPart || exPart || '<span style="color:var(--text-muted);">-</span>');

                return `
                  <tr data-lead-id="${lead.id}">
                    <td>
                      <strong>${lead.name || 'Farmer Customer'}</strong><br>
                      ${lead.phone && lead.phone !== '-' ? `<span style="font-size:11.5px; color:var(--text-muted);">${lead.phone}</span><br>` : ''}
                      ${scoreObj.score !== null ? `
                        <span class="badge ${scoreObj.category === 'HOT' ? 'badge-hot' : (scoreObj.category === 'WARM' ? 'badge-warm' : 'badge-cold')}" style="cursor:pointer; margin-top:2px;" title="Click to edit score" onclick="window.app.openScoreModal('${lead.id}')">
                          ${scoreObj.category} (${scoreObj.score}/100) ✎
                        </span>
                      ` : `
                        <span class="badge" style="background:#f8fafc; color:#64748b; border:1px dashed #cbd5e1; cursor:pointer; margin-top:2px;" title="Click to set score" onclick="window.app.openScoreModal('${lead.id}')">
                          + Set Score
                        </span>
                      `}
                    </td>
                    <td>${villageLandContent}</td>
                    <td style="font-size:12px;">${cropsSoilContent}</td>
                    <td style="font-size:12px;">
                      ${lead.currentTractor ? `<span>${lead.currentTractor}</span>` : '<span style="color:var(--text-muted);">-</span>'}
                    </td>
                    <td>${modelBudgetContent}</td>
                    <td>
                      ${scoreObj.score !== null ? `
                        <div class="prob-container" style="cursor:pointer;" title="Click to edit score" onclick="window.app.openScoreModal('${lead.id}')">
                          <div class="prob-track">
                            <div class="prob-fill ${scoreObj.category === 'HOT' ? 'hot' : 'warm'}" style="width: ${scoreObj.score}%;"></div>
                          </div>
                          <span style="font-size:11px; font-weight:800;">${scoreObj.score}%</span>
                          <button class="quick-action-btn btn-xs btn-outline" style="padding:1px 5px; font-size:10px; margin-left:4px;" title="Edit Score">✎</button>
                        </div>
                      ` : `
                        <button class="quick-action-btn btn-xs btn-outline" style="font-size:11px; padding:3px 8px;" onclick="window.app.openScoreModal('${lead.id}')">
                          + Add Score
                        </button>
                      `}
                    </td>
                    <td style="font-size:11.5px;">${finExContent}</td>
                    <td style="font-size:11.5px; max-width:200px;">
                      ${lead.nextAction ? `<span style="color:var(--danger); font-weight:600;">${lead.nextAction}</span>` : '<span style="color:var(--text-muted);">-</span>'}
                    </td>
                    <td>
                      <div style="display:flex; gap:6px;">
                        <a href="${lead.phone && lead.phone !== '-' ? `tel:${lead.phone}` : '#'}" class="quick-action-btn btn-sm btn-primary" title="Call">
                          ${renderIcon('phone')}
                        </a>
                        <button class="quick-action-btn btn-sm btn-whatsapp open-wa-btn" data-lead-id="${lead.id}" title="WhatsApp Follow-up">
                          ${renderIcon('whatsapp')}
                        </button>
                        <button class="quick-action-btn btn-sm btn-outline edit-lead-btn" data-lead-id="${lead.id}" title="Edit Lead Details">
                          ${renderIcon('edit')}
                        </button>
                        <button class="quick-action-btn btn-sm btn-danger delete-lead-btn" data-lead-id="${lead.id}" title="Delete">
                          ${renderIcon('trash')}
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  bindLeadsEvents() {
    const addBtn = document.getElementById('openNewLeadBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.openNewLeadModal());
    }

    // WhatsApp buttons
    document.querySelectorAll('.open-wa-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openWhatsAppSequenceModal(btn.dataset.leadId);
      });
    });

    document.querySelectorAll('.edit-lead-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openEditLeadModal(btn.dataset.leadId);
      });
    });

    // Delete lead
    document.querySelectorAll('.delete-lead-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm("Are you sure you want to delete this customer lead?")) {
          store.deleteLead(btn.dataset.leadId);
        }
      });
    });

    // Search filter
    const search = document.getElementById('leadSearchInput');
    const stageFilter = document.getElementById('leadStageFilter');
    const filterFn = () => {
      const q = (search.value || '').toLowerCase();
      const stage = stageFilter.value;
      document.querySelectorAll('#leadsTable tbody tr').forEach(row => {
        const text = row.textContent.toLowerCase();
        const matchesQuery = text.includes(q);
        let matchesStage = true;
        if (stage === 'HOT') {
          matchesStage = text.includes('hot');
        } else if (stage !== 'ALL') {
          matchesStage = text.includes(stage.toLowerCase());
        }
        row.style.display = (matchesQuery && matchesStage) ? '' : 'none';
      });
    };

    if (search) search.addEventListener('input', filterFn);
    if (stageFilter) stageFilter.addEventListener('change', filterFn);
  }

  // =========================================================================
  // 3. TRACTOR RECOMMENDATION ENGINE
  // =========================================================================
  renderRecommendationHTML() {
    const tractors = store.getTractors();

    return `
      <div class="dashboard-grid-2col" style="grid-template-columns: 1fr 1.3fr;">
        <!-- Input Configuration Card -->
        <div class="panel-card">
          <div class="panel-header">
            <div>
              <div class="panel-title">${renderIcon('calculator')} Farmer Requirements Input</div>
              <div class="panel-subtitle">Enter land, crop, implement and budget criteria</div>
            </div>
          </div>

          <form id="recommendationForm">
            <div class="form-group">
              <label class="form-label">Total Agricultural Land (Acres)</label>
              <input type="number" id="recLandAcres" class="form-input" value="12" min="1" max="200" />
            </div>

            <div class="form-group">
              <label class="form-label">Soil Type in Village</label>
              <select id="recSoilType" class="form-select">
                <option value="Medium Loam" selected>Medium Loam (Standard)</option>
                <option value="Heavy Black / Clay">Heavy Black Soil / Sticky Clay (Requires High Torque / 4WD)</option>
                <option value="Sandy Loam">Sandy Loam / Light Alluvial</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Primary Implements Needed</label>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-top:4px; font-size:12.5px;">
                <label style="display:flex; align-items:center; gap:6px;">
                  <input type="checkbox" name="recImplements" value="Rotavator (6 ft)" checked /> Rotavator (6-7 ft)
                </label>
                <label style="display:flex; align-items:center; gap:6px;">
                  <input type="checkbox" name="recImplements" value="Heavy Trolley (10-12 Ton)" checked /> Heavy Trolley
                </label>
                <label style="display:flex; align-items:center; gap:6px;">
                  <input type="checkbox" name="recImplements" value="Cultivator 11 Tyne" checked /> Cultivator 11-Tyne
                </label>
                <label style="display:flex; align-items:center; gap:6px;">
                  <input type="checkbox" name="recImplements" value="2-MB Plough" /> 2-MB Reversible Plough
                </label>
                <label style="display:flex; align-items:center; gap:6px;">
                  <input type="checkbox" name="recImplements" value="Laser Leveller" /> Laser Leveller
                </label>
                <label style="display:flex; align-items:center; gap:6px;">
                  <input type="checkbox" name="recImplements" value="Sugarcane Haulage" /> Sugarcane Haulage
                </label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Maximum Estimated Budget (₹)</label>
              <input type="number" id="recBudget" class="form-input" value="880000" step="10000" />
            </div>

            <div class="form-group">
              <label class="form-label">Drive Requirement</label>
              <select id="recDrive" class="form-select">
                <option value="Any" selected>2WD / Any</option>
                <option value="4WD">4WD (Heavy Mud / Wet Paddy Puddling)</option>
              </select>
            </div>

            <button type="submit" class="quick-action-btn btn-primary" style="width:100%; justify-content:center; padding:12px; margin-top:8px;">
              ${renderIcon('sparkles')} Calculate Best Match
            </button>
          </form>
        </div>

        <!-- Output Result Panel -->
        <div class="panel-card" id="recommendationResults">
          <!-- Populated dynamically via JS -->
        </div>
      </div>
    `;
  }

  bindRecommendationEvents() {
    const form = document.getElementById('recommendationForm');
    const runMatch = () => {
      const landAcres = Number(document.getElementById('recLandAcres').value) || 12;
      const soilType = document.getElementById('recSoilType').value;
      const budgetMax = Number(document.getElementById('recBudget').value) || 900000;
      const drive = document.getElementById('recDrive').value;

      const checkedImplements = Array.from(document.querySelectorAll('input[name="recImplements"]:checked')).map(cb => cb.value);

      const result = matchTractor({
        landAcres,
        soilType,
        implementsNeeded: checkedImplements,
        budgetMax,
        requiresHeavyTrolley: checkedImplements.some(i => i.includes('Trolley')),
        drivePreference: drive,
        tractorsList: store.getTractors()
      });

      this.renderRecommendationResults(result, landAcres, budgetMax);
    };

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        runMatch();
      });
      // Run once by default
      runMatch();
    }
  }

  renderRecommendationResults(result, acres, budget) {
    const container = document.getElementById('recommendationResults');
    if (!container) return;

    const best = result.bestMatch;
    const alt = result.alternative;

    if (!best) {
      container.innerHTML = `<div style="padding:30px; text-align:center;">No matching tractor found for criteria.</div>`;
      return;
    }

    const tBest = best.tractor;
    const tAlt = alt ? alt.tractor : null;

    container.innerHTML = `
      <div class="panel-header">
        <div>
          <div class="panel-title">${renderIcon('check')} Deterministic Technical Match</div>
          <div class="panel-subtitle">Recommended HP Band: <strong>${result.recommendedHpRange}</strong> based on ${acres} acres</div>
        </div>
      </div>

      <!-- Best Match Card -->
      <div class="rec-result-card">
        <span class="rec-badge-top">★ BEST MATCH (Score: ${best.score} pts)</span>
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <div class="rec-model-title">${tBest.brand} ${tBest.model}</div>
            <div style="font-size:13px; color:var(--text-secondary);">${tBest.hp} HP Engine | ${tBest.ptoHp} PTO HP | ${tBest.drive}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:22px; font-weight:900; color:var(--primary);">₹${(tBest.price / 100000).toFixed(2)} Lakh</div>
            <span class="badge badge-success">In Stock (${tBest.stockCount} Units)</span>
          </div>
        </div>

        <div class="rec-specs-chips">
          <span class="spec-chip">Lift: ${tBest.liftCapacityKg} kg</span>
          <span class="spec-chip">Transmission: ${tBest.transmission}</span>
          <span class="spec-chip">Warranty: ${tBest.warranty}</span>
        </div>

        <div style="font-size:12.5px; font-weight:700; color:var(--primary-dark); margin-top:10px;">Why this model:</div>
        <ul class="rec-points-list">
          ${best.reasons.map(r => `<li>${renderIcon('check')} ${r}</li>`).join('')}
        </ul>

        <div style="display:flex; gap:10px; margin-top:16px;">
          <button class="quick-action-btn btn-primary" id="recCreateBillBestBtn" style="background:linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);">
            🧾 + New Bill (माँ दुर्गा डीजल)
          </button>
          <button class="quick-action-btn btn-outline" id="recViewUnitMarginBtn" data-tractor-id="${tBest.id}">
            ${renderIcon('rupee')} View Unit Margin
          </button>
        </div>
      </div>

      <!-- Alternative Option Card -->
      ${tAlt ? `
        <div style="margin-top:20px; padding:18px; border:1px solid var(--border-color); border-radius:var(--radius-lg); background:var(--bg-main);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span class="badge badge-info" style="margin-bottom:4px;">ALTERNATIVE / UPGRADE</span>
              <h4 style="font-size:16px; font-weight:800;">${tAlt.brand} ${tAlt.model} (${tAlt.hp} HP)</h4>
              <p style="font-size:12px; color:var(--text-secondary);">₹${(tAlt.price / 100000).toFixed(2)} Lakh | Higher lift capacity (${tAlt.liftCapacityKg} kg) & heavy implements</p>
            </div>
            <button class="quick-action-btn btn-sm btn-outline" id="recViewAltMarginBtn" data-tractor-id="${tAlt.id}">
              View Margins
            </button>
          </div>
        </div>
      ` : ''}
    `;

    // Bind action buttons
    const bestBillBtn = document.getElementById('recCreateBillBestBtn');
    if (bestBillBtn) {
      bestBillBtn.addEventListener('click', () => {
        this.openNewBillModal();
      });
    }

    const altMarginBtn = document.getElementById('recViewAltMarginBtn');
    if (altMarginBtn && tAlt) {
      altMarginBtn.addEventListener('click', () => {
        this.openUnitMarginModal(tAlt.id);
      });
    }

    const unitMarginBtn = document.getElementById('recViewUnitMarginBtn');
    if (unitMarginBtn) {
      unitMarginBtn.addEventListener('click', () => {
        this.openUnitMarginModal(tBest.id);
      });
    }
  }

  // =========================================================================
  // 4. INVENTORY & TRACTOR UNIT ECONOMICS
  // =========================================================================
  renderInventoryHTML() {
    const tractors = store.getTractors();

    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <div style="font-size:13.5px; color:var(--text-secondary);">
          Total Stock: <strong>${tractors.reduce((s, t) => s + (t.stockCount || 0), 0)} Tractors</strong> in showroom and yard
        </div>
        <button class="quick-action-btn btn-primary" id="openFastExpenseForTractorBtn">
          ${renderIcon('plus')} Tag Inward Transport / Repair Expense
        </button>
      </div>

      <div class="inventory-grid">
        ${tractors.map(t => {
          const unitEcon = store.getTractorUnitEconomics(t.id);
          const nominalMargin = t.price - t.dealerPurchaseCost;
          const trueMargin = unitEcon ? unitEcon.actualMargin : nominalMargin;
          const directExpenses = unitEcon ? unitEcon.directExpensesTotal : 0;

          return `
            <div class="tractor-card">
              <div class="tractor-card-header">
                <div>
                  <h4>${t.brand} ${t.model}</h4>
                  <span>${t.hp} HP | ${t.ptoHp} PTO HP | ${t.drive}</span>
                </div>
                <span class="badge badge-success">${t.stockCount} In Stock</span>
              </div>

              <div class="tractor-card-body">
                <div class="tractor-spec-row">
                  <span class="label">Ex-Showroom Price:</span>
                  <span class="value" style="font-size:14px; color:var(--primary);">₹${t.price.toLocaleString('en-IN')}</span>
                </div>
                <div class="tractor-spec-row">
                  <span class="label">OEM Purchase Cost:</span>
                  <span class="value">₹${t.dealerPurchaseCost.toLocaleString('en-IN')}</span>
                </div>
                <div class="tractor-spec-row">
                  <span class="label">Tagged Direct Costs (PDI/Freight):</span>
                  <span class="value" style="color:var(--danger);">-₹${directExpenses.toLocaleString('en-IN')}</span>
                </div>
                <div class="tractor-spec-row" style="border-top:1px solid var(--border-color); padding-top:6px;">
                  <span class="label" style="font-weight:700;">True Dealer Unit Profit:</span>
                  <span class="value" style="font-weight:800; color:var(--success);">₹${trueMargin.toLocaleString('en-IN')}</span>
                </div>

                <div style="font-size:11.5px; color:var(--text-muted); margin-top:6px;">
                  Active Chassis: ${t.chassisList ? t.chassisList.join(', ') : 'Assigned at delivery'}
                </div>
              </div>

              <div class="tractor-card-footer">
                <div class="tractor-card-secondary-actions">
                  <button class="quick-action-btn btn-sm btn-outline edit-tractor-btn" data-tractor-id="${t.id}" title="Edit Tractor Specs & Pricing">
                    ${renderIcon('edit')} Edit
                  </button>
                  <button class="quick-action-btn btn-sm btn-outline add-stock-btn" data-tractor-id="${t.id}" title="Add physical stock unit">
                    ${renderIcon('plus')} Stock
                  </button>
                  <button class="quick-action-btn btn-sm btn-outline view-unit-margin-btn" data-tractor-id="${t.id}" title="Unit Profitability & Margin Leakage">
                    ${renderIcon('calculator')} Margin
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  bindInventoryEvents() {
    document.querySelectorAll('.edit-tractor-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.openEditTractorModal) this.openEditTractorModal(btn.dataset.tractorId);
      });
    });

    document.querySelectorAll('.add-stock-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const chassis = prompt("Enter Chassis Serial Number for new incoming unit (optional):", "");
        store.updateTractorStock(btn.dataset.tractorId, 1, chassis ? chassis.trim() : null);
      });
    });

    document.querySelectorAll('.view-unit-margin-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openUnitMarginModal(btn.dataset.tractorId);
      });
    });

    const expBtn = document.getElementById('openFastExpenseForTractorBtn');
    if (expBtn) {
      expBtn.addEventListener('click', () => this.openFastExpenseModal());
    }
  }

  // =========================================================================
  // 5. BILLING & BILLS (MAA DURGA DIESEL TEMPLATE)
  // =========================================================================
  renderBillingHTML() {
    const bills = store.getBills ? store.getBills() : [];
    const totalBillVolume = bills.reduce((sum, b) => sum + Number(b.totalRupees || 0), 0);
    const nextAutoNo = store.getNextBillNumber ? store.getNextBillNumber() : '87';

    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div>
          <h3 style="margin:0; font-size:18px; font-weight:800; color:var(--text-primary);">Billing Command Center (माँ दुर्गा डीजल)</h3>
          <div style="font-size:12.5px; color:var(--text-secondary); margin-top:3px;">
            Issue and print authentic <strong>माँ दुर्गा डीजल</strong> estimates, customer bills, and receipts
          </div>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <button class="quick-action-btn btn-primary" id="openNewBillBtn" style="background:linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); border:none; box-shadow:0 4px 12px rgba(37,99,235,0.25);">
            🧾 + New Bill (माँ दुर्गा डीजल पर्ची)
          </button>
          <button class="quick-action-btn btn-outline" id="printBlankBillBtn" title="Print blank bill book stationery for manual writing">
            🖨️ Blank Bill Sheet (सादा पर्ची)
          </button>
        </div>
      </div>

      <!-- Metric KPI Cards -->
      <div class="metric-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom:20px;">
        <div class="metric-card">
          <div class="metric-card-header">
            <span class="label">Total Bills Issued</span>
            <div class="metric-icon">🧾</div>
          </div>
          <div class="metric-value">${bills.length}</div>
          <div class="metric-change positive">माँ दुर्गा डीजल Estimates</div>
        </div>

        <div class="metric-card">
          <div class="metric-card-header">
            <span class="label">Total Invoiced Volume</span>
            <div class="metric-icon">₹</div>
          </div>
          <div class="metric-value">₹${totalBillVolume.toLocaleString('en-IN')}</div>
          <div class="metric-change positive">Diesel, Spares & Services</div>
        </div>

        <div class="metric-card">
          <div class="metric-card-header">
            <span class="label">Next Auto Bill No.</span>
            <div class="metric-icon">⚡</div>
          </div>
          <div class="metric-value">No. ${nextAutoNo}</div>
          <div class="metric-change positive">Auto-Generated Sequence</div>
        </div>
      </div>

      <div class="panel-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--border-color); padding-bottom:12px; flex-wrap:wrap; gap:10px;">
          <div style="font-size:14px; font-weight:800; color:var(--text-primary);">
            All Issued Bills & Estimates (${bills.length})
          </div>
          <div style="display:flex; gap:8px;">
            <button class="quick-action-btn btn-sm btn-primary" onclick="window.app.openNewBillModal()">
              + Create Bill
            </button>
            <button class="quick-action-btn btn-sm btn-outline" onclick="window.app.openBillPreviewModal(null, true)">
              🖨️ Blank Sheet
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:110px;">Bill # (नं०)</th>
                <th style="width:110px;">Date (दिनांक)</th>
                <th>Customer / M/s (मेसर्स)</th>
                <th>Village / Address (पता)</th>
                <th>Particulars / Summary (विवरण)</th>
                <th style="text-align:right;">Total Amount (कुल दाम)</th>
                <th style="text-align:right; width:170px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${bills.length === 0 ? `
                <tr>
                  <td colspan="7" style="text-align:center; padding:44px 20px; color:var(--text-muted);">
                    <div style="font-size:36px; margin-bottom:10px;">🧾</div>
                    <div style="font-weight:700; font-size:16px; color:var(--text-secondary);">No bills issued yet</div>
                    <div style="font-size:12.5px; margin-top:4px;">Click "+ Create Bill" to generate a bill in the authentic माँ दुर्गा डीजल template.</div>
                    <div style="margin-top:16px; display:flex; justify-content:center; gap:10px;">
                      <button class="quick-action-btn btn-sm btn-primary" onclick="window.app.openNewBillModal()">
                        🧾 Create First Bill
                      </button>
                      <button class="quick-action-btn btn-sm btn-outline" onclick="window.app.openBillPreviewModal(null, true)">
                        🖨️ View Blank Bill Template
                      </button>
                    </div>
                  </td>
                </tr>
              ` : bills.map(item => {
                const itemCount = (item.items || []).length;
                const summary = (item.items || []).map(i => i.desc).filter(Boolean).slice(0, 2).join(', ');
                return `
                  <tr>
                    <td><strong style="color:var(--primary); font-size:14px;">No. ${item.billNumber}</strong></td>
                    <td>${item.date}</td>
                    <td>
                      <strong>${item.customerName || 'मेसर्स ग्राहक'}</strong><br>
                      <span style="font-size:11px; color:var(--text-muted);">${item.phone || ''}</span>
                    </td>
                    <td>
                      <span style="font-size:12.5px;">${item.address || 'पटना'}</span>
                    </td>
                    <td>
                      <span style="font-size:12.5px;">${summary || 'Diesel & Spares'}</span>
                      ${itemCount > 2 ? `<span style="font-size:11px; color:var(--text-muted);"> (+${itemCount - 2} more)</span>` : ''}
                    </td>
                    <td style="text-align:right;">
                      <strong style="font-size:14px; color:#1e3a8a; font-family:monospace, sans-serif;">₹${(Number(item.totalRupees) || 0).toLocaleString('en-IN')}${item.totalPaise ? '.' + String(item.totalPaise).padStart(2, '0') : ''}</strong>
                    </td>
                    <td style="text-align:right;">
                      <div style="display:inline-flex; gap:6px;">
                        <button class="quick-action-btn btn-xs btn-primary print-bill-btn" data-bill-id="${item.id}" title="Print / View in authentic bill book format">
                          ${renderIcon('print')} Print
                        </button>
                        <button class="quick-action-btn btn-xs btn-outline delete-bill-btn" data-bill-id="${item.id}" title="Delete this bill" style="color:var(--danger);">
                          &times;
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  bindBillingEvents() {
    const newBillBtn = document.getElementById('openNewBillBtn');
    if (newBillBtn) newBillBtn.addEventListener('click', () => this.openNewBillModal());

    const printBlankBtn = document.getElementById('printBlankBillBtn');
    if (printBlankBtn) printBlankBtn.addEventListener('click', () => this.openBillPreviewModal(null, true));

    document.querySelectorAll('.print-bill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const bill = store.getBills().find(b => b.id === btn.dataset.billId);
        if (bill) this.openBillPreviewModal(bill, false);
      });
    });

    document.querySelectorAll('.delete-bill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this bill?')) {
          store.deleteBill(btn.dataset.billId);
          this.renderCurrentView();
        }
      });
    });
  }

  // =========================================================================
  // 6. USED TRACTOR EXCHANGE MODULE
  // =========================================================================
  renderExchangeHTML() {
    return `
      <div class="dashboard-grid-2col" style="grid-template-columns: 1fr 1.3fr;">
        <!-- Input Form Card -->
        <div class="panel-card">
          <div class="panel-header">
            <div>
              <div class="panel-title">${renderIcon('exchange')} Old Tractor Evaluation Entry</div>
              <div class="panel-subtitle">Enter old tractor details for instant objective appraisal</div>
            </div>
          </div>

          <form id="exchangeForm">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Old Tractor Brand</label>
                <input type="text" id="exBrand" class="form-input" value="Mahindra" />
              </div>
              <div class="form-group">
                <label class="form-label">Model Name / HP</label>
                <input type="text" id="exModel" class="form-input" value="265 DI (35 HP)" />
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Year of Manufacture</label>
                <input type="number" id="exYear" class="form-input" value="2018" min="2000" max="2026" />
              </div>
              <div class="form-group">
                <label class="form-label">Meter Working Hours</label>
                <input type="number" id="exHours" class="form-input" value="3800" step="100" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Rear Tyre Condition Remaining (%)</label>
              <input type="range" id="exTyreRange" min="10" max="100" value="60" style="width:100%; accent-color:var(--primary);" />
              <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted);">
                <span>10% (Bald)</span>
                <span id="exTyreVal" style="font-weight:700; color:var(--primary);">60% Remaining Life</span>
                <span>100% (Fresh)</span>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Engine Condition</label>
                <select id="exEngine" class="form-select">
                  <option value="Excellent">Excellent (Zero Smoke, Smooth sound)</option>
                  <option value="Good" selected>Good (Minor blow-by)</option>
                  <option value="Average">Average (Requires ring/piston work)</option>
                  <option value="Poor">Poor (Heavy white/black smoke)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Hydraulics & PTO</label>
                <select id="exHydraulics" class="form-select">
                  <option value="Good" selected>Good (Holds implement steady)</option>
                  <option value="Average">Average (Minor leakage/drop)</option>
                  <option value="Poor">Poor (Pump overhaul needed)</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Upgrade to New Tractor (Select Model)</label>
              <select id="exNewTractorSelect" class="form-select">
                ${store.getTractors().map(t => `
                  <option value="${t.price}">${t.brand} ${t.model} (₹${(t.price / 100000).toFixed(2)}L)</option>
                `).join('')}
              </select>
            </div>

            <button type="submit" class="quick-action-btn btn-primary" style="width:100%; justify-content:center; padding:12px; margin-top:6px;">
              ${renderIcon('calculator')} Run Exchange Appraisal
            </button>
          </form>
        </div>

        <!-- Result Box -->
        <div class="panel-card" id="exchangeResultContainer">
          <!-- Populated by JS -->
        </div>
      </div>
    `;
  }

  bindExchangeEvents() {
    const range = document.getElementById('exTyreRange');
    const valText = document.getElementById('exTyreVal');
    if (range && valText) {
      range.addEventListener('input', () => {
        valText.textContent = `${range.value}% Remaining Life`;
      });
    }

    const form = document.getElementById('exchangeForm');
    const runEval = () => {
      const brand = document.getElementById('exBrand').value;
      const model = document.getElementById('exModel').value;
      const manufactureYear = Number(document.getElementById('exYear').value) || 2018;
      const meterHours = Number(document.getElementById('exHours').value) || 3500;
      const tyreConditionPercent = Number(range.value) || 60;
      const engineCondition = document.getElementById('exEngine').value;
      const hydraulicsCondition = document.getElementById('exHydraulics').value;
      const newTractorPrice = Number(document.getElementById('exNewTractorSelect').value) || 840000;

      const evalData = evaluateUsedTractor({
        brand,
        model,
        manufactureYear,
        meterHours,
        tyreConditionPercent,
        engineCondition,
        hydraulicsCondition,
        newTractorPrice
      });

      this.renderExchangeResults(evalData);
    };

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        runEval();
      });
      runEval();
    }
  }

  renderExchangeResults(evalData) {
    const container = document.getElementById('exchangeResultContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="panel-header">
        <div>
          <div class="panel-title">${renderIcon('check')} Official Used Tractor Appraisal</div>
          <div class="panel-subtitle">For: ${evalData.brand} ${evalData.model} (${evalData.manufactureYear} Model)</div>
        </div>
      </div>

      <!-- Appraisal Price Strip -->
      <div style="background:var(--primary-light); border:1px solid #bbf7d0; border-radius:var(--radius-lg); padding:20px; margin-bottom:18px;">
        <span style="font-size:12px; font-weight:700; color:var(--primary); text-transform:uppercase;">Estimated Exchange Valuation Range</span>
        <div style="font-size:28px; font-weight:900; color:var(--primary-dark); margin:4px 0;">
          ₹${(evalData.minValuation / 100000).toFixed(2)}L – ₹${(evalData.maxValuation / 100000).toFixed(2)} Lakh
        </div>
        <div style="font-size:12px; color:var(--text-secondary);">
          Recommended Showroom Offer: <strong style="color:var(--text-primary);">₹${evalData.recommendedOffer.toLocaleString('en-IN')}</strong>
        </div>
      </div>

      <!-- Psychological Upgrade Calculation -->
      <div style="background:var(--bg-card); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:18px; margin-bottom:18px;">
        <div style="font-size:13px; font-weight:800; margin-bottom:10px; color:var(--text-primary);">Customer Deal Sheet Summary:</div>
        
        <div style="display:flex; justify-content:space-between; font-size:13.5px; padding:6px 0; border-bottom:1px solid var(--border-subtle);">
          <span>New Tractor On-Road Price:</span>
          <span style="font-weight:700;">₹${evalData.newTractorPrice.toLocaleString('en-IN')}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:13.5px; padding:6px 0; border-bottom:1px solid var(--border-subtle); color:var(--danger);">
          <span>Less: Old Tractor Trade-in Value:</span>
          <span style="font-weight:700;">-₹${evalData.recommendedOffer.toLocaleString('en-IN')}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:16px; padding:10px 0; font-weight:900; color:var(--primary);">
          <span>Effective Cash Outflow to Upgrade:</span>
          <span>₹${evalData.effectivePurchaseAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <!-- Inspection Checklist Table -->
      <div style="font-size:12.5px; font-weight:800; margin-bottom:8px;">Showroom Mechanic Physical Inspection Checklist:</div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Inspection Component</th>
              <th>Status / Condition</th>
              <th>Critical Check</th>
            </tr>
          </thead>
          <tbody>
            ${evalData.inspectionChecklist.map(c => `
              <tr>
                <td><strong>${c.item}</strong></td>
                <td><span class="badge ${c.status === 'Poor' ? 'badge-hot' : 'badge-success'}">${c.status}</span></td>
                <td>${c.critical ? '<span style="color:var(--danger); font-weight:700;">Required</span>' : 'Standard'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="margin-top:16px; display:flex; gap:10px;">
        <button class="quick-action-btn btn-primary" id="applyExchangeToBillBtn" style="background:linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);">
          🧾 Transfer to Showroom Bill
        </button>
        <button class="quick-action-btn btn-whatsapp" id="sendExchangeOnWaBtn">
          ${renderIcon('whatsapp')} Send Offer on WhatsApp
        </button>
      </div>
    `;

    const applyBillBtn = document.getElementById('applyExchangeToBillBtn');
    if (applyBillBtn) {
      applyBillBtn.addEventListener('click', () => {
        this.openNewBillModal();
      });
    }

    const waBtn = document.getElementById('sendExchangeOnWaBtn');
    if (waBtn) {
      waBtn.addEventListener('click', () => {
        const msg = `Namaskar Kisan Bhai 🙏\n\nExchange Evaluation for your ${evalData.brand} ${evalData.model} (${evalData.manufactureYear}):\n\n💰 Estimated Trade-in Value: ₹${evalData.recommendedOffer.toLocaleString('en-IN')}\n🚜 New Tractor Price: ₹${evalData.newTractorPrice.toLocaleString('en-IN')}\n✨ Net Upgrade Amount: ₹${evalData.effectivePurchaseAmount.toLocaleString('en-IN')}\n\nVisit Maa Durga Engineering showroom for vehicle inspection & delivery booking!`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
      });
    }
  }

  // =========================================================================
  // 7. FARMER EMI & HARVEST-CYCLE CALCULATOR
  // =========================================================================
  renderEmiHTML() {
    return `
      <div class="dashboard-grid-2col" style="grid-template-columns: 1fr 1.3fr;">
        <div class="panel-card">
          <div class="panel-header">
            <div>
              <div class="panel-title">${renderIcon('calculator')} Loan & Harvest EMI Settings</div>
              <div class="panel-subtitle">Calculates monthly and bi-annual harvest payments</div>
            </div>
          </div>

          <form id="emiForm">
            <div class="form-group">
              <label class="form-label">Tractor On-Road Price (₹)</label>
              <input type="number" id="emiTractorPrice" class="form-input" value="840000" step="5000" />
            </div>

            <div class="form-group">
              <label class="form-label">Govt Agricultural Subsidy (if applicable)</label>
              <input type="number" id="emiSubsidy" class="form-input" value="0" step="5000" />
            </div>

            <div class="form-group">
              <label class="form-label">Farmer Down Payment (₹)</label>
              <input type="number" id="emiDownPayment" class="form-input" value="200000" step="5000" />
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Loan Tenure (Years)</label>
                <select id="emiTenure" class="form-select">
                  <option value="3">3 Years (36 Months)</option>
                  <option value="5" selected>5 Years (60 Months)</option>
                  <option value="7">7 Years (84 Months)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Bank Interest Rate (% p.a.)</label>
                <input type="number" id="emiRate" class="form-input" value="10.5" step="0.25" />
              </div>
            </div>

            <button type="submit" class="quick-action-btn btn-primary" style="width:100%; justify-content:center; padding:12px; margin-top:6px;">
              ${renderIcon('calculator')} Calculate EMI Schedule
            </button>
          </form>
        </div>

        <div class="panel-card" id="emiResultContainer">
          <!-- Populated by JS -->
        </div>
      </div>
    `;
  }

  bindEmiEvents() {
    const form = document.getElementById('emiForm');
    const runEmi = () => {
      const price = Number(document.getElementById('emiTractorPrice').value) || 840000;
      const subsidy = Number(document.getElementById('emiSubsidy').value) || 0;
      const downPayment = Number(document.getElementById('emiDownPayment').value) || 200000;
      const tenureYears = Number(document.getElementById('emiTenure').value) || 5;
      const annualInterestRate = Number(document.getElementById('emiRate').value) || 10.5;

      const calc = calculateTractorLoan({
        tractorPrice: price,
        subsidyAmount: subsidy,
        downPayment,
        tenureYears,
        annualInterestRate
      });

      this.renderEmiResults(calc);
    };

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        runEmi();
      });
      runEmi();
    }
  }

  renderEmiResults(calc) {
    const container = document.getElementById('emiResultContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="panel-header">
        <div>
          <div class="panel-title">${renderIcon('bank')} Repayment Schedule Breakdown</div>
          <div class="panel-subtitle">Loan Principal: ₹${calc.loanPrincipal.toLocaleString('en-IN')} over ${calc.tenureYears} Years</div>
        </div>
      </div>

      <!-- Dual Option Strip: Monthly vs Harvest EMI -->
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:20px;">
        <div style="background:var(--bg-main); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px; text-align:center;">
          <span style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Standard Monthly EMI</span>
          <div style="font-size:24px; font-weight:900; color:var(--text-primary); margin:6px 0;">
            ₹${calc.monthlyEmi.toLocaleString('en-IN')}
          </div>
          <span style="font-size:11px; color:var(--text-secondary);">60 equal installments</span>
        </div>

        <div style="background:var(--primary-light); border:1px solid #bbf7d0; border-radius:var(--radius-md); padding:16px; text-align:center;">
          <span style="font-size:11px; font-weight:700; color:var(--primary); text-transform:uppercase;">🌾 Harvest-Cycle EMI (Bi-Annual)</span>
          <div style="font-size:24px; font-weight:900; color:var(--primary-dark); margin:6px 0;">
            ₹${calc.biAnnualHarvestEmi.toLocaleString('en-IN')}
          </div>
          <span style="font-size:11px; color:var(--primary);">Paid only after Rabi & Kharif harvest (twice/yr)</span>
        </div>
      </div>

      <!-- Summary Sheet -->
      <div style="display:flex; flex-direction:column; gap:8px; font-size:13px; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid var(--border-subtle);">
          <span>Net Tractor Cost:</span>
          <span style="font-weight:700;">₹${calc.netTractorCost.toLocaleString('en-IN')}</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid var(--border-subtle);">
          <span>Farmer Down Payment:</span>
          <span style="font-weight:700; color:var(--accent-dark);">₹${calc.downPayment.toLocaleString('en-IN')}</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid var(--border-subtle);">
          <span>Loan Amount Financed:</span>
          <span style="font-weight:700;">₹${calc.loanPrincipal.toLocaleString('en-IN')}</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid var(--border-subtle);">
          <span>Total Interest over ${calc.tenureYears} Yrs:</span>
          <span style="font-weight:700; color:var(--danger);">₹${calc.totalInterest.toLocaleString('en-IN')}</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding:8px 0; font-size:15px; font-weight:900; color:var(--primary-dark);">
          <span>Total Repayment Amount:</span>
          <span>₹${calc.totalRepayment.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <!-- Principal vs Interest Bar -->
      <div style="margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; font-size:11.5px; margin-bottom:4px;">
          <span>Principal: ${calc.principalPercent}%</span>
          <span>Interest: ${calc.interestPercent}%</span>
        </div>
        <div style="height:10px; border-radius:var(--radius-full); overflow:hidden; display:flex;">
          <div style="width:${calc.principalPercent}%; background:var(--primary);"></div>
          <div style="width:${calc.interestPercent}%; background:var(--gold);"></div>
        </div>
      </div>

      <div style="display:flex; gap:10px;">
        <button class="quick-action-btn btn-whatsapp" id="shareEmiWhatsAppBtn">
          ${renderIcon('whatsapp')} Send EMI Plan on WhatsApp
        </button>
      </div>
    `;

    const waBtn = document.getElementById('shareEmiWhatsAppBtn');
    if (waBtn) {
      waBtn.addEventListener('click', () => {
        const msg = `Namaskar Kisan Bhai 🙏\n\nExclusive Tractor Loan Plan from Maa Durga Engineering:\n\n🚜 Tractor Cost: ₹${calc.netTractorCost.toLocaleString('en-IN')}\n💰 Down Payment: ₹${calc.downPayment.toLocaleString('en-IN')}\n📄 Financed Amount: ₹${calc.loanPrincipal.toLocaleString('en-IN')} (${calc.tenureYears} Yrs)\n\n✓ Monthly EMI: ₹${calc.monthlyEmi.toLocaleString('en-IN')}\n🌾 Harvest Season EMI (Twice/Year): ₹${calc.biAnnualHarvestEmi.toLocaleString('en-IN')}\n\nCall our finance desk for 24hr loan sanction!`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
      });
    }
  }

  // =========================================================================
  // 8. FIELD DEMOS & TESTING
  // =========================================================================
  renderDemosHTML() {
    const demos = store.getDemos();

    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <div style="font-size:13px; color:var(--text-secondary);">
          Track field demonstrations across farmer villages
        </div>
        <button class="quick-action-btn btn-primary" id="openNewDemoModalBtn">
          ${renderIcon('plus')} Schedule Tractor Demo
        </button>
      </div>

      <div class="panel-card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Demo ID</th>
                <th>Farmer Name</th>
                <th>Village</th>
                <th>Tractor & Implement</th>
                <th>Demo Date</th>
                <th>Salesman / Driver</th>
                <th>Diesel Fuel / Mileage</th>
                <th>Customer Reaction</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${demos.map(d => `
                <tr>
                  <td><strong>${d.id}</strong></td>
                  <td><strong>${d.leadName}</strong></td>
                  <td>${d.village}</td>
                  <td>
                    <strong style="color:var(--primary);">${d.tractorModel}</strong><br>
                    <span style="font-size:11px; color:var(--text-muted);">${d.implement}</span>
                  </td>
                  <td>${d.demoDate}</td>
                  <td>${d.salesman}</td>
                  <td>${d.dieselConsumedLtr || 'Pending'}</td>
                  <td>
                    ${d.customerRating ? `⭐ ${d.customerRating}/5` : 'Awaiting trial'}<br>
                    <span style="font-size:11px; color:var(--text-secondary);">${d.reaction || d.notes || ''}</span>
                  </td>
                  <td>
                    <span class="badge ${d.status === 'Completed' ? 'badge-success' : 'badge-pending'}">
                      ${d.status}
                    </span>
                  </td>
                  <td>
                    ${d.status !== 'Completed' ? `
                      <button class="quick-action-btn btn-sm btn-outline mark-demo-completed-btn" data-demo-id="${d.id}">
                        ${renderIcon('check')} Complete
                      </button>
                    ` : '<span style="color:var(--success); font-weight:700;">Finished</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  bindDemosEvents() {
    const newBtn = document.getElementById('openNewDemoModalBtn');
    if (newBtn) {
      newBtn.addEventListener('click', () => this.openNewDemoModal());
    }

    document.querySelectorAll('.mark-demo-completed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const rating = prompt("Enter customer reaction rating (1 to 5 stars):", "5");
        const diesel = prompt("Enter diesel consumption tested (e.g. 4.6 L/Acre):", "4.6 Litres / Acre");
        if (rating) {
          store.updateDemo(btn.dataset.demoId, {
            status: 'Completed',
            customerRating: Number(rating) || 5,
            dieselConsumedLtr: diesel || '4.5 L/Acre',
            reaction: 'Customer satisfied with implement performance.'
          });
        }
      });
    });
  }

  // =========================================================================
  // 9. SHOWROOM EXPENSES & APPROVAL TIER
  // =========================================================================
  renderExpensesHTML() {
    const expenses = store.getExpenses();
    const pending = expenses.filter(e => e.status === 'Pending Approval');

    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div style="font-size:13px; color:var(--text-secondary);">
          Automatic Rules: Expenses <strong>&lt; ₹5,000 auto-approved</strong> | <strong>&ge; ₹5,000 requires Director approval</strong>
        </div>
        <button class="quick-action-btn btn-primary" id="openFastExpenseModalBtn">
          ${renderIcon('plus')} Fast Expense Entry
        </button>
      </div>

      ${pending.length > 0 ? `
        <div style="background:var(--warning-light); border:1px solid #fde68a; border-radius:var(--radius-lg); padding:16px; margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h4 style="font-size:15px; font-weight:800; color:#b45309; display:flex; align-items:center; gap:6px;">
                ${renderIcon('calculator')} Pending Manager Approvals (${pending.length})
              </h4>
              <p style="font-size:12px; color:#92400e; margin-top:2px;">
                High-value operational expenses requiring showroom director sign-off before posting to cash ledger.
              </p>
            </div>
          </div>
        </div>
      ` : ''}

      <div class="panel-card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Expense ID</th>
                <th>Date</th>
                <th>Category</th>
                <th>Amount (₹)</th>
                <th>Payment Mode</th>
                <th>Paid To / Purpose</th>
                <th>Chassis Tag (Unit Cost)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${expenses.map(e => `
                <tr>
                  <td><strong>${e.id}</strong></td>
                  <td>${e.date}</td>
                  <td><span class="badge badge-info">${e.category}</span></td>
                  <td><strong style="font-size:14px; color:var(--text-primary);">₹${Number(e.amount).toLocaleString('en-IN')}</strong></td>
                  <td>${e.paymentMode || 'Cash'}</td>
                  <td>
                    <strong>${e.paidTo || 'Vendor'}</strong><br>
                    <span style="font-size:11px; color:var(--text-secondary);">${e.notes || ''}</span>
                  </td>
                  <td>
                    ${e.chassisTag ? `<span class="badge badge-warm">🏷️ ${e.chassisTag}</span>` : '<span style="color:var(--text-muted); font-size:11px;">General Showroom</span>'}
                  </td>
                  <td>
                    <span class="badge ${e.status === 'Approved' ? 'badge-success' : 'badge-pending'}">
                      ${e.status}
                    </span><br>
                    <span style="font-size:10px; color:var(--text-muted);">${e.approvedBy || 'Pending'}</span>
                  </td>
                  <td>
                    <div style="display:flex; gap:6px;">
                      ${e.status === 'Pending Approval' ? `
                        <button class="quick-action-btn btn-sm btn-primary approve-expense-btn" data-exp-id="${e.id}" title="Approve Expense">
                          ${renderIcon('check')} Approve
                        </button>
                      ` : ''}
                      <button class="quick-action-btn btn-sm btn-danger delete-expense-btn" data-exp-id="${e.id}" title="Delete">
                        ${renderIcon('trash')}
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  bindExpensesEvents() {
    const addBtn = document.getElementById('openFastExpenseModalBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.openFastExpenseModal());
    }

    document.querySelectorAll('.approve-expense-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        store.approveExpense(btn.dataset.expId, 'Showroom Director (Approved)');
      });
    });

    document.querySelectorAll('.delete-expense-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm("Delete this expense entry?")) {
          store.deleteExpense(btn.dataset.expId);
        }
      });
    });
  }

  // =========================================================================
  // 10. CASH & BANK / CASH FLOW (MONEY IN VS MONEY OUT)
  // =========================================================================
  renderCashFlowHTML() {
    const snapshot = store.getFinancialSnapshot();
    const txns = store.getCashTransactions();

    return `
      <!-- Distinction Banner: Accounting Profit vs Cash Flow -->
      <div style="background:linear-gradient(135deg, #091e13 0%, #173f27 100%); color:#fff; border-radius:var(--radius-lg); padding:20px 24px; margin-bottom:24px;">
        <h3 style="font-size:18px; font-weight:800; color:#fbbf24; margin-bottom:4px;">
          Cash Flow vs Profit: The Showroom Reality
        </h3>
        <p style="font-size:13px; color:#d1fae5; line-height:1.4;">
          Your accounting Net Profit is <strong>₹${(snapshot.netProfit / 100000).toFixed(2)} Lakh</strong>, while actual Net Cash Flow is <strong>₹${(snapshot.netCashFlow / 100000).toFixed(2)} Lakh</strong>.
          Tracking customer token advances and delayed bank loan disbursements ensures you never face sudden liquidity shortages.
        </p>
      </div>

      <!-- Money In vs Money Out Metric Cards -->
      <div class="metric-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="metric-card success">
          <div class="metric-top">
            <span class="metric-label">Total Money In (Collections)</span>
            <div class="metric-icon-wrap success">${renderIcon('bank')}</div>
          </div>
          <div class="metric-value" style="color:var(--success);">+₹${snapshot.cashIn.toLocaleString('en-IN')}</div>
          <div class="metric-sub">Tractor sales, advances, loan disbursements</div>
        </div>

        <div class="metric-card danger">
          <div class="metric-top">
            <span class="metric-label">Total Money Out (Payments)</span>
            <div class="metric-icon-wrap danger">${renderIcon('expense')}</div>
          </div>
          <div class="metric-value" style="color:var(--danger);">-₹${snapshot.cashOut.toLocaleString('en-IN')}</div>
          <div class="metric-sub">OEM tractor orders, staff salaries, rent, fuel</div>
        </div>

        <div class="metric-card gold">
          <div class="metric-top">
            <span class="metric-label">Net Cash Balance</span>
            <div class="metric-icon-wrap gold">${renderIcon('rupee')}</div>
          </div>
          <div class="metric-value">+₹${snapshot.netCashFlow.toLocaleString('en-IN')}</div>
          <div class="metric-sub">Current liquid working capital</div>
        </div>
      </div>

      <!-- Cash Transactions Table -->
      <div class="panel-card">
        <div class="panel-header">
          <div class="panel-title">${renderIcon('bank')} Recent Cash & Bank Transactions</div>
          <button class="quick-action-btn btn-sm btn-primary" id="openAddCashTxnBtn">
            ${renderIcon('plus')} Record Cash Movement
          </button>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Date</th>
                <th>Flow Type</th>
                <th>Category</th>
                <th>Amount (₹)</th>
                <th>Party / Source</th>
                <th>Payment Mode</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              ${txns.map(t => `
                <tr>
                  <td><strong>${t.id}</strong></td>
                  <td>${t.date}</td>
                  <td>
                    <span class="badge ${t.type === 'IN' ? 'badge-success' : 'badge-hot'}">
                      ${t.type === 'IN' ? '↓ MONEY IN' : '↑ MONEY OUT'}
                    </span>
                  </td>
                  <td><strong>${t.category}</strong></td>
                  <td>
                    <strong style="font-size:14px; color:${t.type === 'IN' ? 'var(--success)' : 'var(--danger)'};">
                      ${t.type === 'IN' ? '+' : '-'}₹${Number(t.amount).toLocaleString('en-IN')}
                    </strong>
                  </td>
                  <td>${t.party}</td>
                  <td>${t.mode}</td>
                  <td style="font-size:11px; color:var(--text-muted);">${t.ref || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  bindCashFlowEvents() {
    const addBtn = document.getElementById('openAddCashTxnBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const party = prompt("Enter Party / Customer / Vendor Name:", "Kisan Advance Booking");
        const amount = prompt("Enter Amount (₹):", "50000");
        const type = confirm("Click OK for Money IN (Collection), or Cancel for Money OUT (Payment)") ? 'IN' : 'OUT';
        if (party && amount) {
          store.addCashTransaction({
            type,
            category: type === 'IN' ? 'Customer Advance' : 'Operational Expense',
            amount: Number(amount) || 0,
            party,
            mode: 'Bank / Cash',
            ref: 'Manual Entry'
          });
        }
      });
    }
  }

  // =========================================================================
  // 11. VILLAGE-LEVEL SALES MAP & MARKET INTELLIGENCE
  // =========================================================================
  renderVillageMapHTML() {
    const leads = store.getLeads();

    // Group leads by village
    const villageCounts = {};
    for (const l of leads) {
      const v = l.village || 'Sadar / Town';
      villageCounts[v] = (villageCounts[v] || 0) + 1;
    }

    const sortedVillages = Object.entries(villageCounts).sort((a, b) => b[1] - a[1]);
    const maxCount = sortedVillages.length > 0 ? sortedVillages[0][1] : 1;

    return `
      <div class="dashboard-grid-2col" style="grid-template-columns: 1.4fr 1fr;">
        <div class="panel-card">
          <div class="panel-header">
            <div>
              <div class="panel-title">${renderIcon('map')} Village Territory Lead Concentration</div>
              <div class="panel-subtitle">Visual distribution of enquiries across agricultural clusters</div>
            </div>
          </div>

          <div style="margin-top:10px;">
            ${sortedVillages.map(([vName, count]) => {
              const widthPct = Math.round((count / maxCount) * 100);
              return `
                <div class="village-bar-item">
                  <div class="village-name">${vName}</div>
                  <div class="village-bar-wrap">
                    <div class="village-bar-fill" style="width:${Math.max(12, widthPct)}%;">
                      ${count} Leads
                    </div>
                  </div>
                  <div class="village-stats">
                    ${count >= 2 ? '🔥 Hot Cluster' : 'Active Territory'}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div style="margin-top:24px; padding:16px; background:var(--bg-main); border-radius:var(--radius-md); border:1px solid var(--border-color);">
            <div style="font-size:13px; font-weight:800; color:var(--text-primary); margin-bottom:6px;">
              Territory Sales Recommendation:
            </div>
            <p style="font-size:12px; color:var(--text-secondary); line-height:1.4;">
              <strong>Village Kalyanpur & Bilaspur</strong> lead your current enquiry pipelines. Farmers there are predominantly growing Sugarcane and Wheat in medium-to-heavy soil. 
              Schedule your field demonstration trolley route through Kalyanpur on Saturday to engage multiple interested farmers in a single trip.
            </p>
          </div>
        </div>

        <!-- Village Details Deep Dive -->
        <div class="panel-card">
          <div class="panel-header">
            <div class="panel-title">Cluster Profile: Village Kalyanpur</div>
          </div>

          <div style="display:flex; flex-direction:column; gap:12px; font-size:13px;">
            <div style="display:flex; justify-content:space-between; padding-bottom:6px; border-bottom:1px solid var(--border-subtle);">
              <span style="color:var(--text-secondary);">Total Active Leads:</span>
              <strong style="color:var(--primary);">14 Farmers</strong>
            </div>
            <div style="display:flex; justify-content:space-between; padding-bottom:6px; border-bottom:1px solid var(--border-subtle);">
              <span style="color:var(--text-secondary);">Dominant Crop Pattern:</span>
              <strong>Wheat + Rice + Sugarcane</strong>
            </div>
            <div style="display:flex; justify-content:space-between; padding-bottom:6px; border-bottom:1px solid var(--border-subtle);">
              <span style="color:var(--text-secondary);">Preferred HP Band:</span>
              <strong>45 – 50 HP (VST Zetor 4511 / 5011)</strong>
            </div>
            <div style="display:flex; justify-content:space-between; padding-bottom:6px; border-bottom:1px solid var(--border-subtle);">
              <span style="color:var(--text-secondary);">Average Farmer Budget:</span>
              <strong>₹8.40 Lakh</strong>
            </div>
            <div style="display:flex; justify-content:space-between; padding-bottom:6px; border-bottom:1px solid var(--border-subtle);">
              <span style="color:var(--text-secondary);">Key Implements in Demand:</span>
              <strong>Rotavator (6ft) + Trolley</strong>
            </div>
          </div>

          <div style="margin-top:20px;">
            <button class="quick-action-btn btn-primary" style="width:100%; justify-content:center;" onclick="alert('Demo Route planned: Salesman Amit Kumar assigned for Village Kalyanpur & Bilaspur tour this Saturday.')">
              ${renderIcon('calendar')} Plan Rural Demonstration Tour
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 12. GROUNDED AI BUSINESS ADVISOR
  // =========================================================================
  renderAiAdvisorHTML() {
    return `
      <div class="panel-card">
        <div class="panel-header">
          <div>
            <div class="panel-title">${renderIcon('bot')} Grounded Showroom Business Advisor</div>
            <div class="panel-subtitle">Ask questions about your live transactions, margin leakage, and lead follow-up strategy</div>
          </div>
          <span class="badge badge-success">Grounded on Real Ledger</span>
        </div>

        <div class="ai-chat-box">
          <div class="ai-messages-wrap" id="aiMessagesContainer">
            <div class="ai-bubble assistant">
              <strong>Namaskar! I am your Maa Durga Engineering business advisor.</strong><br>
              I inspect your actual showroom ledgers, unit expenses, lead scores, and village demand to give you concrete, actionable insights without guesswork.<br><br>
              Try clicking one of the common questions below or type your own question!
            </div>
          </div>

          <div class="ai-quick-prompts">
            <span class="quick-prompt-pill" data-prompt="Why was my profit lower this month?">Why was my profit lower this month?</span>
            <span class="quick-prompt-pill" data-prompt="Which leads should I call today?">Who should I call today?</span>
            <span class="quick-prompt-pill" data-prompt="Which tractor model has the best margin?">Which tractor has the best unit margin?</span>
            <span class="quick-prompt-pill" data-prompt="Which village has the most demand?">Which village has the most demand?</span>
          </div>

          <form id="aiChatForm" class="ai-input-wrap">
            <input type="text" id="aiUserInput" class="form-input" placeholder="Ask about showroom profit, high expenses, lead priorities..." style="flex:1;" />
            <button type="submit" class="quick-action-btn btn-primary">
              ${renderIcon('sparkles')} Ask Advisor
            </button>
          </form>
        </div>
      </div>
    `;
  }

  bindAiAdvisorEvents() {
    const form = document.getElementById('aiChatForm');
    const input = document.getElementById('aiUserInput');
    const container = document.getElementById('aiMessagesContainer');

    const handleQuery = (questionText) => {
      if (!questionText || !container) return;

      // Render user message
      const userDiv = document.createElement('div');
      userDiv.className = 'ai-bubble user';
      userDiv.textContent = questionText;
      container.appendChild(userDiv);

      // Run grounded query
      const reply = queryBusinessAdvisor(questionText);

      // Render assistant reply
      const botDiv = document.createElement('div');
      botDiv.className = 'ai-bubble assistant';
      botDiv.innerHTML = `
        <strong style="font-size:14px; color:var(--primary-dark);">${reply.title}</strong>
        <p style="margin:6px 0; font-size:13px;">${reply.summary}</p>
        <ul style="margin:8px 0; padding-left:18px; font-size:12.5px; display:flex; flex-direction:column; gap:4px;">
          ${reply.keyFindings.map(k => `<li>${k}</li>`).join('')}
        </ul>
        <div style="margin-top:10px; padding:10px; background:#fff; border-radius:var(--radius-sm); border:1px solid #bbf7d0; font-size:12px;">
          <strong>Actionable Strategy:</strong> ${reply.recommendation}
        </div>
      `;
      container.appendChild(botDiv);

      // Scroll to bottom
      container.scrollTop = container.scrollHeight;
    };

    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (text) {
          input.value = '';
          handleQuery(text);
        }
      });
    }

    document.querySelectorAll('.quick-prompt-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        handleQuery(pill.dataset.prompt);
      });
    });
  }

  // =========================================================================
  // MODAL CONTROLLERS & POPUPS
  // =========================================================================
  openNewLeadModal() {
    const modal = document.getElementById('newLeadModal');
    if (!modal) return;
    this.openModal('newLeadModal');

    const form = document.getElementById('newLeadForm');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('nlName').value.trim() || 'Farmer Customer';
        const phone = document.getElementById('nlPhone').value.trim() || '-';
        const village = document.getElementById('nlVillage').value.trim() || 'Local Area';
        const acres = Number(document.getElementById('nlAcres').value) || 5;
        const cropVal = document.getElementById('nlCrop').value.trim();
        const crop = cropVal ? cropVal.split(',').map(c => c.trim()).filter(Boolean) : ['Wheat', 'Paddy'];
        const modelId = document.getElementById('nlModelSelect').value || null;
        const budget = Number(document.getElementById('nlBudget').value) || 750000;
        const finance = document.getElementById('nlFinance').value === 'Yes';
        const exchange = document.getElementById('nlExchange').value === 'Yes';
        const days = Number(document.getElementById('nlDays').value) || 15;

        const newLead = store.addLead({
          name,
          phone,
          village,
          landAcres: acres,
          crops: crop,
          interestedModelId: modelId,
          budgetMax: budget,
          financeRequired: finance,
          exchangeWanted: exchange,
          expectedPurchaseDays: days,
          stage: 'New Enquiry'
        });

        this.closeAllModals();
        showToast(`Lead for <strong>${newLead.name}</strong> created! Buying Score: <strong>${calculateBuyingScore(newLead).score}/100</strong>`, 'success', 'Lead Captured');
      };
    }
  }

  openFastExpenseModal() {
    this.openModal('fastExpenseModal');
    const form = document.getElementById('fastExpenseForm');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const amount = Number(document.getElementById('feAmount').value) || 0;
        const category = document.getElementById('feCategory').value || 'Miscellaneous';
        const paymentMode = document.getElementById('feMode').value || 'Cash';
        const paidTo = document.getElementById('fePaidTo').value.trim() || 'Vendor / Counter';
        const chassisTag = document.getElementById('feChassisTag').value.trim() || null;
        const notes = document.getElementById('feNotes').value.trim();

        store.addExpense({
          amount,
          category,
          paymentMode,
          paidTo,
          chassisTag,
          notes
        });

        this.closeAllModals();
        if (amount >= 5000) {
          showToast(`Expense of ₹${amount.toLocaleString('en-IN')} logged! Pending manager approval (≥ ₹5,000).`, 'warning', 'Pending Approval');
        } else {
          showToast(`Expense of ₹${amount.toLocaleString('en-IN')} logged and auto-approved (< ₹5,000)!`, 'success', 'Expense Recorded');
        }
      };
    }
  }

  openWhatsAppSequenceModal(leadId) {
    const lead = store.getLeads().find(l => l.id === leadId);
    if (!lead) return;

    const tractor = store.getTractors().find(t => t.id === lead.interestedModelId);
    const sequences = generateFollowUpSequences(lead, tractor);

    const bodyEl = document.getElementById('waSequenceModalBody');
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div style="margin-bottom:16px;">
          <h4 style="font-size:16px; font-weight:800;">WhatsApp Nurturing Sequence for ${lead.name}</h4>
          <span style="font-size:12px; color:var(--text-secondary);">Phone: ${lead.phone} | Village: ${lead.village} | Model: ${tractor ? tractor.model : 'Tractor'}</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:16px;">
          ${sequences.map(seq => `
            <div style="border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px; background:var(--bg-main);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span class="badge badge-info">${seq.title}</span>
                <a href="${createWhatsAppUrl(lead.phone, seq.body)}" target="_blank" class="quick-action-btn btn-sm btn-whatsapp">
                  ${renderIcon('whatsapp')} Send on WhatsApp
                </a>
              </div>
              <textarea readonly style="width:100%; height:90px; font-size:12px; font-family:inherit; padding:8px; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:#fff; resize:none;">${seq.body}</textarea>
            </div>
          `).join('')}
        </div>
      `;
    }

    this.openModal('waSequenceModal');
  }

  openUnitMarginModal(tractorId) {
    const unitEcon = store.getTractorUnitEconomics(tractorId);
    if (!unitEcon) return;

    const modalBody = document.getElementById('unitMarginModalBody');
    if (modalBody) {
      const t = unitEcon.tractor;
      modalBody.innerHTML = `
        <div style="margin-bottom:18px;">
          <h4 style="font-size:18px; font-weight:800; color:var(--primary-dark);">${t.brand} ${t.model} Unit Economics</h4>
          <p style="font-size:12px; color:var(--text-secondary);">Breakdown of landed cost vs retail selling price</p>
        </div>

        <div style="background:var(--bg-main); border-radius:var(--radius-lg); padding:18px; margin-bottom:18px;">
          <div style="display:flex; justify-content:space-between; font-size:13.5px; padding:6px 0;">
            <span>Retail Selling Price:</span>
            <span style="font-weight:800; color:var(--primary);">₹${unitEcon.sellingPrice.toLocaleString('en-IN')}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:13.5px; padding:6px 0;">
            <span>OEM Landed Purchase Cost:</span>
            <span style="font-weight:700;">-₹${unitEcon.purchaseCost.toLocaleString('en-IN')}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:13.5px; padding:6px 0; color:var(--danger);">
            <span>Direct Inward Freight & PDI Prep Expenses:</span>
            <span style="font-weight:700;">-₹${unitEcon.directExpensesTotal.toLocaleString('en-IN')}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:16px; padding:10px 0; font-weight:900; color:var(--success); border-top:2px solid var(--border-color);">
            <span>True Dealer Unit Profit:</span>
            <span>₹${unitEcon.actualMargin.toLocaleString('en-IN')} (${unitEcon.marginPercent}%)</span>
          </div>
        </div>

        <div style="font-size:13px; font-weight:800; margin-bottom:8px;">Expenses Directly Tagged to this Chassis:</div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Amount (₹)</th>
                <th>Description</th>
                <th>Chassis Serial</th>
              </tr>
            </thead>
            <tbody>
              ${unitEcon.directExpenses.length > 0 ? unitEcon.directExpenses.map(e => `
                <tr>
                  <td>${e.date}</td>
                  <td><span class="badge badge-info">${e.category}</span></td>
                  <td><strong>₹${Number(e.amount).toLocaleString('en-IN')}</strong></td>
                  <td>${e.notes || e.paidTo}</td>
                  <td><code>${e.chassisTag}</code></td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="5" style="text-align:center; color:var(--text-muted);">No direct chassis expenses tagged yet. Tag inward freight in the Expenses section.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      `;
    }

    this.openModal('unitMarginModal');
  }

  openNewBillModal(prefill = null) {
    this.openModal('newBillModal');
    const nextNo = store.getNextBillNumber();
    const bills = store.getBills();
    const highestPrev = bills.length > 0 ? Math.max(...bills.map(b => parseInt(b.billNumber, 10)).filter(n => !isNaN(n))) : 86;

    const billNoInput = document.getElementById('nbBillNo');
    if (billNoInput) billNoInput.value = prefill?.billNumber || nextNo;

    const hint = document.getElementById('nbBillNoHint');
    if (hint) hint.textContent = `Auto-incremented based on previous bills (Prev: #${highestPrev})`;

    const dateInput = document.getElementById('nbDate');
    if (dateInput) dateInput.value = prefill?.date || new Date().toISOString().split('T')[0];

    const custInput = document.getElementById('nbCustomer');
    if (custInput) custInput.value = prefill?.customerName || '';

    const addrInput = document.getElementById('nbAddress');
    if (addrInput) addrInput.value = prefill?.address || '';

    const vehicleInput = document.getElementById('nbVehicle');
    if (vehicleInput) vehicleInput.value = prefill?.vehicle || '';

    const phoneInput = document.getElementById('nbPhone');
    if (phoneInput) phoneInput.value = prefill?.phone || '9931227178';

    const tbody = document.getElementById('nbItemsBody');
    if (tbody) {
      tbody.innerHTML = '';
      if (prefill?.items && prefill.items.length > 0) {
        prefill.items.forEach(it => this.addBillItemRow(it.desc, it.qty, it.rupees, it.paise));
      } else {
        this.addBillItemRow('डीजल (हाई स्पीड डीजल - 40 Ltr)', '40 L', 3760, 0);
        this.addBillItemRow('इंजन ऑयल Mobil Delvac 15W-40', '1 Can', 2450, 0);
        this.addBillItemRow('डीजल फिल्टर किट (Bosch)', '2 Pc', 680, 0);
      }
    }

    this.recalcBillForm();

    const previewBtn = document.getElementById('nbPreviewOnlyBtn');
    if (previewBtn) {
      previewBtn.onclick = () => {
        const tempBill = this.gatherBillFormData();
        this.closeModal('newBillModal');
        this.openBillPreviewModal(tempBill, false, 'live');
      };
    }

    const form = document.getElementById('newBillForm');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const billData = this.gatherBillFormData();
        const newBill = store.addBill(billData);

        this.closeAllModals();
        showToast(`Bill #${newBill.billNumber} for ${newBill.customerName} created!`, 'success', 'Bill Saved');
        this.openBillPreviewModal(newBill, false, 'filled');
      };
    }
  }

  gatherBillFormData() {
    const nextNo = store.getNextBillNumber();
    const billNumber = document.getElementById('nbBillNo')?.value.trim() || nextNo;
    const date = document.getElementById('nbDate')?.value || new Date().toISOString().split('T')[0];
    const customerName = document.getElementById('nbCustomer')?.value.trim() || 'मेसर्स ग्राहक';
    const address = document.getElementById('nbAddress')?.value.trim() || '';
    const phone = document.getElementById('nbPhone')?.value.trim() || '9931227178';
    const vehicle = document.getElementById('nbVehicle')?.value.trim() || '';

    const rows = document.querySelectorAll('#nbItemsBody tr');
    const items = [];
    rows.forEach(tr => {
      const qty = tr.querySelector('.nb-qty')?.value.trim() || '';
      const desc = tr.querySelector('.nb-desc')?.value.trim() || '';
      const rupees = Number(tr.querySelector('.nb-rupees')?.value) || 0;
      const paise = Number(tr.querySelector('.nb-paise')?.value) || 0;
      if (desc || rupees > 0) {
        items.push({ qty, desc, rupees, paise });
      }
    });

    const totalRupees = items.reduce((s, it) => s + (Number(it.rupees) || 0), 0);
    const totalPaise = items.reduce((s, it) => s + (Number(it.paise) || 0), 0);
    const amountWords = numberToIndianWords(totalRupees);

    return {
      billNumber,
      date,
      customerName,
      address,
      phone,
      vehicle,
      items,
      totalRupees,
      totalPaise,
      amountWords
    };
  }

  addBillItemRow(desc = '', qty = '', rupees = '', paise = '00') {
    const tbody = document.getElementById('nbItemsBody');
    if (!tbody) return;
    const tr = document.createElement('tr');
    const rowIdx = tbody.children.length + 1;
    tr.innerHTML = `
      <td><input type="text" class="form-input nb-qty" style="padding:4px 6px; font-size:12.5px;" placeholder="e.g. 1" value="${qty || rowIdx}" /></td>
      <td><input type="text" class="form-input nb-desc" style="padding:4px 6px; font-size:12.5px;" placeholder="विवरण (Item / Service / Diesel)" value="${desc}" required /></td>
      <td><input type="number" class="form-input nb-rupees" style="padding:4px 6px; font-size:12.5px; text-align:right;" placeholder="0" min="0" value="${rupees}" /></td>
      <td><input type="number" class="form-input nb-paise" style="padding:4px 6px; font-size:12.5px; text-align:center;" placeholder="00" min="0" max="99" value="${paise || '00'}" /></td>
      <td style="text-align:center;">
        <button type="button" class="modal-close-btn" style="color:var(--danger); font-size:16px;" onclick="this.closest('tr').remove(); window.app.recalcBillForm();">&times;</button>
      </td>
    `;
    tbody.appendChild(tr);

    tr.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => this.recalcBillForm());
    });

    this.recalcBillForm();
  }

  addBillPresetItem(desc, qty, rupees, paise = 0) {
    this.addBillItemRow(desc, qty, rupees, paise);
  }

  recalcBillForm() {
    const rows = document.querySelectorAll('#nbItemsBody tr');
    let totalR = 0;
    let totalP = 0;
    rows.forEach(tr => {
      totalR += Number(tr.querySelector('.nb-rupees')?.value) || 0;
      totalP += Number(tr.querySelector('.nb-paise')?.value) || 0;
    });

    if (totalP >= 100) {
      totalR += Math.floor(totalP / 100);
      totalP = totalP % 100;
    }

    const totalDisplay = document.getElementById('nbTotalRupeesDisplay');
    if (totalDisplay) totalDisplay.textContent = `₹${totalR.toLocaleString('en-IN')}`;

    const paiseDisplay = document.getElementById('nbTotalPaiseDisplay');
    if (paiseDisplay) paiseDisplay.textContent = `.${String(totalP).padStart(2, '0')}`;

    const wordsPreview = document.getElementById('nbWordsPreview');
    if (wordsPreview) wordsPreview.textContent = numberToIndianWords(totalR);
  }

  openBillPreviewModal(bill, isBlank = false, startMode = null) {
    const previewBox = document.getElementById('quotePrintPreviewBody');
    if (!previewBox) return;

    const nextAutoNo = store.getNextBillNumber();
    const currentBill = bill ? { ...bill } : {
      billNumber: nextAutoNo,
      date: new Date().toISOString().split('T')[0],
      customerName: '',
      address: '',
      phone: '9931227178',
      items: [
        { qty: '40 L', desc: 'डीजल (हाई स्पीड डीजल - 40 Ltr)', rupees: 3760, paise: 0 },
        { qty: '1 Can', desc: 'इंजन ऑयल Mobil Delvac 15W-40', rupees: 2450, paise: 0 },
        { qty: '2 Pc', desc: 'डीजल फिल्टर किट (Bosch)', rupees: 680, paise: 0 }
      ],
      totalRupees: 6890,
      totalPaise: 0,
      amountWords: numberToIndianWords(6890)
    };

    let activeMode = startMode || (isBlank ? 'live' : 'filled');

    const renderView = (mode) => {
      activeMode = mode;
      const isLive = mode === 'live';
      const isPureBlank = mode === 'pure_blank';
      const isFilled = mode === 'filled';

      previewBox.innerHTML = `
        <div class="template-switch-bar no-print" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <button class="template-switch-btn ${isLive ? 'active' : ''}" id="tsbLiveBtn" title="Direct interactive editing on sheet">
              ✍️ Live Interactive Sheet (पर्ची में सीधे लिखें)
            </button>
            <button class="template-switch-btn" id="tsbOpenFormModalBtn" title="Enter data via clean modal form">
              📝 Fast Form Entry (जैसे फॉर्म से भरें)
            </button>
            <button class="template-switch-btn ${isPureBlank ? 'active' : ''}" id="tsbBlankBtn" title="Blank stationery sheet with dotted lines">
              📄 Pure Blank Stationery (सादा पर्ची)
            </button>
            <button class="template-switch-btn ${isFilled ? 'active' : ''}" id="tsbFilledBtn" title="Official final print view">
              🧾 Official Bill View (No. ${currentBill.billNumber || nextAutoNo})
            </button>
          </div>

          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <span class="badge badge-success" style="font-size:11px; padding:4px 9px;">
              ⚡ Auto Bill No: ${currentBill.billNumber || nextAutoNo}
            </span>
            <button class="quick-action-btn btn-sm btn-primary" id="tsbSaveBillBtn" style="background:linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);">
              💾 Save Bill to System
            </button>
            <button class="quick-action-btn btn-sm btn-outline" onclick="window.print()" style="background:#ffffff; color:#1e3a8a; border-color:#2563eb; font-weight:700;">
              🖨️ Print Official Bill
            </button>
          </div>
        </div>

        ${renderMaaDurgaBillHTML(currentBill, isPureBlank, isLive)}
      `;

      const liveBtn = document.getElementById('tsbLiveBtn');
      const openFormBtn = document.getElementById('tsbOpenFormModalBtn');
      const blankBtn = document.getElementById('tsbBlankBtn');
      const filledBtn = document.getElementById('tsbFilledBtn');
      const saveBillBtn = document.getElementById('tsbSaveBillBtn');

      if (liveBtn) liveBtn.onclick = () => renderView('live');
      if (blankBtn) blankBtn.onclick = () => renderView('pure_blank');
      if (filledBtn) filledBtn.onclick = () => renderView('filled');
      if (openFormBtn) {
        openFormBtn.onclick = () => {
          if (isLive) this.syncLiveSheetDataToCurrent(currentBill);
          this.closeModal('quotePrintPreviewModal');
          this.openNewBillModal(currentBill);
        };
      }

      if (saveBillBtn) {
        saveBillBtn.onclick = () => {
          if (isLive) this.syncLiveSheetDataToCurrent(currentBill);
          const saved = store.addBill(currentBill);
          showToast(`Bill #${saved.billNumber} for ${saved.customerName} successfully saved!`, 'success', 'Saved');
          renderView('filled');
        };
      }

      if (isLive) {
        this.bindLiveSheetEvents(currentBill);
      }
    };

    renderView(activeMode);
    this.openModal('quotePrintPreviewModal');
  }

  syncLiveSheetDataToCurrent(bill) {
    const custInput = document.getElementById('mddLiveCustomer');
    const addrInput = document.getElementById('mddLiveAddress');
    const dateInput = document.getElementById('mddLiveDate');
    if (custInput) bill.customerName = custInput.value.trim() || 'मेसर्स ग्राहक';
    if (addrInput) bill.address = addrInput.value.trim() || '';
    if (dateInput) bill.date = dateInput.value || new Date().toISOString().split('T')[0];

    const rows = document.querySelectorAll('#printableMddBill .mdd-live-row');
    const items = [];
    rows.forEach(tr => {
      const qty = tr.querySelector('.mdd-live-qty')?.value.trim() || '';
      const desc = tr.querySelector('.mdd-live-desc')?.value.trim() || '';
      const rupees = Number(tr.querySelector('.mdd-live-rupees')?.value) || 0;
      const paise = Number(tr.querySelector('.mdd-live-paise')?.value) || 0;
      if (desc || rupees > 0) {
        items.push({ qty, desc, rupees, paise });
      }
    });
    bill.items = items;
    bill.totalRupees = items.reduce((s, it) => s + (Number(it.rupees) || 0), 0);
    bill.totalPaise = items.reduce((s, it) => s + (Number(it.paise) || 0), 0);
    bill.amountWords = numberToIndianWords(bill.totalRupees);
  }

  bindLiveSheetEvents(bill) {
    const table = document.getElementById('printableMddBill');
    if (!table) return;

    const recalc = () => {
      const rows = table.querySelectorAll('.mdd-live-row');
      let totalR = 0;
      let totalP = 0;
      rows.forEach(tr => {
        totalR += Number(tr.querySelector('.mdd-live-rupees')?.value) || 0;
        totalP += Number(tr.querySelector('.mdd-live-paise')?.value) || 0;
      });

      if (totalP >= 100) {
        totalR += Math.floor(totalP / 100);
        totalP = totalP % 100;
      }

      const totalRCell = document.getElementById('mddLiveTotalRupees');
      if (totalRCell) totalRCell.textContent = totalR.toLocaleString('en-IN');

      const totalPCell = document.getElementById('mddLiveTotalPaise');
      if (totalPCell) totalPCell.textContent = String(totalP).padStart(2, '0');

      const wordsCell = document.getElementById('mddLiveWordsVal');
      if (wordsCell) wordsCell.textContent = numberToIndianWords(totalR);

      if (bill) {
        const custInput = document.getElementById('mddLiveCustomer');
        const addrInput = document.getElementById('mddLiveAddress');
        const dateInput = document.getElementById('mddLiveDate');
        if (custInput) bill.customerName = custInput.value.trim() || 'मेसर्स ग्राहक';
        if (addrInput) bill.address = addrInput.value.trim() || '';
        if (dateInput) bill.date = dateInput.value || new Date().toISOString().split('T')[0];
        bill.totalRupees = totalR;
        bill.totalPaise = totalP;
        bill.amountWords = numberToIndianWords(totalR);
      }
    };

    table.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', recalc);
    });
  }

  addLiveSheetItem(desc, qty, rupees, paise = 0) {
    const table = document.getElementById('printableMddBill');
    if (!table) return;
    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const rows = tbody.querySelectorAll('.mdd-live-row');
    let targetRow = null;
    for (const row of rows) {
      const descInput = row.querySelector('.mdd-live-desc');
      const rupeeInput = row.querySelector('.mdd-live-rupees');
      if (descInput && !descInput.value.trim() && (!rupeeInput || !rupeeInput.value)) {
        targetRow = row;
        break;
      }
    }

    if (!targetRow) {
      targetRow = document.createElement('tr');
      targetRow.className = 'mdd-live-row';
      const idx = rows.length + 1;
      targetRow.innerHTML = `
        <td style="width:70px; text-align:center; padding:2px;"><input type="text" class="mdd-sheet-table-input mdd-live-qty" value="${qty || idx}" style="text-align:center; font-weight:700;" /></td>
        <td style="padding:2px;"><input type="text" class="mdd-sheet-table-input mdd-live-desc" value="${desc}" style="font-weight:600;" /></td>
        <td style="width:90px; text-align:right; padding:2px;"><input type="number" class="mdd-sheet-table-input mdd-live-rupees" value="${rupees}" style="text-align:right; font-weight:700; font-family:monospace, sans-serif; font-size:15px;" /></td>
        <td style="width:45px; text-align:center; padding:2px;"><input type="number" class="mdd-sheet-table-input mdd-live-paise" value="${paise || '00'}" style="text-align:center; font-family:monospace, sans-serif; font-size:13.5px;" /></td>
      `;
      tbody.appendChild(targetRow);
    } else {
      targetRow.querySelector('.mdd-live-qty').value = qty || (Array.from(rows).indexOf(targetRow) + 1);
      targetRow.querySelector('.mdd-live-desc').value = desc;
      targetRow.querySelector('.mdd-live-rupees').value = rupees;
      targetRow.querySelector('.mdd-live-paise').value = paise !== undefined ? paise : '00';
    }

    this.bindLiveSheetEvents();
    const ev = new Event('input', { bubbles: true });
    targetRow.querySelector('.mdd-live-rupees').dispatchEvent(ev);
  }

  addLiveSheetBlankRow() {
    const table = document.getElementById('printableMddBill');
    if (!table) return;
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    const idx = tbody.querySelectorAll('.mdd-live-row').length + 1;
    const tr = document.createElement('tr');
    tr.className = 'mdd-live-row';
    tr.innerHTML = `
      <td style="width:70px; text-align:center; padding:2px;"><input type="text" class="mdd-sheet-table-input mdd-live-qty" placeholder="${idx}" style="text-align:center; font-weight:700;" /></td>
      <td style="padding:2px;"><input type="text" class="mdd-sheet-table-input mdd-live-desc" placeholder="विवरण (Item / Service)" style="font-weight:600;" /></td>
      <td style="width:90px; text-align:right; padding:2px;"><input type="number" class="mdd-sheet-table-input mdd-live-rupees" placeholder="0" style="text-align:right; font-weight:700; font-family:monospace, sans-serif; font-size:15px;" /></td>
      <td style="width:45px; text-align:center; padding:2px;"><input type="number" class="mdd-sheet-table-input mdd-live-paise" placeholder="00" style="text-align:center; font-family:monospace, sans-serif; font-size:13.5px;" /></td>
    `;
    tbody.appendChild(tr);
    this.bindLiveSheetEvents();
  }

  openQuotationModal() {
    this.openNewBillModal();
  }

  openPrintQuotationPreview() {
    this.openBillPreviewModal();
  }

  openNewDemoModal() {
    this.openModal('newDemoModal');
    const form = document.getElementById('newDemoForm');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const leadName = document.getElementById('ndLeadName').value.trim() || 'Farmer Customer';
        const village = document.getElementById('ndVillage').value.trim() || 'Local Area';
        const tractorModel = document.getElementById('ndTractorModel').value.trim() || 'VST Zetor 5011 4WD';
        const implement = document.getElementById('ndImplement').value.trim() || 'Rotavator (6 ft)';
        const demoDate = document.getElementById('ndDate').value || new Date().toISOString().split('T')[0];
        const salesman = document.getElementById('ndSalesman').value.trim() || 'Sales Team';

        store.addDemo({
          leadName,
          village,
          tractorModel,
          implement,
          demoDate,
          salesman
        });

        this.closeAllModals();
        showToast(`Field demo with ${tractorModel} scheduled for ${leadName} on ${demoDate}!`, 'success', 'Demo Scheduled');
      };
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new TractorOSApp();
});
