// Main Application Controller for Maa Durga Engineering - Tractor Showroom & Sales OS
import { store } from './store.js';
import { icons, renderIcon } from './icons.js';
import { matchTractor } from './recommendation.js';
import { calculateBuyingScore, getTodayCallsQueue } from './buyingScore.js';

import { evaluateUsedTractor } from './exchangeEvaluator.js';
import { generateFollowUpSequences, createWhatsAppUrl } from './whatsapp.js';
import { queryBusinessAdvisor } from './aiAdvisor.js';
import { DURGA_MAA_LOGO } from './logoData.js';
import { getAnalyticsViewModel, renderBarChartSVG, renderDonutSVG } from './analyticsEngine.js';

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
  const logoSrc = (typeof DURGA_MAA_LOGO !== 'undefined' && DURGA_MAA_LOGO) ? DURGA_MAA_LOGO : '/durga-maa-logo.jpg';
  return `<img src="${logoSrc}" alt="Maa Durga Logo" class="mdd-durga-logo" style="width:100%; height:100%; object-fit:contain; display:block;" onerror="this.onerror=null; this.src='/durga-maa-logo.jpg';" />`;
}

export function getChakraSvg() {
  return `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#000000" stroke-width="3"/>
    <circle cx="50" cy="50" r="42" fill="none" stroke="#000000" stroke-width="1"/>
    <circle cx="50" cy="50" r="7" fill="#000000"/>
    <line x1="50" y1="4" x2="50" y2="96" stroke="#000000" stroke-width="2.5"/>
    <line x1="10.2" y1="27" x2="89.8" y2="73" stroke="#000000" stroke-width="2.5"/>
    <line x1="10.2" y1="73" x2="89.8" y2="27" stroke="#000000" stroke-width="2.5"/>
  </svg>`;
}

export function formatToDMY(dateInput) {
  if (!dateInput) return '';
  const str = String(dateInput).trim();
  if (!str) return '';
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) return str;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return str.replace(/\//g, '-');
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(str)) {
    const [y, m, d] = str.split('T')[0].split(/[-/]/);
    return `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y}`;
  }
  const dateObj = new Date(str);
  if (!isNaN(dateObj.getTime())) {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  }
  return str;
}

export function toIsoDate(dmyOrIso) {
  if (!dmyOrIso) return new Date().toISOString().split('T')[0];
  const str = String(dmyOrIso).trim();
  if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(str)) {
    const [d, m, y] = str.split(/[-/]/);
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  return str.split('T')[0];
}

export function formatAdaptiveRupee(val) {
  const num = Number(val) || 0;
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(2)}L`;
  }
  return `${sign}₹${abs.toLocaleString('en-IN')}`;
}

export function autoFitBillToOnePage(billElement) {
  if (!billElement) return;
  billElement.style.transform = '';
  billElement.style.transformOrigin = '';
  billElement.style.marginBottom = '';
  billElement.style.overflow = '';

  const itemCount = Number(billElement.dataset.itemCount || 0);
  const visualHeight = billElement.getBoundingClientRect().height || billElement.offsetHeight || billElement.scrollHeight;
  const actualHeight = itemCount >= 29 ? Math.max(visualHeight, billElement.scrollHeight) : visualHeight;
  const SAFE_MAX_PX = 1120;

  if (actualHeight > SAFE_MAX_PX) {
    const scale = Math.max(0.78, Math.floor((SAFE_MAX_PX / actualHeight) * 1000) / 1000);
    billElement.style.transform = `scale(${scale})`;
    billElement.style.transformOrigin = 'top center';
    billElement.style.overflow = 'visible';
    const collapsed = actualHeight - (actualHeight * scale);
    billElement.style.marginBottom = `-${collapsed}px`;
  }
}

if (typeof window !== 'undefined' && !window._hasBoundBillPrintAutoFit) {
  window._hasBoundBillPrintAutoFit = true;
  window.addEventListener('beforeprint', () => {
    const bill = document.getElementById('printableMddBill');
    if (bill) autoFitBillToOnePage(bill);
  });
  window.addEventListener('afterprint', () => {
    const bill = document.getElementById('printableMddBill');
    if (bill) {
      bill.style.transform = '';
      bill.style.transformOrigin = '';
      bill.style.marginBottom = '';
      bill.style.overflow = '';
    }
  });
}

export function renderMaaDurgaBillHTML(bill, isPureBlank = false, isLive = false) {
  const nextAutoNo = (typeof store !== 'undefined' && store.getNextBillNumber) ? store.getNextBillNumber() : '87';
  const b = bill || {};
  const billNumber = b.billNumber || nextAutoNo;
  const billName = b.billName || '';
  const rawDate = b.date || new Date().toISOString().split('T')[0];
  const dateStr = isPureBlank ? '' : formatToDMY(rawDate);

  const items = b.items || [];
  const itemCount = items.length;

  // Strict 1-page density calculation based on item count
  let densityClass = 'mdd-density-standard';
  if (itemCount >= 29) {
    densityClass = 'mdd-density-ultra';
  } else if (itemCount >= 19) {
    densityClass = 'mdd-density-dense';
  } else if (itemCount >= 8) {
    densityClass = 'mdd-density-compact';
  }
  const sheetModeClass = isPureBlank ? 'mdd-blank-sheet' : 'mdd-has-items';
  const printRowFont = itemCount >= 36 ? '6pt' : itemCount >= 29 ? '7pt' : itemCount >= 19 ? '8pt' : itemCount >= 8 ? '9pt' : '10pt';
  const printRowPadY = itemCount >= 36 ? '0.15mm' : itemCount >= 29 ? '0.3mm' : itemCount >= 19 ? '0.45mm' : itemCount >= 8 ? '0.7mm' : '0.9mm';
  const printRowMinHeight = itemCount >= 36 ? '3.1mm' : itemCount >= 29 ? '3.8mm' : itemCount >= 19 ? '5.5mm' : itemCount >= 12 ? '8.2mm' : itemCount >= 8 ? '7.4mm' : '0mm';
  const sheetStyle = `--mdd-print-row-font:${printRowFont}; --mdd-print-row-pad-y:${printRowPadY}; --mdd-print-row-min-height:${printRowMinHeight};`;

  let rowsHtml = '';

  if (isLive) {
    if (items.length > 0) {
      items.forEach((item, idx) => {
        const p = item.paise !== undefined && item.paise !== null && item.paise !== '' ? String(item.paise).padStart(2, '0') : '00';
        const serialNo = idx + 1;
        rowsHtml += `
          <tr class="mdd-live-row">
            <td style="width:75px; text-align:center; font-weight:800; font-size:14px; color:#334155; padding:2px 4px;">
              ${serialNo}
            </td>
            <td style="padding:2px 8px;">
              <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                <input type="text" class="mdd-sheet-table-input mdd-live-desc" value="${item.desc || ''}" placeholder="विवरण (Item / Service / Diesel)" style="font-weight:600; flex:1;" />
                <div style="display:flex; align-items:center; gap:2px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:4px; padding:1px 6px;" title="मात्रा / Quantity">
                  <span style="font-size:12px; font-weight:800; color:#64748b;">x</span>
                  <input type="number" class="mdd-sheet-table-input mdd-live-qty" value="${item.qty || ''}" placeholder="Qty" min="0" step="any" style="width:50px; text-align:center; font-weight:800; font-size:13px; color:#1e3a8a;" />
                </div>
              </div>
            </td>
            <td style="width:100px; text-align:right; padding:2px 8px;">
              <input type="number" class="mdd-sheet-table-input mdd-live-rupees" value="${item.rupees !== undefined ? item.rupees : ''}" placeholder="0" min="0" style="text-align:right; font-weight:700; font-family:monospace, sans-serif; font-size:14px;" />
            </td>
            <td style="width:50px; text-align:center; padding:2px 4px;">
              <input type="number" class="mdd-sheet-table-input mdd-live-paise" value="${p}" placeholder="00" min="0" max="99" style="text-align:center; font-family:monospace, sans-serif; font-size:13px;" />
            </td>
          </tr>
        `;
      });
    } else {
      rowsHtml += `
        <tr class="mdd-live-row">
          <td style="width:75px; text-align:center; font-weight:800; font-size:14px; color:#334155; padding:2px 4px;">
            1
          </td>
          <td style="padding:2px 8px;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
              <input type="text" class="mdd-sheet-table-input mdd-live-desc" placeholder="विवरण (Item / Service)..." style="font-weight:600; flex:1;" />
              <div style="display:flex; align-items:center; gap:2px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:4px; padding:1px 6px;" title="मात्रा / Quantity">
                <span style="font-size:12px; font-weight:800; color:#64748b;">x</span>
                <input type="number" class="mdd-sheet-table-input mdd-live-qty" placeholder="Qty" min="0" step="any" style="width:50px; text-align:center; font-weight:800; font-size:13px; color:#1e3a8a;" />
              </div>
            </div>
          </td>
          <td style="width:100px; text-align:right; padding:2px 8px;">
            <input type="number" class="mdd-sheet-table-input mdd-live-rupees" placeholder="0" min="0" style="text-align:right; font-weight:700; font-family:monospace, sans-serif; font-size:14px;" />
          </td>
          <td style="width:50px; text-align:center; padding:2px 4px;">
            <input type="number" class="mdd-sheet-table-input mdd-live-paise" placeholder="00" min="0" max="99" style="text-align:center; font-family:monospace, sans-serif; font-size:13px;" />
          </td>
        </tr>
      `;
    }
    // Spacer row: absorbs remaining height so item rows stay tightly packed at the top with NO extra vertical gaps
    rowsHtml += `
      <tr class="mdd-plane-spacer-row">
        <td style="width:75px;">&nbsp;</td>
        <td>&nbsp;</td>
        <td style="width:100px;">&nbsp;</td>
        <td style="width:50px;">&nbsp;</td>
      </tr>
    `;
  } else if (isPureBlank) {
    // Pure blank plane sheet inside - clean vertical columns, no horizontal boxes
    rowsHtml += `
      <tr class="mdd-plane-spacer-row">
        <td style="width:75px;">&nbsp;</td>
        <td>&nbsp;</td>
        <td style="width:100px;">&nbsp;</td>
        <td style="width:50px;">&nbsp;</td>
      </tr>
    `;
  } else {
    // Official / Print view: render only entered items, then open plain sheet below to Total
    items.forEach((item, idx) => {
      const p = item.paise !== undefined && item.paise !== null && item.paise !== '' ? String(item.paise).padStart(2, '0') : '00';
      const serialNo = idx + 1;
      
      const isCount = !item.unit || item.unit === 'None' || item.unit === 'Pcs' || item.unit === 'Nos';
      const unitSuffix = isCount ? '' : ` ${item.unit}`;
      
      let qtyTag = '';
      if (item.qty !== undefined && item.qty !== null && String(item.qty).trim() !== '') {
        const rawQty = String(item.qty).trim();
        const cleanQty = rawQty.replace(/^x\s*/i, '');
        qtyTag = `x${cleanQty}${unitSuffix}`;
      }

      const rateNote = (item.rate && Number(item.rate) > 0)
        ? ` <span style="font-size:12px; color:#475569; font-weight:500;">(@ ₹${Number(item.rate).toLocaleString('en-IN')}${isCount ? '' : '/' + item.unit})</span>`
        : '';

      let rowRupees = item.rupees;
      if ((rowRupees === undefined || rowRupees === null || rowRupees === '' || rowRupees === 0) && item.qty && item.rate) {
        const qVal = parseFloat(item.qty);
        const rVal = parseFloat(item.rate);
        if (!isNaN(qVal) && !isNaN(rVal) && qVal > 0 && rVal > 0) {
          rowRupees = Math.round(qVal * rVal);
        }
      }

      rowsHtml += `
        <tr class="mdd-item-row">
          <td style="width:75px; text-align:center; font-weight:800; font-size:14px; padding:2px 4px;">${serialNo}</td>
          <td style="font-weight:600; font-size:13.5px; padding:2px 8px;">
            <div class="mdd-item-row-content" style="display:flex; justify-content:space-between; align-items:baseline; width:100%;">
              <span class="mdd-item-desc">${item.desc || ''}${rateNote}</span>
              ${qtyTag ? `<span class="mdd-item-qty-tag" style="font-weight:800; font-family:monospace, sans-serif; font-size:13px; color:#0f172a; margin-left:10px; white-space:nowrap; letter-spacing:0.5px;">${qtyTag}</span>` : ''}
            </div>
          </td>
          <td style="width:100px; text-align:right; font-weight:800; font-family:monospace, sans-serif; font-size:15px; padding:2px 8px;">${rowRupees ? Number(rowRupees).toLocaleString('en-IN') : '-'}</td>
          <td style="width:50px; text-align:center; font-family:monospace, sans-serif; font-size:13px; padding:2px 4px;">${p}</td>
        </tr>
      `;
    });

    // Spacer row: absorbs remaining height so item rows stay tightly packed at the top with NO extra vertical gaps
    rowsHtml += `
      <tr class="mdd-plane-spacer-row">
        <td style="width:75px;">&nbsp;</td>
        <td>&nbsp;</td>
        <td style="width:100px;">&nbsp;</td>
        <td style="width:50px;">&nbsp;</td>
      </tr>
    `;
  }

  const totalR = isPureBlank ? '' : (b.totalRupees !== undefined ? Number(b.totalRupees).toLocaleString('en-IN') : '0');
  const totalP = isPureBlank ? '' : (b.totalPaise ? String(b.totalPaise).padStart(2, '0') : '00');
  const words = isPureBlank ? '' : (b.amountWords || (b.totalRupees ? numberToIndianWords(b.totalRupees) : ''));

  return `
    <div class="mdd-bill-sheet ${densityClass} ${sheetModeClass}" id="printableMddBill" data-item-count="${itemCount}" style="${sheetStyle}">
      <!-- Top Bar with ESTIMATE and Phone -->
      <div class="mdd-top-bar">
        <div class="mdd-estimate-pill">ESTIMATE</div>
        <div class="mdd-top-phone">Mob.: 9931227178</div>
      </div>

      <!-- Header: Durga Logo (Left) | Center Shop Name & Address | Chakra Logo (Right) -->
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
          ${isLive ? `
            <input type="text" class="mdd-sheet-input mdd-bill-no-val" id="mddLiveBillNo" value="${billNumber}" title="बिल नंबर बदलें / Edit Bill Number" style="width:105px; font-size:22px; font-weight:900; font-family:monospace, sans-serif; color:#000000; letter-spacing:1px; border-bottom:1.5px dotted #000000 !important;" />
            ${billName ? `<span class="mdd-bill-name-badge">${billName}</span>` : ''}
            <span class="badge badge-success no-print" style="font-size:10px; margin-left:6px; padding:2px 6px;">✏️ Edit No.</span>
          ` : `
            <span class="mdd-bill-no-val" id="mddLiveBillNoVal">${billNumber}</span>
            ${billName ? `<span class="mdd-bill-name-badge">${billName}</span>` : ''}
            <button type="button" class="no-print" id="mddEditBillNoBtn" title="बिल नंबर बदलें / Edit Bill Number" style="background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; border-radius:4px; padding:2px 8px; font-size:11px; font-weight:700; cursor:pointer; margin-left:6px; display:inline-flex; align-items:center; gap:3px;">
              ✏️ Edit #
            </button>
          `}
        </div>
        <div class="mdd-date-field">
          <span>दिनांक :</span>
          ${isLive ? `
            <input type="text" class="mdd-sheet-input" id="mddLiveDate" value="${dateStr}" placeholder="DD-MM-YYYY" style="width:130px; text-align:center; font-size:14px; font-weight:700; border-bottom:1.5px dotted #000000 !important;" />
          ` : `
            <span class="mdd-dots-line" style="min-width:130px; text-align:center;">${dateStr}</span>
          `}
        </div>
      </div>

      <!-- Customer Row: M/s, Mobile, Address & Vehicle No. -->
      <div class="mdd-customer-section">
        <div class="mdd-cust-row mdd-cust-split">
          <div class="mdd-cust-col" style="flex:1.8; display:flex; align-items:baseline; gap:6px;">
            <span style="font-weight:800; min-width:55px;">मेसर्स :</span>
            ${isLive ? `
              <input type="text" class="mdd-sheet-input" id="mddLiveCustomer" placeholder="ग्राहक का नाम / फर्म का नाम..." value="${(b.customerName || '').replace(/^मेसर्स\s*/i, '')}" style="font-size:15px; font-weight:800; color:#1e3a8a; flex:1;" />
            ` : (isPureBlank ? `
              <span class="mdd-dots-line" style="flex:1;"></span>
            ` : `
              <span class="mdd-dots-line" style="flex:1;">${(b.customerName || '').replace(/^मेसर्स\s*/i, '')}</span>
            `)}
          </div>
          <div class="mdd-cust-col" style="flex:1.2; display:flex; align-items:baseline; gap:6px;">
            <span style="font-weight:700; white-space:nowrap;">मो० नं० :</span>
            ${isLive ? `
              <input type="tel" class="mdd-sheet-input" id="mddLivePhone" placeholder="ग्राहक का मो० नं०..." value="${b.phone || ''}" style="font-size:13.5px; font-weight:700; flex:1;" />
            ` : (isPureBlank ? `
              <span class="mdd-dots-line" style="flex:1;"></span>
            ` : `
              <span class="mdd-dots-line" style="flex:1; font-weight:700; letter-spacing:0.5px;">${b.phone || ''}</span>
            `)}
          </div>
        </div>
        <div class="mdd-cust-row mdd-cust-split">
          <div class="mdd-cust-col" style="flex:1.4; display:flex; align-items:baseline; gap:6px;">
            <span style="font-weight:700; white-space:nowrap;">पता :</span>
            ${isLive ? `
              <input type="text" class="mdd-sheet-input" id="mddLiveAddress" placeholder="पता / गांव व जिला..." value="${b.address || ''}" style="font-size:13.5px; flex:1;" />
            ` : (isPureBlank ? `
              <span class="mdd-dots-line" style="flex:1;"></span>
            ` : `
              <span class="mdd-dots-line" style="flex:1;">${b.address || ''}</span>
            `)}
          </div>
          <div class="mdd-cust-col" style="flex:1; display:flex; align-items:baseline; gap:6px;">
            <span style="font-weight:700; white-space:nowrap;">गाड़ी नं० :</span>
            ${isLive ? `
              <input type="text" class="mdd-sheet-input" id="mddLiveVehicle" placeholder="गाड़ी / ट्रैक्टर नं०..." value="${b.vehicle || ''}" style="font-size:13.5px; font-weight:800; flex:1;" />
            ` : (isPureBlank ? `
              <span class="mdd-dots-line" style="flex:1;"></span>
            ` : `
              <span class="mdd-dots-line" style="flex:1; font-weight:800; letter-spacing:0.5px;">${b.vehicle || ''}</span>
            `)}
          </div>
        </div>
      </div>

      <!-- Items Table Grid -->
      <div class="mdd-table-wrapper">
        <table class="mdd-table">
          <thead>
            <tr>
              <th rowspan="2" style="width:75px; vertical-align:middle;">संख्या</th>
              <th rowspan="2" style="vertical-align:middle;">विवरण</th>
              <th colspan="2" class="dam-header" style="width:150px;">दाम</th>
            </tr>
            <tr>
              <th class="mdd-sub-th" style="width:100px;">रू०</th>
              <th class="mdd-sub-th" style="width:50px;">पै०</th>
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
              <td style="width:100px; text-align:right; font-size:16px; font-weight:900; font-family:monospace, sans-serif;">
                <span id="mddLiveTotalRupees">${totalR}</span>
              </td>
              <td style="width:50px; text-align:center; font-size:14px; font-weight:800; font-family:monospace, sans-serif;">
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
          <span style="white-space:nowrap; font-weight:800;">Rs. in words</span>
          <span class="mdd-dots-line" id="mddLiveWordsVal" style="font-weight:700; font-size:13.5px; padding-left:8px;">${words}</span>
        </div>
        ${itemCount < 12 ? `
          <div class="mdd-words-row" style="height:12px;">
            <span class="mdd-dots-line" style="width:100%;"></span>
          </div>
        ` : ''}
        <div class="mdd-sign-row">
          <div class="mdd-sign-box">
            <div class="mdd-sign-space" style="height: 38px;"></div>
            <div class="mdd-sign-line"></div>
            <div class="mdd-sign-label">हस्ताक्षर</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

class TractorOSApp {
  constructor() {
    this.currentTab = 'dashboard';
    this.expenseDimension = 'category';
    this.expensePeriod = 'all';
    this.expenseFilter = null;
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
        const closeBtn = e.target.closest('.modal-close-btn');
        if (e.target === modal || (closeBtn && !closeBtn.closest('table, tbody, tr, td'))) {
          this.closeAllModals();
        }
      });
    });

    if (!window._hasBoundPrintEvents) {
      window._hasBoundPrintEvents = true;
      window.addEventListener('beforeprint', () => {
        const billModal = document.getElementById('billPreviewModal');
        if (billModal && (billModal.classList.contains('active') || billModal.style.display === 'flex' || billModal.style.display === 'block')) {
          document.body.classList.add('is-printing-bill', 'bill-modal-active', 'modal-open');
        }
      });
      window.addEventListener('afterprint', () => {
        document.body.classList.remove('is-printing-bill');
      });
    }
  }

  switchTab(tabName) {
    if (tabName !== 'analytics' && tabName !== 'summary') {
      if (window.unmountReactAnalytics) {
        window.unmountReactAnalytics();
      }
    }
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
      analytics: { title: "Summary Stats & Business Analytics", sub: "Comprehensive daily, weekly, monthly & yearly multi-metric intelligence" },
      summary: { title: "Summary Stats & Business Analytics", sub: "Comprehensive daily, weekly, monthly & yearly multi-metric intelligence" },
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
    document.body.classList.remove('modal-open', 'bill-modal-active', 'is-printing-bill');
    document.querySelectorAll('.modal-backdrop').forEach(m => {
      m.classList.remove('active');
      m.style.display = 'none';
    });
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
    if (!document.querySelector('.modal-backdrop.active')) {
      document.body.classList.remove('modal-open', 'bill-modal-active', 'is-printing-bill');
    }
  }

  openModal(modalId) {
    this.closeAllModals();
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      modal.style.display = 'flex';
      document.body.classList.add('modal-open');
      if (modalId === 'billPreviewModal') {
        document.body.classList.add('bill-modal-active');
      }
    }
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
      case 'analytics':
      case 'summary':
        if (window.renderReactAnalytics) {
          content.innerHTML = '<div id="analyticsReactRoot"></div>';
          try {
            window.renderReactAnalytics(document.getElementById('analyticsReactRoot'));
          } catch (e) {
            console.error('React analytics render error:', e);
            content.innerHTML = this.renderAnalyticsHTML();
            this.bindAnalyticsEvents();
          }
        } else {
          content.innerHTML = this.renderAnalyticsHTML();
          this.bindAnalyticsEvents();
        }
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
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <button class="quick-action-btn btn-gold" id="dashStartCallingBtn">
            ${renderIcon('phone')} Start Calling Queue
          </button>
          <button class="quick-action-btn btn-outline" style="color:#fff; border-color:rgba(255,255,255,0.3);" id="dashAddLeadBtn">
            ${renderIcon('plus')} New Lead
          </button>
          <button class="quick-action-btn btn-outline" style="color:#fff; border-color:rgba(255,255,255,0.4); background:rgba(255,255,255,0.1);" onclick="window.app.switchTab('analytics')">
            ${renderIcon('chart')} 📊 View Summary Stats
          </button>
        </div>
      </div>

      <!-- Financial & Operations Metric Grid -->
      <!-- Financial & Operations Metric Grid -->
      <div class="metric-grid">
        <!-- Sales Revenue -->
        <div class="metric-card gold" onclick="window.app?.switchTab('billing')" style="cursor: pointer;" title="View Showroom Bills & Invoices">
          <div class="kpi-ambient-glow"></div>
          <div class="metric-top">
            <div class="metric-title-group">
              <span class="metric-label">Sales Revenue (Sep)</span>
              <span class="metric-bilingual">कुल बिक्री एवं बिल</span>
            </div>
            <div class="metric-icon-wrap gold">${renderIcon('rupee')}</div>
          </div>
          <div class="metric-value-wrap">
            <div class="metric-value">${formatAdaptiveRupee(snapshot.salesRevenue)}</div>
          </div>
          <div class="metric-footer-strip">
            <span class="metric-chip gold">
              <span class="chip-dot"></span> ${(store.getBills ? store.getBills() : []).length} Bills & Deals
            </span>
            <span class="metric-aux-badge">Active Book ➜</span>
          </div>
        </div>

        <!-- Gross Showroom Profit -->
        <div class="metric-card success" onclick="window.app?.switchTab('inventory')" style="cursor: pointer;" title="View Inventory & Margins">
          <div class="kpi-ambient-glow"></div>
          <div class="metric-top">
            <div class="metric-title-group">
              <span class="metric-label">Gross Showroom Profit</span>
              <span class="metric-bilingual">सकल मुनाफा मार्जिन</span>
            </div>
            <div class="metric-icon-wrap success">${renderIcon('calculator')}</div>
          </div>
          <div class="metric-value-wrap">
            <div class="metric-value">${formatAdaptiveRupee(snapshot.grossProfit)}</div>
          </div>
          <div class="metric-footer-strip">
            <span class="metric-chip success">
              <span class="chip-dot"></span> ${snapshot.salesRevenue > 0 ? `${((snapshot.grossProfit / snapshot.salesRevenue) * 100).toFixed(0)}% Margin` : 'OEM Margin'}
            </span>
            <span class="metric-aux-badge">${store.getQuotes().length > 0 ? `${store.getQuotes().length} Quotes` : 'Delivered Deals ➜'}</span>
          </div>
        </div>

        <!-- Total Expenses -->
        <div class="metric-card danger" onclick="window.app?.switchTab('expenses')" style="cursor: pointer;" title="View Expense Vouchers">
          <div class="kpi-ambient-glow"></div>
          <div class="metric-top">
            <div class="metric-title-group">
              <span class="metric-label">Total Expenses</span>
              <span class="metric-bilingual">कुल शोरूम खर्च</span>
            </div>
            <div class="metric-icon-wrap danger">${renderIcon('expense')}</div>
          </div>
          <div class="metric-value-wrap">
            <div class="metric-value">${formatAdaptiveRupee(snapshot.totalExpenses)}</div>
          </div>
          <div class="metric-footer-strip">
            <span class="metric-chip danger">
              <span class="chip-dot"></span> ${store.getExpenses().filter(e => e.status === 'Approved').length} Approved Vouchers
            </span>
            <span class="metric-aux-badge">${pendingExpenses.length > 0 ? `${pendingExpenses.length} Pending` : 'Audited ➜'}</span>
          </div>
        </div>

        <!-- Actual Net Profit -->
        <div class="metric-card info" onclick="window.app?.switchTab('cashflow')" style="cursor: pointer;" title="View Cash Ledger & Cash Flow">
          <div class="kpi-ambient-glow"></div>
          <div class="metric-top">
            <div class="metric-title-group">
              <span class="metric-label">Actual Net Profit</span>
              <span class="metric-bilingual">शुद्ध मुनाफा एवं रोकड़</span>
            </div>
            <div class="metric-icon-wrap info">${renderIcon('bank')}</div>
          </div>
          <div class="metric-value-wrap">
            <div class="metric-value" style="color:${snapshot.netProfit >= 0 ? '#059669' : '#dc2626'};">${formatAdaptiveRupee(snapshot.netProfit)}</div>
          </div>
          <div class="metric-footer-strip">
            <span class="metric-chip ${snapshot.netCashFlow >= 0 ? 'info' : 'danger'}">
              <span class="chip-dot"></span> Net Cash: ${snapshot.netCashFlow >= 0 ? '+' : ''}${formatAdaptiveRupee(snapshot.netCashFlow)}
            </span>
            <span class="metric-aux-badge">Reconciled ➜</span>
          </div>
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
    let totalBilled = 0;
    let totalPaid = 0;
    let totalDue = 0;
    let paidCount = 0;
    let dueCount = 0;

    bills.forEach(b => {
      const total = Number(b.totalRupees || 0);
      totalBilled += total;
      let paid = total;
      if (b.paymentStatus === 'Due') {
        paid = 0;
      } else if (b.paymentStatus === 'Partial' && b.paidAmount !== undefined) {
        paid = Math.min(total, Math.max(0, Number(b.paidAmount) || 0));
      } else if (b.paidAmount !== undefined && b.paidAmount !== null && b.paidAmount !== '') {
        paid = Math.min(total, Math.max(0, Number(b.paidAmount) || 0));
      }
      const due = Math.max(0, total - paid);
      totalPaid += paid;
      totalDue += due;
      if (due <= 0 && total > 0) {
        paidCount++;
      } else if (due > 0) {
        dueCount++;
      }
    });
    const nextAutoNo = store.getNextBillNumber ? store.getNextBillNumber() : '87';

    return `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div>
          <h3 style="margin:0; font-size:18px; font-weight:800; color:var(--text-primary);">Billing Command Center (माँ दुर्गा डीजल)</h3>
          <div style="font-size:12.5px; color:var(--text-secondary); margin-top:3px;">
            Issue and print authentic <strong>माँ दुर्गा डीजल</strong> estimates, customer bills, and track Paid & Due dues
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

      <!-- Metric KPI Cards: Paid, Due, Total Invoiced -->
      <div class="metric-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:16px; margin-bottom:24px;">
        <div class="metric-card success">
          <div class="metric-card-header">
            <div class="metric-card-title-group">
              <span class="metric-card-title" style="color:#059669;">Total Paid</span>
              <span class="metric-card-subtitle" style="color:#10b981;">(जमा राशि)</span>
            </div>
            <div class="metric-icon success">₹</div>
          </div>
          <div class="metric-value" style="color:#065f46;">₹${totalPaid.toLocaleString('en-IN')}</div>
          <div class="metric-badge-pill" style="background:#ecfdf5; color:#047857; border:1px solid rgba(16,185,129,0.2);">
            <span>✅ ${paidCount} Bills Fully Paid</span>
          </div>
        </div>

        <div class="metric-card ${dueCount > 0 ? 'danger' : 'success'}">
          <div class="metric-card-header">
            <div class="metric-card-title-group">
              <span class="metric-card-title" style="color:${dueCount > 0 ? '#dc2626' : '#059669'};">Total Due</span>
              <span class="metric-card-subtitle" style="color:${dueCount > 0 ? '#ef4444' : '#10b981'};">(बकाया राशि)</span>
            </div>
            <div class="metric-icon ${dueCount > 0 ? 'danger' : 'success'}">${dueCount > 0 ? '⏳' : '✨'}</div>
          </div>
          <div class="metric-value" style="color:${dueCount > 0 ? '#b91c1c' : '#059669'};">₹${totalDue.toLocaleString('en-IN')}</div>
          <div class="metric-badge-pill" style="background:${dueCount > 0 ? '#fef2f2' : '#ecfdf5'}; color:${dueCount > 0 ? '#b91c1c' : '#047857'}; border:1px solid ${dueCount > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'};">
            <span>${dueCount > 0 ? `⚠️ ${dueCount} Bills Pending / Due` : '✨ No Pending Dues'}</span>
          </div>
        </div>

        <div class="metric-card info">
          <div class="metric-card-header">
            <div class="metric-card-title-group">
              <span class="metric-card-title" style="color:#1d4ed8;">Total Invoiced</span>
              <span class="metric-card-subtitle" style="color:#3b82f6;">(कुल बिल)</span>
            </div>
            <div class="metric-icon info">🧾</div>
          </div>
          <div class="metric-value" style="color:#1e40af;">₹${totalBilled.toLocaleString('en-IN')}</div>
          <div class="metric-badge-pill" style="background:#eff6ff; color:#1e40af; border:1px solid rgba(37,99,235,0.2);">
            <span>📋 ${bills.length} Total Bills Issued</span>
          </div>
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
                <th style="width:105px;">Bill # (नं०)</th>
                <th style="width:105px;">Date (दिनांक)</th>
                <th>Customer / M/s (मेसर्स)</th>
                <th>Village / Address (पता)</th>
                <th>Particulars / Summary (विवरण)</th>
                <th style="text-align:right;">Total Amount (कुल दाम)</th>
                <th style="text-align:center; width:120px;">Payment Status (भुगतान)</th>
                <th style="text-align:right; width:170px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${bills.length === 0 ? `
                <tr>
                  <td colspan="8" style="text-align:center; padding:44px 20px; color:var(--text-muted);">
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
                const billKey = item.id || String(item.billNumber);
                const total = Number(item.totalRupees || 0);
                let paid = total;
                if (item.paymentStatus === 'Due') {
                  paid = 0;
                } else if (item.paymentStatus === 'Partial' && item.paidAmount !== undefined) {
                  paid = Math.min(total, Math.max(0, Number(item.paidAmount) || 0));
                } else if (item.paidAmount !== undefined && item.paidAmount !== null && item.paidAmount !== '') {
                  paid = Math.min(total, Math.max(0, Number(item.paidAmount) || 0));
                }
                const due = Math.max(0, total - paid);
                let statusBadge = '';
                if (due <= 0 && total > 0) {
                  statusBadge = `<span style="background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; border-radius:12px; padding:3px 8px; font-size:11px; font-weight:700; display:inline-block;">✓ Paid</span>`;
                } else if (paid > 0 && due > 0) {
                  statusBadge = `<span style="background:#fffbeb; color:#92400e; border:1px solid #fde68a; border-radius:12px; padding:3px 8px; font-size:11px; font-weight:700; display:inline-block;" title="Paid: ₹${paid.toLocaleString('en-IN')}">⏳ Due: ₹${due.toLocaleString('en-IN')}</span>`;
                } else if (total > 0) {
                  statusBadge = `<span style="background:#fef2f2; color:#991b1b; border:1px solid #fecaca; border-radius:12px; padding:3px 8px; font-size:11px; font-weight:700; display:inline-block;">⚠️ Due</span>`;
                } else {
                  statusBadge = `<span style="background:#f1f5f9; color:#475569; border-radius:12px; padding:3px 8px; font-size:11px;">-</span>`;
                }
                return `
                  <tr>
                    <td>
                      <strong style="color:var(--primary); font-size:14px;">No. ${item.billNumber}</strong>
                      ${item.billName ? `<div style="font-size:11px; font-weight:700; color:#2563eb; margin-top:2px;">📌 ${item.billName}</div>` : ''}
                    </td>
                    <td><span style="font-family:monospace, sans-serif; font-weight:600;">${formatToDMY(item.date)}</span></td>
                    <td>
                      <strong>${item.customerName || 'मेसर्स ग्राहक'}</strong><br>
                      ${item.vehicle ? `<span style="font-size:11.5px; font-weight:700; color:var(--primary);">🚜 ${item.vehicle}</span> • ` : ''}
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
                      <strong style="font-size:14px; color:#1e3a8a; font-family:monospace, sans-serif;">₹${total.toLocaleString('en-IN')}${item.totalPaise ? '.' + String(item.totalPaise).padStart(2, '0') : ''}</strong>
                    </td>
                    <td style="text-align:center;">
                      ${statusBadge}
                    </td>
                    <td style="text-align:right;">
                      <div style="display:inline-flex; gap:6px; align-items:center;">
                        <button class="quick-action-btn btn-xs btn-outline edit-bill-btn" data-bill-id="${billKey}" onclick="window.app.editBill('${billKey}')" title="Edit this bill details & bill number">
                          ${renderIcon('edit')} Edit
                        </button>
                        <button class="quick-action-btn btn-xs btn-primary print-bill-btn" data-bill-id="${billKey}" onclick="window.app.openBillPreviewById('${billKey}')" title="Print / View in authentic bill book format">
                          ${renderIcon('print')} Print
                        </button>
                        <button class="quick-action-btn btn-xs btn-outline delete-bill-btn" data-bill-id="${billKey}" onclick="window.app.deleteBill('${billKey}')" title="Delete this bill" style="color:#ef4444; border-color:rgba(239, 68, 68, 0.4); font-weight:700;">
                          🗑️ Delete
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

  openBillPreviewById(billId) {
    const bills = store.getBills ? store.getBills() : [];
    let bill = bills.find(b => b && (b.id === billId || String(b.id) === String(billId) || String(b.billNumber) === String(billId)));
    if (!bill && bills.length > 0) bill = bills[0];
    this.openBillPreviewModal(bill || null, false);
  }

  editBill(billId) {
    const bills = store.getBills ? store.getBills() : [];
    const bill = bills.find(b => b && (b.id === billId || String(b.id) === String(billId) || String(b.billNumber) === String(billId)));
    if (bill) {
      this.openNewBillModal(bill);
    }
  }

  deleteBill(billIdentifier) {
    if (!billIdentifier) return;
    const target = String(billIdentifier).trim();
    const bills = store.getBills ? store.getBills() : [];
    const bill = bills.find(b => b && (
      (b.id && String(b.id).trim() === target) ||
      (b.billNumber !== undefined && b.billNumber !== null && String(b.billNumber).trim() === target)
    ));

    const billDisplayNo = bill?.billNumber || target;
    const customerDisplay = bill?.customerName ? ` (${bill.customerName})` : '';

    if (window.confirm(`क्या आप बिल क्र. #${billDisplayNo}${customerDisplay} को हमेशा के लिए हटाना चाहते हैं?\nAre you sure you want to delete Bill #${billDisplayNo}${customerDisplay}?`)) {
      store.deleteBill(target);
      if (typeof api !== 'undefined' && api.bills && api.bills.delete) {
        api.bills.delete(target).catch(() => {});
      }
      if (typeof showToast === 'function') {
        showToast(`बिल क्र. #${billDisplayNo} सफलतापूर्वक हटाया गया / Bill #${billDisplayNo} deleted`, 'info', 'Bill Deleted');
      }
      this.renderCurrentView();
    }
  }

  bindBillingEvents() {
    const newBillBtn = document.getElementById('openNewBillBtn');
    if (newBillBtn) newBillBtn.onclick = () => this.openNewBillModal();

    const printBlankBtn = document.getElementById('printBlankBillBtn');
    if (printBlankBtn) printBlankBtn.onclick = () => this.openBillPreviewModal(null, true);

    document.querySelectorAll('.edit-bill-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.editBill(btn.dataset.billId);
      };
    });

    document.querySelectorAll('.print-bill-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const billId = btn.dataset.billId;
        this.openBillPreviewById(billId);
      };
    });

    document.querySelectorAll('.delete-bill-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.deleteBill(btn.dataset.billId);
      };
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
    const rawExpenses = store.getExpenses();
    const dimension = this.expenseDimension || 'category';
    const period = this.expensePeriod || 'all';

    // 1. Time Period Filter
    let expenses = [...rawExpenses];
    if (period === 'month') {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      expenses = expenses.filter(e => (e.date || '').startsWith(currentMonth));
    } else if (period === '30days') {
      const cutoff = Date.now() - 30 * 86400000;
      expenses = expenses.filter(e => new Date(e.date).getTime() >= cutoff);
    }

    // 2. Core Metrics
    const totalExpenseAmount = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const pending = expenses.filter(e => e.status === 'Pending Approval');
    const chassisExpenses = expenses.filter(e => e.chassisTag && e.chassisTag.trim().length > 0);
    const totalChassisCost = chassisExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const totalGeneralOverhead = totalExpenseAmount - totalChassisCost;
    const avgExpense = expenses.length > 0 ? Math.round(totalExpenseAmount / expenses.length) : 0;

    // 3. Group by selected dimension
    const groupMap = {};
    if (dimension === 'category') {
      expenses.forEach(e => {
        const cat = e.category || 'Miscellaneous';
        if (!groupMap[cat]) groupMap[cat] = { key: cat, label: cat, amount: 0, count: 0 };
        groupMap[cat].amount += Number(e.amount || 0);
        groupMap[cat].count += 1;
      });
    } else if (dimension === 'paymentMode') {
      expenses.forEach(e => {
        const mode = e.paymentMode || 'Cash';
        if (!groupMap[mode]) groupMap[mode] = { key: mode, label: `${mode} Outflow`, amount: 0, count: 0 };
        groupMap[mode].amount += Number(e.amount || 0);
        groupMap[mode].count += 1;
      });
    } else if (dimension === 'chassisNature') {
      groupMap['Tagged Unit Cost'] = { key: 'Tagged Unit Cost', label: 'Tractor Chassis Direct Cost', amount: 0, count: 0 };
      groupMap['General Showroom'] = { key: 'General Showroom', label: 'Showroom General Overhead', amount: 0, count: 0 };
      expenses.forEach(e => {
        if (e.chassisTag && e.chassisTag.trim().length > 0) {
          groupMap['Tagged Unit Cost'].amount += Number(e.amount || 0);
          groupMap['Tagged Unit Cost'].count += 1;
        } else {
          groupMap['General Showroom'].amount += Number(e.amount || 0);
          groupMap['General Showroom'].count += 1;
        }
      });
    }

    const CATEGORY_COLORS = {
      'Fuel': '#d97706',
      'Diesel / Fuel': '#d97706',
      'Transport': '#2563eb',
      'Freight / Logistics': '#2563eb',
      'Repairs & PDI': '#059669',
      'PDI / Servicing': '#059669',
      'Salaries': '#db2777',
      'Staff Salaries & Incentives': '#db2777',
      'Showroom Rent': '#7c3aed',
      'Showroom Rent & Utilities': '#7c3aed',
      'Electricity': '#0891b2',
      'Customer & Tea/Food': '#f59e0b',
      'Tea & Refreshments': '#f59e0b',
      'Customer Welcome & Gifts': '#f59e0b',
      'Advertising': '#ea580c',
      'Marketing / Village Wall Painting': '#ea580c',
      'Commission / Brokerage': '#4f46e5',
      'Miscellaneous': '#64748b',
      'Other Operational': '#64748b',
      'Cash': '#10b981',
      'Bank Transfer': '#3b82f6',
      'UPI': '#8b5cf6',
      'Cheque': '#f59e0b',
      'Tagged Unit Cost': '#2563eb',
      'General Showroom': '#10b981'
    };

    const DEFAULT_PALETTE = ['#d97706', '#2563eb', '#059669', '#7c3aed', '#db2777', '#0891b2', '#f59e0b', '#ea580c', '#4f46e5', '#64748b', '#14b8a6', '#6366f1'];

    const groups = Object.values(groupMap)
      .filter(g => g.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    groups.forEach((g, idx) => {
      g.color = CATEGORY_COLORS[g.key] || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length];
      g.percent = totalExpenseAmount > 0 ? ((g.amount / totalExpenseAmount) * 100).toFixed(1) : '0.0';
    });

    const topGroup = groups[0] || null;

    // 4. SVG Donut Arc Generation
    const R = 85;
    const C = 2 * Math.PI * R; // 534.07075
    let accumulatedPercent = 0;
    const arcsHtml = groups.map(g => {
      const percentVal = totalExpenseAmount > 0 ? (g.amount / totalExpenseAmount) : 0;
      const dashLength = percentVal * C;
      const gap = groups.length > 1 ? 2.5 : 0;
      const visibleDash = Math.max(0, dashLength - gap);
      const offset = -accumulatedPercent * C;
      accumulatedPercent += percentVal;
      const isActive = this.expenseFilter === g.key;

      return `
        <circle
          class="chart-arc ${isActive ? 'is-active' : ''}"
          cx="140" cy="140" r="${R}"
          stroke="${g.color}"
          stroke-width="${isActive ? 44 : 36}"
          stroke-dasharray="${visibleDash.toFixed(2)} ${(C - visibleDash).toFixed(2)}"
          stroke-dashoffset="${offset.toFixed(2)}"
          data-key="${g.key}"
          data-label="${g.label}"
          data-amount="₹${g.amount.toLocaleString('en-IN')}"
          data-percent="${g.percent}%"
          data-count="${g.count}"
        />
      `;
    }).join('');

    // 5. Table display filtering
    let displayExpenses = [...expenses];
    if (this.expenseFilter) {
      if (dimension === 'category') {
        displayExpenses = displayExpenses.filter(e => (e.category || 'Miscellaneous') === this.expenseFilter);
      } else if (dimension === 'paymentMode') {
        displayExpenses = displayExpenses.filter(e => (e.paymentMode || 'Cash') === this.expenseFilter);
      } else if (dimension === 'chassisNature') {
        if (this.expenseFilter === 'Tagged Unit Cost') {
          displayExpenses = displayExpenses.filter(e => e.chassisTag && e.chassisTag.trim().length > 0);
        } else {
          displayExpenses = displayExpenses.filter(e => !e.chassisTag || e.chassisTag.trim().length === 0);
        }
      }
    }

    const filterTotalAmount = displayExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    return `
      <!-- Top Action Bar -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div style="font-size:13px; color:var(--text-secondary);">
          Automatic Rules: Expenses <strong>&lt; ₹5,000 auto-approved</strong> | <strong>&ge; ₹5,000 requires Director approval</strong>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <button class="quick-action-btn btn-primary" id="openFastExpenseModalBtn" onclick="window.app.openFastExpenseModal()">
            ${renderIcon('plus')} Fast Expense Entry
          </button>
        </div>
      </div>

      ${pending.length > 0 ? `
        <div style="background:var(--warning-light); border:1px solid #fde68a; border-radius:var(--radius-lg); padding:14px 18px; margin-bottom:20px;">
          <h4 style="font-size:14.5px; font-weight:800; color:#b45309;">
            Pending Manager Approvals (${pending.length})
          </h4>
          <p style="font-size:12px; color:#92400e; margin-top:2px;">
            Expenses &ge; ₹5,000 require director authorization before posting to cash outflows.
          </p>
        </div>
      ` : ''}

      <!-- 1. Money Flow KPI Metrics Ribbon -->
      <div class="expense-analytics-wrapper">
        <div class="expense-metrics-ribbon">
          <div class="expense-stat-card card-amber">
            <span class="stat-label">Total Outflow (Spend) 💸</span>
            <div class="stat-value font-mono">₹${totalExpenseAmount.toLocaleString('en-IN')}</div>
            <span class="stat-sub">${expenses.length} expenses logged</span>
          </div>

          <div class="expense-stat-card card-rose">
            <span class="stat-label">Top Expense Category 🎯</span>
            <div class="stat-value" style="font-size:17px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${topGroup ? topGroup.label : 'None Yet'}
            </div>
            <span class="stat-sub">
              ${topGroup ? `₹${topGroup.amount.toLocaleString('en-IN')} (${topGroup.percent}%)` : 'No data recorded'}
            </span>
          </div>

          <div class="expense-stat-card card-blue">
            <span class="stat-label">Chassis Direct Costs 🏷️</span>
            <div class="stat-value font-mono">₹${totalChassisCost.toLocaleString('en-IN')}</div>
            <span class="stat-sub">${chassisExpenses.length} tractor-tagged costs</span>
          </div>

          <div class="expense-stat-card card-emerald">
            <span class="stat-label">Showroom Overhead 🏢</span>
            <div class="stat-value font-mono">₹${totalGeneralOverhead.toLocaleString('en-IN')}</div>
            <span class="stat-sub">Rent, fuel, staff & tea</span>
          </div>
        </div>

        <!-- 2. Interactive Donut Chart & Category Breakdown Panel -->
        <div class="expense-chart-panel">
          <div class="expense-chart-header">
            <div class="chart-title-area">
              <h3>${renderIcon('calculator')} Showroom Money Flow & Expense Distribution</h3>
              <p>Analyze operational spend breakdown by category, payment mode, or tractor unit cost.</p>
            </div>

            <div class="chart-controls-group">
              <!-- Dimension Switcher Pills -->
              <div class="dimension-pills">
                <button type="button" class="dimension-btn ${dimension === 'category' ? 'active' : ''}" data-dimension="category">
                  By Category
                </button>
                <button type="button" class="dimension-btn ${dimension === 'paymentMode' ? 'active' : ''}" data-dimension="paymentMode">
                  By Payment Mode
                </button>
                <button type="button" class="dimension-btn ${dimension === 'chassisNature' ? 'active' : ''}" data-dimension="chassisNature">
                  By Cost Nature
                </button>
              </div>

              <!-- Time Filter Selector -->
              <select id="expensePeriodSelect" class="form-select" style="width:auto; padding:5px 10px; font-size:12px; height:32px;">
                <option value="all" ${period === 'all' ? 'selected' : ''}>All Time</option>
                <option value="month" ${period === 'month' ? 'selected' : ''}>This Month</option>
                <option value="30days" ${period === '30days' ? 'selected' : ''}>Last 30 Days</option>
              </select>
            </div>
          </div>

          <div class="expense-chart-layout">
            <!-- Left: The Pie / Donut Chart -->
            <div class="expense-donut-container ${this.expenseFilter ? 'has-active' : ''}">
              ${totalExpenseAmount > 0 ? `
                <svg class="expense-pie-svg" viewBox="0 0 280 280" role="img" aria-label="Expense money flow pie chart">
                  ${arcsHtml}
                </svg>
              ` : `
                <svg class="expense-pie-svg" viewBox="0 0 280 280">
                  <circle cx="140" cy="140" r="85" fill="none" stroke="var(--border-color)" stroke-width="26" stroke-dasharray="8 6" />
                </svg>
              `}
              <div class="donut-center-info">
                <span class="center-sub" id="donutCenterSub">Total Outflow</span>
                <span class="center-val font-mono" id="donutCenterVal">₹${totalExpenseAmount.toLocaleString('en-IN')}</span>
                <span class="center-extra" id="donutCenterExtra">${expenses.length} Records</span>
              </div>
            </div>

            <!-- Right: Interactive Legend & Progress Bars -->
            <div class="expense-breakdown-side">
              <div class="breakdown-header">
                <span>${dimension === 'category' ? 'Expense Category' : dimension === 'paymentMode' ? 'Payment Method' : 'Cost Allocation'}</span>
                <span>Share of Total (Click to Filter)</span>
              </div>

              ${groups.length === 0 ? `
                <div style="padding:28px 16px; text-align:center; color:var(--text-muted); font-size:13px; background:var(--bg-main); border-radius:var(--radius-md);">
                  No expenses logged for this period. Click <strong>+ Fast Expense Entry</strong> or load sample expenses above.
                </div>
              ` : `
                <div class="expense-legend-grid">
                  ${groups.map(g => `
                    <div class="legend-row ${this.expenseFilter === g.key ? 'is-active' : ''}" data-key="${g.key}" data-label="${g.label}" data-amount="₹${g.amount.toLocaleString('en-IN')}" data-percent="${g.percent}%" data-count="${g.count}" title="Click to filter ledger by ${g.label}">
                      <div class="legend-top">
                        <div class="legend-left">
                          <span class="legend-color-dot" style="background:${g.color};"></span>
                          <span class="legend-cat-name">${g.label}</span>
                          <span class="legend-cat-count">(${g.count} txns)</span>
                        </div>
                        <div class="legend-right">
                          <span class="legend-amount font-mono">₹${g.amount.toLocaleString('en-IN')}</span>
                          <span class="legend-percent-badge">${g.percent}%</span>
                        </div>
                      </div>
                      <div class="legend-bar-track">
                        <div class="legend-bar-fill" style="width:${g.percent}%; background:${g.color};"></div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>
        </div>
      </div>

      <!-- Active Filter Indicator Banner -->
      ${this.expenseFilter ? `
        <div class="expense-active-filter-bar">
          <div class="active-filter-text">
            <span>🔍 Filtered by <strong>${this.expenseFilter}</strong></span>
            <span style="font-weight:normal; opacity:0.85;">(${displayExpenses.length} entries • ₹${filterTotalAmount.toLocaleString('en-IN')})</span>
          </div>
          <button class="clear-filter-btn" id="clearExpenseFilterBtn">
            ✕ Clear Filter
          </button>
        </div>
      ` : ''}

      <!-- 3. Expenses Detailed Ledger Table -->
      <div class="panel-card">
        <div class="panel-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h4 style="font-size:15px; font-weight:800; display:flex; align-items:center; gap:8px;">
            ${renderIcon('book')} Showroom Expense Ledger
            <span style="font-size:12px; font-weight:normal; color:var(--text-muted);">
              (${displayExpenses.length} ${this.expenseFilter ? 'matching' : 'total'} transactions)
            </span>
          </h4>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Category</th>
                <th>Amount (₹)</th>
                <th>Mode</th>
                <th>Paid To / Purpose</th>
                <th>Chassis Tag (Unit Cost)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${displayExpenses.length === 0 ? `
                <tr>
                  <td colspan="9" style="text-align:center; padding:44px 20px; color:var(--text-muted);">
                    <div style="font-size:32px; margin-bottom:10px;">💸</div>
                    <div style="font-weight:700; font-size:15px; color:var(--text-secondary);">
                      ${this.expenseFilter ? `No expenses found for "${this.expenseFilter}"` : 'No showroom expenses recorded yet'}
                    </div>
                    <div style="font-size:12px; margin-top:4px;">
                      ${this.expenseFilter ? 'Try clearing the filter to view all entries.' : 'Use fast entry for fuel, tea, transport, rent, or maintenance. Expenses < ₹5k auto-approve; ≥ ₹5k require director sign-off.'}
                    </div>
                    ${this.expenseFilter ? `
                      <button class="quick-action-btn btn-sm btn-outline" style="margin:14px auto 0;" id="clearExpenseFilterEmptyBtn">
                        Clear Filter
                      </button>
                    ` : `
                      <div style="display:flex; justify-content:center; gap:8px; margin-top:14px;">
                        <button class="quick-action-btn btn-sm btn-primary" onclick="window.app.openFastExpenseModal()">
                          ${renderIcon('plus')} Record First Expense
                        </button>
                      </div>
                    `}
                  </td>
                </tr>
              ` : displayExpenses.map(e => `
                <tr>
                  <td><strong>${e.id}</strong></td>
                  <td>${e.date}</td>
                  <td>
                    <span class="badge badge-info" style="cursor:pointer;" onclick="window.app.filterExpensesByCategory('${e.category}')" title="Click to filter by ${e.category}">
                      ${e.category}
                    </span>
                  </td>
                  <td><strong style="font-size:13.5px;" class="font-mono">₹${Number(e.amount).toLocaleString('en-IN')}</strong></td>
                  <td>
                    <span class="badge ${e.paymentMode === 'Cash' ? 'badge-success' : 'badge-primary'}">
                      ${e.paymentMode || 'Cash'}
                    </span>
                  </td>
                  <td>
                    <strong>${e.paidTo || e.description || 'Showroom Expense'}</strong><br>
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
                        <button class="quick-action-btn btn-sm btn-primary approve-expense-btn" data-exp-id="${e.id}">
                          Approve
                        </button>
                      ` : ''}
                      <button class="quick-action-btn btn-sm btn-danger delete-expense-btn" data-exp-id="${e.id}" title="Delete Expense">
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

    // 1. Approve & Delete actions
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

    // 2. Dimension toggle buttons
    document.querySelectorAll('.dimension-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const dim = btn.dataset.dimension;
        if (dim && dim !== this.expenseDimension) {
          this.expenseDimension = dim;
          this.expenseFilter = null; // reset filter on dimension change
          this.renderCurrentView();
        }
      });
    });

    // 3. Time period dropdown
    const periodSelect = document.getElementById('expensePeriodSelect');
    if (periodSelect) {
      periodSelect.addEventListener('change', (e) => {
        this.expensePeriod = e.target.value;
        this.renderCurrentView();
      });
    }

    // 4. Interactive Donut and Legend Hover & Filter
    const donutCenterSub = document.getElementById('donutCenterSub');
    const donutCenterVal = document.getElementById('donutCenterVal');
    const donutCenterExtra = document.getElementById('donutCenterExtra');
    const donutContainer = document.querySelector('.expense-donut-container');

    const defaultSub = donutCenterSub ? donutCenterSub.textContent : 'Total Outflow';
    const defaultVal = donutCenterVal ? donutCenterVal.textContent : '₹0';
    const defaultExtra = donutCenterExtra ? donutCenterExtra.textContent : '';

    const interactiveElements = document.querySelectorAll('.chart-arc, .legend-row');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        const label = el.dataset.label;
        const amount = el.dataset.amount;
        const percent = el.dataset.percent;
        const count = el.dataset.count;
        const key = el.dataset.key;

        if (donutCenterSub) donutCenterSub.textContent = label || 'Category';
        if (donutCenterVal) donutCenterVal.textContent = amount || '₹0';
        if (donutCenterExtra) donutCenterExtra.textContent = `${percent || ''} (${count || 0} txns)`;

        if (donutContainer) donutContainer.classList.add('has-active');

        // Highlight matching arc and legend row
        document.querySelectorAll(`.chart-arc[data-key="${key}"], .legend-row[data-key="${key}"]`).forEach(node => {
          node.classList.add('is-active');
        });
      });

      el.addEventListener('mouseleave', () => {
        if (donutCenterSub) donutCenterSub.textContent = defaultSub;
        if (donutCenterVal) donutCenterVal.textContent = defaultVal;
        if (donutCenterExtra) donutCenterExtra.textContent = defaultExtra;

        if (donutContainer && !this.expenseFilter) donutContainer.classList.remove('has-active');

        // Remove highlight if not the active filter
        document.querySelectorAll('.chart-arc, .legend-row').forEach(node => {
          if (node.dataset.key !== this.expenseFilter) {
            node.classList.remove('is-active');
          }
        });
      });

      el.addEventListener('click', () => {
        const key = el.dataset.key;
        if (key) {
          this.expenseFilter = (this.expenseFilter === key) ? null : key;
          this.renderCurrentView();
        }
      });
    });

    // 5. Clear filter buttons
    const clearBtn = document.getElementById('clearExpenseFilterBtn') || document.getElementById('clearExpenseFilterEmptyBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.expenseFilter = null;
        this.renderCurrentView();
      });
    }

    // 6. Expenses event binding complete
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
          Your accounting Net Profit is <strong>${formatAdaptiveRupee(snapshot.netProfit)}</strong>, while actual Net Cash Flow is <strong>${formatAdaptiveRupee(snapshot.netCashFlow)}</strong>.
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
                  <td>${t.party || t.partyName || 'Showroom Party'}</td>
                  <td>
                    <span class="badge ${(t.mode || t.paymentMode) === 'Cash' ? 'badge-success' : 'badge-primary'}">
                      ${t.mode || t.paymentMode || 'Cash'}
                    </span>
                  </td>
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
        this.openCashMovementModal('IN');
      });
    }
  }

  // --- Summary Stats & Business Analytics Intelligence ---
  renderAnalyticsHTML() {
    this.analyticsTimeframe = this.analyticsTimeframe || 'monthly';
    const vm = getAnalyticsViewModel(this.analyticsTimeframe, store);
    const fmt = (n) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`;

    return `
      <div class="analytics-container">
        <!-- Top Controls: Timeframe segmented control & Actions -->
        <div class="analytics-top-bar">
          <div class="analytics-time-controls">
            <div class="timeframe-segmented-control" role="tablist">
              <button class="timeframe-pill-btn ${vm.timeframe === 'daily' ? 'active' : ''}" data-timeframe="daily" title="Analyze daily metrics">
                <span class="tf-icon">📅</span> Daily (दैनिक)
              </button>
              <button class="timeframe-pill-btn ${vm.timeframe === 'weekly' ? 'active' : ''}" data-timeframe="weekly" title="Analyze weekly metrics">
                <span class="tf-icon">📆</span> Weekly (साप्ताहिक)
              </button>
              <button class="timeframe-pill-btn ${vm.timeframe === 'monthly' ? 'active' : ''}" data-timeframe="monthly" title="Analyze monthly metrics">
                <span class="tf-icon">🗓️</span> Monthly (मासिक)
              </button>
              <button class="timeframe-pill-btn ${vm.timeframe === 'yearly' ? 'active' : ''}" data-timeframe="yearly" title="Analyze yearly metrics">
                <span class="tf-icon">📈</span> Yearly (वार्षिक)
              </button>
            </div>
            <div class="analytics-period-badge">
              <span class="analytics-pulse-dot"></span>
              <span>Live MIS: ${vm.config.periodLabel}</span>
            </div>
          </div>

          <div class="analytics-actions">
            <button class="quick-action-btn btn-sm btn-outline" id="printAnalyticsBtn" title="Print MIS summary report">
              ${renderIcon('print')} Print Report
            </button>
            <button class="quick-action-btn btn-sm btn-primary" id="exportAnalyticsCsvBtn" title="Export CSV spreadsheet">
              ${renderIcon('calculator')} Export CSV
            </button>
          </div>
        </div>

        <!-- Executive Highlights Alert Banner -->
        <div class="analytics-executive-banner">
          <div class="analytics-banner-left">
            <h3>${renderIcon('sparkles')} Executive MIS Overview (${vm.config.name})</h3>
            <p>
              Actual sales turnover for this period is <strong>${fmt(vm.revenue)}</strong> across <strong>${vm.billsCount}</strong> retail bills and <strong>${vm.totalQuotes}</strong> quotations. 
              Net Profit stands at <strong>${fmt(vm.netProfit)}</strong> (${vm.netMarginPct}% margin) with a 
              <strong>${vm.collectionRate}%</strong> cash collection realization on billed cash memos.
            </p>
          </div>
          <div class="analytics-banner-highlights">
            <div class="banner-highlight-box">
              <div class="hl-label">Turnover Realized</div>
              <div class="hl-value" style="color:#34d399;">${fmt(vm.revenue)}</div>
            </div>
            <div class="banner-highlight-box">
              <div class="hl-label">Net Margin</div>
              <div class="hl-value" style="color:${Number(vm.netMarginPct) >= 0 ? '#34d399' : '#fb7185'};">${vm.netMarginPct}%</div>
            </div>
            <div class="banner-highlight-box">
              <div class="hl-label">Collection Rate</div>
              <div class="hl-value" style="color:#60a5fa;">${vm.collectionRate}%</div>
            </div>
          </div>
        </div>

        <!-- 6 KPI Metric Summary Cards -->
        <div class="analytics-metric-grid">
          <!-- Revenue -->
          <div class="analytics-kpi-card emerald">
            <div class="analytics-kpi-header">
              <div class="analytics-kpi-title-wrap">
                <span class="analytics-kpi-title">Gross Turnover</span>
                <span class="analytics-kpi-sub">कुल बिक्री / राजस्व</span>
              </div>
              <div class="analytics-kpi-icon-badge emerald">${renderIcon('rupee')}</div>
            </div>
            <div class="analytics-kpi-value" style="color:#047857;">${fmt(vm.revenue)}</div>
            <div class="analytics-kpi-footer">
              <span class="analytics-kpi-chip emerald">Billed: ${fmt(vm.scaledBilledRupees)}</span>
              <span class="analytics-kpi-aux">Collected: ${fmt(vm.scaledPaidRupees)}</span>
            </div>
          </div>

          <!-- Net Profit -->
          <div class="analytics-kpi-card ${vm.netProfit >= 0 ? 'emerald' : 'rose'}">
            <div class="analytics-kpi-header">
              <div class="analytics-kpi-title-wrap">
                <span class="analytics-kpi-title">Net Profit</span>
                <span class="analytics-kpi-sub">शुद्ध मुनाफा</span>
              </div>
              <div class="analytics-kpi-icon-badge ${vm.netProfit >= 0 ? 'emerald' : 'rose'}">${renderIcon('chart')}</div>
            </div>
            <div class="analytics-kpi-value" style="color:${vm.netProfit >= 0 ? '#047857' : '#b91c1c'};">${fmt(vm.netProfit)}</div>
            <div class="analytics-kpi-footer">
              <span class="analytics-kpi-chip ${vm.netProfit >= 0 ? 'emerald' : 'rose'}">📈 ${vm.netMarginPct}% margin</span>
              <span class="analytics-kpi-aux">Gross: ${fmt(vm.grossProfit)}</span>
            </div>
          </div>

          <!-- Cash Flow -->
          <div class="analytics-kpi-card blue">
            <div class="analytics-kpi-header">
              <div class="analytics-kpi-title-wrap">
                <span class="analytics-kpi-title">Net Cash Balance</span>
                <span class="analytics-kpi-sub">शुद्ध रोकड़ प्रवाह</span>
              </div>
              <div class="analytics-kpi-icon-badge blue">${renderIcon('bank')}</div>
            </div>
            <div class="analytics-kpi-value" style="color:#1d4ed8;">${fmt(vm.netCashFlow)}</div>
            <div class="analytics-kpi-footer">
              <span class="analytics-kpi-chip blue">In: ${fmt(vm.cashIn)}</span>
              <span class="analytics-kpi-aux">Out: ${fmt(vm.cashOut)}</span>
            </div>
          </div>

          <!-- Total Invoiced & Collections -->
          <div class="analytics-kpi-card amber">
            <div class="analytics-kpi-header">
              <div class="analytics-kpi-title-wrap">
                <span class="analytics-kpi-title">Bills & Collections</span>
                <span class="analytics-kpi-sub">बिल बुक एवं रसीदें</span>
              </div>
              <div class="analytics-kpi-icon-badge amber">${renderIcon('quote')}</div>
            </div>
            <div class="analytics-kpi-value" style="color:#b45309;">${fmt(vm.scaledPaidRupees)}</div>
            <div class="analytics-kpi-footer">
              <span class="analytics-kpi-chip amber">✓ ${vm.collectionRate}% collected</span>
              <span class="analytics-kpi-aux">${vm.billsCount} Bills (${vm.scaledDueRupees > 0 ? `${fmt(vm.scaledDueRupees)} Due` : 'Clear'})</span>
            </div>
          </div>

          <!-- Tractors Sold / Movement -->
          <div class="analytics-kpi-card emerald">
            <div class="analytics-kpi-header">
              <div class="analytics-kpi-title-wrap">
                <span class="analytics-kpi-title">Tractor Deliveries</span>
                <span class="analytics-kpi-sub">ट्रैक्टर सुपुर्दगी</span>
              </div>
              <div class="analytics-kpi-icon-badge emerald">${renderIcon('tractor')}</div>
            </div>
            <div class="analytics-kpi-value" style="color:#047857;">${vm.tractorsDelivered} Units</div>
            <div class="analytics-kpi-footer">
              <span class="analytics-kpi-chip emerald">📦 ${vm.inStockUnits} In Showroom Yard</span>
              <span class="analytics-kpi-aux">Live Stock</span>
            </div>
          </div>

          <!-- Conversion Pipeline -->
          <div class="analytics-kpi-card purple">
            <div class="analytics-kpi-header">
              <div class="analytics-kpi-title-wrap">
                <span class="analytics-kpi-title">Customer Pipeline</span>
                <span class="analytics-kpi-sub">लीड्स एवं डेमो रूपांतरण</span>
              </div>
              <div class="analytics-kpi-icon-badge purple">${renderIcon('users')}</div>
            </div>
            <div class="analytics-kpi-value" style="color:#6d28d9;">${vm.totalLeads} Farmers</div>
            <div class="analytics-kpi-footer">
              <span class="analytics-kpi-chip" style="background:rgba(139,92,246,0.1); color:#6d28d9; border:1px solid rgba(139,92,246,0.25);">🚜 ${vm.totalDemos} Demos</span>
              <span class="analytics-kpi-aux">Hot Leads Active</span>
            </div>
          </div>
        </div>

        <!-- Section 1: Multi-Series Bar & Profit Trend Chart -->
        <div class="analytics-card">
          <div class="analytics-card-header">
            <div>
              <div class="analytics-card-title">${renderIcon('chart')} Financial Trajectory: Revenue vs Showroom Expenses vs Net Profit</div>
              <div class="analytics-card-subtitle">Detailed breakdown across ${vm.config.name} with net margin trend curve</div>
            </div>
            <div class="analytics-period-badge">
              <span>● ${vm.config.intervals ? vm.config.intervals.length : vm.chartIntervals.length} Data Points</span>
            </div>
          </div>

          <div class="svg-bar-chart-container">
            ${renderBarChartSVG(vm.chartIntervals)}
          </div>

          <div class="chart-legend-row">
            <div class="chart-legend-item">
              <span class="chart-legend-dot" style="background:#10b981;"></span>
              <span>Sales Turnover (राजस्व)</span>
            </div>
            <div class="chart-legend-item">
              <span class="chart-legend-dot" style="background:#ef4444;"></span>
              <span>Showroom Expenses (खर्च)</span>
            </div>
            <div class="chart-legend-item">
              <span class="chart-legend-dot" style="background:#2563eb; border-radius:50%;"></span>
              <span>Net Profit Trend Line (शुद्ध लाभ)</span>
            </div>
          </div>
        </div>

        <!-- Section 2: Two Donut / Pie Charts Side-by-Side -->
        <div class="analytics-grid-equal-2col">
          <!-- Donut 1: Revenue by Tractor / Product Segment -->
          <div class="analytics-card">
            <div class="analytics-card-header">
              <div>
                <div class="analytics-card-title">${renderIcon('pie')} Revenue by Tractor & Product Segment</div>
                <div class="analytics-card-subtitle">Sales contribution percentage by model series & bills</div>
              </div>
            </div>
            <div class="donut-layout">
              ${vm.revenueCategories.length > 0 ? `
                ${renderDonutSVG(vm.revenueCategories, fmt(vm.revenue), 'Total Sales')}
                <div class="donut-legend-list">
                  ${vm.revenueCategories.map(cat => `
                    <div class="donut-legend-row">
                      <div class="donut-legend-top">
                        <div class="donut-legend-title">
                          <span class="donut-legend-dot" style="background:${cat.color};"></span>
                          <span>${cat.label}</span>
                        </div>
                        <div class="donut-legend-metrics">
                          <span class="donut-legend-amt">${fmt(cat.value)}</span>
                          <span class="donut-legend-pct">${cat.pct}%</span>
                        </div>
                      </div>
                      <div class="donut-micro-track">
                        <div class="donut-micro-fill" style="width:${cat.pct}%; background:${cat.color};"></div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div style="padding:40px 20px; text-align:center; width:100%; color:var(--text-muted);">
                  <p style="margin:0; font-size:13px; font-weight:600;">No bills or quotations recorded in this period</p>
                </div>
              `}
            </div>
          </div>

          <!-- Donut 2: Showroom Operating Expense Distribution -->
          <div class="analytics-card">
            <div class="analytics-card-header">
              <div>
                <div class="analytics-card-title">${renderIcon('expense')} Operating Expense Distribution</div>
                <div class="analytics-card-subtitle">Where dealership capital is deployed across operations</div>
              </div>
            </div>
            <div class="donut-layout">
              ${vm.expenseCategories.length > 0 ? `
                ${renderDonutSVG(vm.expenseCategories, fmt(vm.totalExpenses), 'Total Opex')}
                <div class="donut-legend-list">
                  ${vm.expenseCategories.map(cat => `
                    <div class="donut-legend-row">
                      <div class="donut-legend-top">
                        <div class="donut-legend-title">
                          <span class="donut-legend-dot" style="background:${cat.color};"></span>
                          <span>${cat.label}</span>
                        </div>
                        <div class="donut-legend-metrics">
                          <span class="donut-legend-amt">${fmt(cat.value)}</span>
                          <span class="donut-legend-pct" style="background:rgba(239,68,68,0.1); color:#dc2626;">${cat.pct}%</span>
                        </div>
                      </div>
                      <div class="donut-micro-track">
                        <div class="donut-micro-fill" style="width:${cat.pct}%; background:${cat.color};"></div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div style="padding:40px 20px; text-align:center; width:100%; color:var(--text-muted);">
                  <p style="margin:0; font-size:13px; font-weight:600;">No approved expenses recorded in this period</p>
                </div>
              `}
            </div>
          </div>
        </div>

        <!-- Section 3: Operations, Funnels & Top Models Progress Bars -->
        <div class="analytics-grid-2col">
          <!-- Progress Meters & Lead Funnel -->
          <div class="analytics-card">
            <div class="analytics-card-header">
              <div>
                <div class="analytics-card-title">${renderIcon('flame')} Performance Progress & Conversion Funnel</div>
                <div class="analytics-card-subtitle">Sales realization, collection efficiency & inquiry lifecycle</div>
              </div>
            </div>

            <div class="progress-meters-list" style="margin-bottom:24px;">
              <!-- Realization Meter -->
              <div class="meter-item">
                <div class="meter-header">
                  <span class="meter-title">💵 Payment Realization Efficiency (${fmt(vm.scaledPaidRupees)} of ${fmt(vm.scaledBilledRupees)})</span>
                  <span class="meter-stat" style="color:#047857;">${vm.collectionRate}%</span>
                </div>
                <div class="meter-track">
                  <div class="meter-fill" style="width:${Math.min(100, vm.collectionRate)}%; background:linear-gradient(90deg, #34d399, #059669);"></div>
                </div>
              </div>

              <!-- Cash Counter Flow Meter -->
              <div class="meter-item">
                <div class="meter-header">
                  <span class="meter-title">🪙 Cash Counter Flow (In: ${fmt(vm.cashIn)} | Out: ${fmt(vm.cashOut)})</span>
                  <span class="meter-stat" style="color:#2563eb;">${vm.cashIn > 0 ? `${Math.round(Math.min(100, Math.max(0, (vm.netCashFlow / vm.cashIn) * 100)))}% Net` : 'Balanced'}</span>
                </div>
                <div class="meter-track">
                  <div class="meter-fill" style="width:${vm.cashIn > 0 ? Math.min(100, Math.max(0, (vm.netCashFlow / vm.cashIn) * 100)) : 0}%; background:linear-gradient(90deg, #60a5fa, #1d4ed8);"></div>
                </div>
              </div>
            </div>

            <!-- Customer Funnel -->
            <div style="font-size:13.5px; font-weight:800; color:var(--text-primary); margin-bottom:14px; display:flex; align-items:center; gap:8px;">
              ${renderIcon('users')} Farmer Purchase Journey Funnel
            </div>
            <div class="funnel-container">
              ${vm.funnelSteps.map(fn => `
                <div class="funnel-step">
                  <div class="funnel-step-badge">${fn.step}</div>
                  <span class="funnel-step-label">${fn.label}</span>
                  <div class="funnel-step-bar-wrap">
                    <div class="funnel-step-bar-fill" style="width:${fn.pct}%; background:${fn.bg};">${fn.pct}%</div>
                  </div>
                  <span class="funnel-step-count">${fn.count}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Top Selling Models & Village Demand Clusters -->
          <div class="analytics-card">
            <div class="analytics-card-header">
              <div>
                <div class="analytics-card-title">${renderIcon('tractor')} Top Tractor Models & Village Demand</div>
                <div class="analytics-card-subtitle">Volume ranking from live quotes and customer inquiries</div>
              </div>
            </div>

            <!-- Top Models -->
            <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:22px;">
              ${vm.topModels.length > 0 ? vm.topModels.map((tm, idx) => `
                <div class="model-rank-card">
                  <div class="model-rank-header">
                    <div class="model-rank-title">
                      <span class="model-rank-tag">#${idx + 1}</span>
                      <strong>${tm.model}</strong>
                    </div>
                    <span class="model-rank-metrics">${tm.units} Units (${fmt(tm.rev)})</span>
                  </div>
                  <div class="meter-track" style="height:7px;">
                    <div class="meter-fill" style="width:${tm.pct}%; background:${tm.color};"></div>
                  </div>
                </div>
              `).join('') : `
                <div style="padding:18px 12px; text-align:center; color:var(--text-muted); border:1px dashed var(--border-color); borderRadius:10px;">
                  <p style="margin:0; font-size:12px; font-weight:600;">No tractor quote or delivery records in this period</p>
                </div>
              `}
            </div>

            <!-- Territory Villages -->
            <div style="font-size:13.5px; font-weight:800; color:var(--text-primary); margin-bottom:12px; display:flex; align-items:center; gap:8px;">
              ${renderIcon('map')} Territory Village Rankings
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${vm.topVillages.length > 0 ? vm.topVillages.map((tv, idx) => {
                const medals = ['🥇', '🥈', '🥉', '🔹', '🔹'];
                return `
                  <div class="village-rank-card">
                    <div class="village-rank-left">
                      <span class="village-medal">${medals[idx] || '🔹'}</span>
                      <span class="village-name">${tv.village}</span>
                    </div>
                    <div class="village-rank-right">
                      <span class="village-deals-badge">${tv.deals} Deals</span>
                      <span class="village-vol-chip">${fmt(tv.vol)}</span>
                    </div>
                  </div>
                `;
              }).join('') : `
                <div style="padding:18px 12px; text-align:center; color:var(--text-muted); border:1px dashed var(--border-color); borderRadius:10px;">
                  <p style="margin:0; font-size:12px; font-weight:600;">No village customer records for this period</p>
                </div>
              `}
            </div>
          </div>
        </div>

        <!-- Section 4: Consolidated Executive Statement Table -->
        <div class="statement-panel-card">
          <div class="panel-header">
            <div>
              <div class="panel-title">${renderIcon('calculator')} Consolidated MIS Financial Statement (${vm.config.periodLabel})</div>
              <div class="panel-subtitle">Official dealership summary statement computed strictly from actual transactions</div>
            </div>
            <button class="quick-action-btn btn-sm btn-outline" onclick="window.print()">
              ${renderIcon('print')} Print Statement
            </button>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Stream / Activity</th>
                  <th>Category</th>
                  <th>Volume / Units</th>
                  <th class="text-right">Inflow / Revenue (₹)</th>
                  <th class="text-right">Outflow / Cost (₹)</th>
                  <th class="text-right">Net Contribution (₹)</th>
                  <th class="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                ${vm.statementRows.map(row => `
                  <tr>
                    <td><strong>${row.activity}</strong></td>
                    <td>${row.category}</td>
                    <td>${row.volume}</td>
                    <td class="text-right" style="color:var(--success); font-weight:800;">${row.inflow > 0 ? fmt(row.inflow) : '-'}</td>
                    <td class="text-right" style="color:var(--danger);">${row.outflow > 0 ? fmt(row.outflow) : '-'}</td>
                    <td class="text-right" style="color:${row.net >= 0 ? 'var(--success)' : 'var(--danger)'}; font-weight:800;">
                      ${row.net !== 0 ? `${row.net > 0 ? '+' : ''}${fmt(row.net)}` : '₹0'}
                    </td>
                    <td class="text-center"><span class="badge ${row.statusBadge}">${row.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr style="background:var(--bg-main); font-weight:900;">
                  <td colspan="3"><strong>Consolidated Totals (${vm.config.name})</strong></td>
                  <td class="text-right" style="color:var(--success); font-size:15px;">${fmt(vm.revenue)}</td>
                  <td class="text-right" style="color:var(--danger); font-size:15px;">${fmt(vm.totalExpenses + (vm.cogs || 0))}</td>
                  <td class="text-right" style="color:${vm.netProfit >= 0 ? 'var(--primary)' : 'var(--danger)'}; font-size:16px;">
                    ${vm.netProfit >= 0 ? '+' : ''}${fmt(vm.netProfit)}
                  </td>
                  <td class="text-center"><span class="badge badge-gold">Active</span></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  bindAnalyticsEvents() {
    // Timeframe switch pills
    document.querySelectorAll('.timeframe-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tf = btn.dataset.timeframe;
        if (tf) {
          this.analyticsTimeframe = tf;
          this.renderCurrentView();
        }
      });
    });

    // Print Button
    const printBtn = document.getElementById('printAnalyticsBtn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Export CSV Button
    const exportBtn = document.getElementById('exportAnalyticsCsvBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportAnalyticsCSV();
      });
    }
  }

  exportAnalyticsCSV() {
    const vm = getAnalyticsViewModel(this.analyticsTimeframe || 'monthly', store);
    const rows = [
      ['Maa Durga Engineering - Executive Summary Analytics MIS'],
      ['Period', vm.config.periodLabel],
      ['Timeframe', vm.config.name],
      ['Generated On', new Date().toLocaleString('en-IN')],
      [],
      ['Metric', 'Value'],
      ['Total Sales Turnover (Revenue)', vm.revenue],
      ['Total Showroom Expenses', vm.totalExpenses],
      ['Gross Profit Margin', vm.grossProfit],
      ['Net Profit', vm.netProfit],
      ['Net Margin (%)', `${vm.netMarginPct}%`],
      ['Cost of Goods Sold (COGS)', vm.cogs || 0],
      ['Total Cash Inflow', vm.cashIn],
      ['Total Cash Outflow', vm.cashOut],
      ['Net Cash Flow', vm.netCashFlow],
      ['Total Billed Invoices', vm.billsCount],
      ['Total Billed Amount (Rs)', vm.scaledBilledRupees],
      ['Total Paid / Collected (Rs)', vm.scaledPaidRupees],
      ['Outstanding Dues (Rs)', vm.scaledDueRupees],
      ['Payment Collection Rate (%)', `${vm.collectionRate}%`],
      ['Tractors Delivered (Units)', vm.tractorsDelivered],
      ['In-Stock Yard Units', vm.inStockUnits],
      ['Active Farmer Leads', vm.totalLeads],
      ['Field Demos Conducted', vm.totalDemos],
      [],
      ['Top Tractor Model', 'Units', 'Revenue (Rs)', 'Share (%)'],
      ...vm.topModels.map(m => [m.model, m.units, m.rev, `${m.pct}%`]),
      [],
      ['Top Village', 'Deals', 'Volume (Rs)', 'Share (%)'],
      ...vm.topVillages.map(v => [v.village, v.deals, v.vol, `${v.pct}%`])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MDE_Summary_Stats_${vm.timeframe}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Analytics summary exported as CSV spreadsheet', 'success', 'Export Complete');
  }

  openCashMovementModal(defaultType = 'IN') {
    const modal = document.getElementById('cashMovementModal');
    if (!modal) return;

    const form = document.getElementById('cashMovementForm');
    const inRadio = document.getElementById('cmFlowTypeIn');
    const outRadio = document.getElementById('cmFlowTypeOut');
    const inLabel = document.getElementById('cmTypeInLabel');
    const outLabel = document.getElementById('cmTypeOutLabel');
    const categorySelect = document.getElementById('cmCategory');
    const partyInput = document.getElementById('cmParty');
    const amountInput = document.getElementById('cmAmount');
    const dateInput = document.getElementById('cmDate');
    const refInput = document.getElementById('cmRef');
    const notesInput = document.getElementById('cmNotes');
    const submitBtn = document.getElementById('cmSubmitBtn');

    if (form) form.reset();
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    const inCategories = [
      { value: 'Customer Advance', text: 'Customer Token Advance' },
      { value: 'Tractor Sale', text: 'Tractor Full / Margin Payment' },
      { value: 'Implement Sale', text: 'Implement / Rotavator Sale' },
      { value: 'Workshop & Service', text: 'Workshop / Service Collection' },
      { value: 'Bank Loan Credit', text: 'Bank Loan Disbursement (Direct Credit)' },
      { value: 'OEM / Govt Subsidy', text: 'OEM / DBT Subsidy Credit' },
      { value: 'Capital / Other Inflow', text: 'Owner / Capital Infusion' },
      { value: 'Miscellaneous', text: 'Other Inflow' }
    ];

    const outCategories = [
      { value: 'Freight & Unloading', text: 'Freight & Unloading (Stock Arrival)' },
      { value: 'PDI & Workshop Consumables', text: 'PDI & Workshop Consumables' },
      { value: 'Fuel & Transport', text: 'Fuel & Demo Diesel' },
      { value: 'Showroom Rent & Utilities', text: 'Showroom Rent & Utilities' },
      { value: 'Staff Salaries & Incentives', text: 'Staff Salaries & Incentives' },
      { value: 'Local Marketing & Banners', text: 'Local Marketing & Wall Paintings' },
      { value: 'Tea, Refreshments & Hospitality', text: 'Tea & Customer Hospitality' },
      { value: 'Office & Documentation', text: 'Office & Documentation Charges' },
      { value: 'Miscellaneous', text: 'Other Outflow / Expense' }
    ];

    const updateFlowUI = (isDeposit) => {
      if (inLabel) {
        inLabel.style.border = isDeposit ? '2px solid #059669' : '2px solid #e2e8f0';
        inLabel.style.background = isDeposit ? '#ecfdf5' : '#ffffff';
        inLabel.style.color = isDeposit ? '#065f46' : '#64748b';
      }
      if (outLabel) {
        outLabel.style.border = !isDeposit ? '2px solid #dc2626' : '2px solid #e2e8f0';
        outLabel.style.background = !isDeposit ? '#fef2f2' : '#ffffff';
        outLabel.style.color = !isDeposit ? '#991b1b' : '#64748b';
      }

      const partyLabelEl = document.getElementById('cmPartyLabel') || partyInput?.parentElement?.querySelector('label');
      if (partyLabelEl) {
        partyLabelEl.textContent = isDeposit ? 'Customer / Source Name *' : 'Vendor / Payee / Beneficiary *';
      }
      if (partyInput) {
        partyInput.placeholder = isDeposit ? 'e.g. Rameshwar Yadav (Farmer)' : 'e.g. Local Transport, Petrol Pump, Landlord';
      }

      if (categorySelect) {
        const cats = isDeposit ? inCategories : outCategories;
        categorySelect.innerHTML = cats.map(c => `<option value="${c.value}">${c.text}</option>`).join('');
      }

      if (submitBtn) {
        submitBtn.textContent = isDeposit ? '✓ Record Money IN' : '✓ Record Money OUT (Expense)';
        submitBtn.className = isDeposit ? 'quick-action-btn btn-primary' : 'quick-action-btn btn-danger';
      }
    };

    if (inRadio && outRadio) {
      if (defaultType === 'OUT') {
        outRadio.checked = true;
        updateFlowUI(false);
      } else {
        inRadio.checked = true;
        updateFlowUI(true);
      }

      inRadio.onchange = () => updateFlowUI(true);
      outRadio.onchange = () => updateFlowUI(false);
    } else {
      updateFlowUI(true);
    }

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const isDeposit = inRadio ? inRadio.checked : true;
        const type = isDeposit ? 'IN' : 'OUT';
        const amount = Number(document.getElementById('cmAmount')?.value) || 0;
        if (amount <= 0) {
          showToast('Please enter a valid amount greater than ₹0', 'warning', 'Invalid Amount');
          return;
        }

        const party = (partyInput?.value || '').trim() || (isDeposit ? 'Showroom Customer' : 'Local Vendor');
        const category = categorySelect?.value || (isDeposit ? 'Customer Advance' : 'Miscellaneous');
        const mode = document.getElementById('cmMode')?.value || 'Cash';
        const date = dateInput?.value || new Date().toISOString().split('T')[0];
        const ref = (refInput?.value || '').trim();
        const notes = (notesInput?.value || '').trim();

        if (type === 'OUT') {
          store.addExpense({
            date,
            amount,
            category,
            paymentMode: mode,
            paidTo: party,
            notes: notes || 'Cash & Bank payment outflow',
            status: 'Approved'
          });
          showToast(`₹${amount.toLocaleString('en-IN')} payment recorded & synced with Expenses!`, 'success', 'Money Out Recorded');
        } else {
          store.addCashTransaction({
            date,
            type: 'IN',
            category,
            amount,
            party,
            partyName: party,
            mode,
            paymentMode: mode,
            ref: ref || `REC-${Date.now().toString().slice(-4)}`,
            notes: notes || 'Showroom collection inflow'
          });
          showToast(`₹${amount.toLocaleString('en-IN')} collection recorded to Cash & Bank!`, 'success', 'Money In Recorded');
        }

        this.closeAllModals();
        this.renderCurrentView();
        this.renderSidebar();
      };
    }

    this.openModal('cashMovementModal');
    setTimeout(() => {
      if (amountInput) amountInput.focus();
    }, 100);
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

  filterExpensesByCategory(cat) {
    if (cat) {
      this.expenseDimension = 'category';
      this.expenseFilter = (this.expenseFilter === cat ? null : cat);
      this.renderCurrentView();
    }
  }

  purgeDemoExpenses() {
    try {
      const STORAGE_KEYS = { EXPENSES: 'mde_expenses_prod_v2', CASH_TXNS: 'mde_cash_txns_prod_v2' };
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
      const isDemo = (e) => {
        if (!e) return false;
        if (typeof e.id === 'string' && (e.id === 'EXP-001' || e.id === 'EXP-002' || /^EXP-10[1-9]$/.test(e.id))) return true;
        const text = `${e.notes || ''} ${e.paidTo || ''} ${e.description || ''} ${e.chassisTag || ''}`;
        return text.includes('Shree Balaji Logistics') ||
               text.includes('Kisan Tractor Works Workshop') ||
               text.includes('Indian Oil Kisan Pump') ||
               text.includes('Vikram Singh (Senior Tech') ||
               text.includes('Gorakhpur Mandi Yard Premises') ||
               text.includes('Gorakhpur Art Banners') ||
               text.includes('Chauhan Tea Stall') ||
               text.includes('UPPCL Electricity Gorakhpur') ||
               text.includes('Kisan Crane & Recovery') ||
               text.includes('Malur to Gorakhpur') ||
               text.includes('canopy installation & engine oil') ||
               text.includes('CH-4511-4WD-1102') ||
               text.includes('CH-4211-8901');
      };

      const cleaned = stored.filter(e => !isDemo(e));
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(cleaned));

      const storedCash = JSON.parse(localStorage.getItem(STORAGE_KEYS.CASH_TXNS) || '[]');
      const cleanCash = storedCash.filter(t => !t.ref || (!/^EXP-10[1-9]$/.test(t.ref) && t.ref !== 'EXP-001' && t.ref !== 'EXP-002'));
      localStorage.setItem(STORAGE_KEYS.CASH_TXNS, JSON.stringify(cleanCash));

      if (typeof supabaseApi !== 'undefined' && supabaseApi?.expenses) {
        supabaseApi.expenses.delete('EXP-001').catch(() => {});
        supabaseApi.expenses.delete('EXP-002').catch(() => {});
      }

      this.renderCurrentView();
    } catch (err) {
      console.warn('Purge demo error:', err);
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
    this.editingBillId = prefill?.id || null;
    this.openModal('newBillModal');
    const nextNo = store.getNextBillNumber();
    const bills = store.getBills();
    const highestPrev = bills.length > 0 ? Math.max(...bills.map(b => parseInt(b.billNumber, 10)).filter(n => !isNaN(n))) : 86;

    const billNoInput = document.getElementById('nbBillNo');
    if (billNoInput) billNoInput.value = prefill?.billNumber || nextNo;

    const billNameInput = document.getElementById('nbBillName');
    if (billNameInput) billNameInput.value = prefill?.billName || '';

    const hint = document.getElementById('nbBillNoHint');
    if (hint) {
      hint.innerHTML = `Unique Sequence (Prev: #${highestPrev}) • <a href="javascript:void(0)" id="nbResetAutoBtn" style="color:#2563eb; font-weight:700; text-decoration:underline;">Next Unique (#${nextNo})</a>`;
      const resetBtn = document.getElementById('nbResetAutoBtn');
      if (resetBtn && billNoInput) {
        resetBtn.onclick = (e) => {
          e.preventDefault();
          billNoInput.value = nextNo;
          showToast(`Bill number reset to #${nextNo}`, 'info', 'Unique Number');
        };
      }
    }

    const dateInput = document.getElementById('nbDate');
    if (dateInput) dateInput.value = toIsoDate(prefill?.date);

    const custInput = document.getElementById('nbCustomer');
    if (custInput) custInput.value = prefill?.customerName || '';

    const addrInput = document.getElementById('nbAddress');
    if (addrInput) addrInput.value = prefill?.address || '';

    const vehicleInput = document.getElementById('nbVehicle');
    if (vehicleInput) vehicleInput.value = prefill?.vehicle || '';

    const phoneInput = document.getElementById('nbPhone');
    if (phoneInput) phoneInput.value = prefill?.phone || '';

    const statusSelect = document.getElementById('nbPaymentStatus');
    const paidInput = document.getElementById('nbPaidAmount');
    if (paidInput) {
      paidInput._userEdited = false;
      paidInput.value = (prefill?.paidAmount !== undefined && prefill?.paidAmount !== null)
        ? prefill.paidAmount
        : (prefill?.totalRupees !== undefined ? prefill.totalRupees : '');
    }
    if (statusSelect) {
      statusSelect.value = prefill?.paymentStatus || (Number(prefill?.dueAmount) > 0 ? 'Partial' : 'Paid');
      statusSelect.onchange = () => {
        const totalVal = parseFloat(document.getElementById('nbTotalRupeesDisplay')?.textContent?.replace(/[^0-9.]/g, '')) || 0;
        if (statusSelect.value === 'Paid') {
          if (paidInput) paidInput.value = totalVal;
        } else if (statusSelect.value === 'Due') {
          if (paidInput) paidInput.value = 0;
        }
        this.recalcBillForm();
      };
    }
    if (paidInput) {
      paidInput.oninput = () => {
        paidInput._userEdited = true;
        this.recalcBillForm();
      };
    }

    const tbody = document.getElementById('nbItemsBody');
    if (tbody) {
      tbody.innerHTML = '';
      if (prefill?.items && prefill.items.length > 0) {
        prefill.items.forEach(it => this.addBillItemRow(it.desc, it.qty, it.unit || 'Ltr', it.rate, it.rupees, it.paise));
      } else {
        this.addBillItemRow('', '', 'Ltr', '', '', '');
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
        showToast(`Bill #${newBill.billNumber} for ${newBill.customerName} saved!`, 'success', 'Bill Saved');
        this.openBillPreviewModal(newBill, false, 'filled');
      };
    }
  }

  gatherBillFormData() {
    const nextNo = store.getNextBillNumber();
    const billNumber = document.getElementById('nbBillNo')?.value.trim() || nextNo;
    const billName = document.getElementById('nbBillName')?.value.trim() || '';
    const rawDate = document.getElementById('nbDate')?.value || new Date().toISOString().split('T')[0];
    const date = formatToDMY(rawDate);
    const customerName = document.getElementById('nbCustomer')?.value.trim() || 'मेसर्स ग्राहक';
    const address = document.getElementById('nbAddress')?.value.trim() || '';
    const phone = document.getElementById('nbPhone')?.value.trim() || '';
    const vehicle = document.getElementById('nbVehicle')?.value.trim() || '';

    const rows = document.querySelectorAll('#nbItemsBody tr');
    const items = [];
    rows.forEach(tr => {
      const qty = tr.querySelector('.nb-qty')?.value.trim() || '';
      const unit = tr.querySelector('.nb-unit')?.value.trim() || '';
      const desc = tr.querySelector('.nb-desc')?.value.trim() || '';
      const rate = Number(tr.querySelector('.nb-rate')?.value) || 0;
      const rupees = Number(tr.querySelector('.nb-rupees')?.value) || 0;
      const paise = Number(tr.querySelector('.nb-paise')?.value) || 0;
      if (desc || rupees > 0 || qty) {
        items.push({ qty, unit, desc, rate, rupees, paise });
      }
    });

    const totalRupees = items.reduce((s, it) => s + (Number(it.rupees) || 0), 0);
    const totalPaise = items.reduce((s, it) => s + (Number(it.paise) || 0), 0);
    const amountWords = numberToIndianWords(totalRupees);

    const paymentStatus = document.getElementById('nbPaymentStatus')?.value || 'Paid';
    const rawPaid = document.getElementById('nbPaidAmount')?.value;
    const paidAmount = (rawPaid !== '' && rawPaid !== undefined && !isNaN(Number(rawPaid)))
      ? Math.min(totalRupees, Math.max(0, Number(rawPaid)))
      : (paymentStatus === 'Due' ? 0 : totalRupees);
    const dueAmount = Math.max(0, totalRupees - paidAmount);

    return {
      id: this.editingBillId || undefined,
      billNumber,
      billName,
      date,
      customerName,
      address,
      phone,
      vehicle,
      items,
      totalRupees,
      totalPaise,
      amountWords,
      paymentStatus,
      paidAmount,
      dueAmount
    };
  }

  reindexBillRows() {
    const rows = document.querySelectorAll('#nbItemsBody tr');
    rows.forEach((tr, idx) => {
      const idxEl = tr.querySelector('.nb-row-idx');
      if (idxEl) idxEl.textContent = `#${idx + 1}`;
    });
  }

  addBillItemRow(desc = '', qty = '', unit = 'Ltr', rate = '', rupees = '', paise = '') {
    const tbody = document.getElementById('nbItemsBody');
    if (!tbody) return;
    const tr = document.createElement('tr');
    const rowIdx = tbody.children.length + 1;
    const descVal = (desc !== undefined && desc !== null) ? desc : '';
    const qtyVal = (qty !== undefined && qty !== null && qty !== '') ? qty : '';
    const unitVal = unit || 'Ltr';
    const rateVal = (rate !== undefined && rate !== null && rate !== 0 && rate !== '') ? rate : '';
    const rupeesVal = (rupees !== undefined && rupees !== null && rupees !== 0 && rupees !== '') ? rupees : '';
    const paiseVal = (paise !== undefined && paise !== null && paise !== 0 && paise !== '00') ? paise : '';

    tr.innerHTML = `
      <td style="text-align:center; font-weight:700; color:var(--text-muted); font-size:12px;" class="nb-row-idx">#${rowIdx}</td>
      <td>
        <input type="text" class="form-input nb-desc" style="padding:5px 8px; font-size:12.5px;" placeholder="विवरण (e.g. डीजल / इंजन ऑयल / फिल्टर)" value="${descVal}" required />
      </td>
      <td>
        <input type="number" class="form-input nb-qty" style="padding:5px 6px; font-size:12.5px; text-align:center; font-weight:700;" placeholder="1" min="0" step="any" value="${qtyVal}" />
      </td>
      <td>
        <select class="form-select nb-unit" style="padding:5px 4px; font-size:11.5px;">
          <option value="Ltr" ${unitVal === 'Ltr' ? 'selected' : ''}>Ltr (ली.)</option>
          <option value="Pcs" ${unitVal === 'Pcs' ? 'selected' : ''}>Pcs (नग)</option>
          <option value="Can" ${unitVal === 'Can' ? 'selected' : ''}>Can (कैन)</option>
          <option value="Bags" ${unitVal === 'Bags' ? 'selected' : ''}>Bags (बोरी)</option>
          <option value="Kg" ${unitVal === 'Kg' ? 'selected' : ''}>Kg (किलो)</option>
          <option value="Set" ${unitVal === 'Set' ? 'selected' : ''}>Set (सेट)</option>
          <option value="Hrs" ${unitVal === 'Hrs' ? 'selected' : ''}>Hrs (घंटा)</option>
          <option value="Nos" ${unitVal === 'Nos' ? 'selected' : ''}>Nos (नं०)</option>
          <option value="" ${!unitVal || unitVal === 'None' ? 'selected' : ''}>- None -</option>
        </select>
      </td>
      <td>
        <input type="number" class="form-input nb-rate" style="padding:5px 6px; font-size:12.5px; text-align:right;" placeholder="दर ₹" min="0" step="any" value="${rateVal}" />
      </td>
      <td>
        <input type="number" class="form-input nb-rupees" style="padding:5px 6px; font-size:12.5px; text-align:right; font-weight:700; color:#1e3a8a;" placeholder="0" min="0" value="${rupeesVal}" />
      </td>
      <td>
        <input type="number" class="form-input nb-paise" style="padding:5px 4px; font-size:12.5px; text-align:center;" placeholder="00" min="0" max="99" value="${paiseVal}" />
      </td>
      <td style="text-align:center;">
        <button type="button" class="nb-remove-row-btn" style="background:transparent; border:none; color:#ef4444; font-size:18px; font-weight:700; cursor:pointer; line-height:1; padding:2px 6px; border-radius:4px;" title="Remove item">&times;</button>
      </td>
    `;
    tbody.appendChild(tr);

    const removeBtn = tr.querySelector('.nb-remove-row-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const allRows = tbody.querySelectorAll('tr');
        if (allRows.length <= 1) {
          tr.remove();
          this.addBillItemRow('', '', 'Ltr', '', '', '');
        } else {
          tr.remove();
        }
        this.reindexBillRows();
        this.recalcBillForm();
      });
    }

    if (!tbody._hasBoundRowDelete) {
      tbody._hasBoundRowDelete = true;
      tbody.addEventListener('click', (e) => {
        const btn = e.target.closest('.nb-remove-row-btn');
        if (btn) {
          e.preventDefault();
          e.stopPropagation();
          const targetTr = btn.closest('tr');
          if (targetTr) {
            const allRows = tbody.querySelectorAll('tr');
            if (allRows.length <= 1) {
              targetTr.remove();
              this.addBillItemRow('', '', 'Ltr', '', '', '');
            } else {
              targetTr.remove();
            }
            this.reindexBillRows();
            this.recalcBillForm();
          }
        }
      });
    }

    const qtyInput = tr.querySelector('.nb-qty');
    const unitSelect = tr.querySelector('.nb-unit');
    const rateInput = tr.querySelector('.nb-rate');
    const rupeesInput = tr.querySelector('.nb-rupees');
    const paiseInput = tr.querySelector('.nb-paise');

    const onQtyRateChange = () => {
      const q = parseFloat(qtyInput.value);
      const r = parseFloat(rateInput.value);
      if (!isNaN(q) && !isNaN(r) && q > 0 && r >= 0) {
        const product = q * r;
        const whole = Math.floor(product);
        const pFrac = Math.round((product - whole) * 100);
        rupeesInput.value = whole;
        paiseInput.value = pFrac > 0 ? (pFrac < 10 ? '0' + pFrac : pFrac) : '00';
      }
      this.recalcBillForm();
    };

    qtyInput.addEventListener('input', onQtyRateChange);
    rateInput.addEventListener('input', onQtyRateChange);
    unitSelect.addEventListener('change', () => this.recalcBillForm());
    rupeesInput.addEventListener('input', () => this.recalcBillForm());
    paiseInput.addEventListener('input', () => this.recalcBillForm());

    this.recalcBillForm();
  }

  addBillPresetItem(desc, qty, unit, rate) {
    const rupees = (qty && rate) ? Math.round(Number(qty) * Number(rate)) : '';
    this.addBillItemRow(desc, qty, unit, rate, rupees, 0);
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

    const statusSelect = document.getElementById('nbPaymentStatus');
    const paidInput = document.getElementById('nbPaidAmount');
    const dueDisplay = document.getElementById('nbDueAmountDisplay');
    if (statusSelect && paidInput && dueDisplay) {
      if (statusSelect.value === 'Paid') {
        if (!paidInput._userEdited || paidInput.value === '' || Number(paidInput.value) === 0) {
          paidInput.value = totalR;
        }
      } else if (statusSelect.value === 'Due') {
        paidInput.value = 0;
      }
      const pVal = paidInput.value !== '' ? Number(paidInput.value) : (statusSelect.value === 'Due' ? 0 : totalR);
      const dVal = Math.max(0, totalR - (isNaN(pVal) ? 0 : pVal));
      dueDisplay.textContent = `₹${dVal.toLocaleString('en-IN')}`;
      dueDisplay.style.color = dVal > 0 ? '#dc2626' : '#059669';
    }
  }

  openBillPreviewModal(bill, isBlank = false, startMode = null) {
    const previewBox = document.getElementById('billPreviewBody') || document.getElementById('quotePrintPreviewBody');
    if (!previewBox) return;

    const nextAutoNo = store.getNextBillNumber();
    const currentBill = bill ? { ...bill } : {
      billNumber: nextAutoNo,
      date: new Date().toISOString().split('T')[0],
      customerName: '',
      address: '',
      phone: '',
      items: [],
      totalRupees: 0,
      totalPaise: 0,
      amountWords: 'Zero Rupees Only'
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
            <div style="display:flex; align-items:center; gap:5px; background:#f8fafc; padding:3px 8px; border-radius:6px; border:1px solid #cbd5e1;" title="Type to change Bill Number">
              <span style="font-size:11.5px; font-weight:800; color:#334155;">नं० (Bill #):</span>
              <input type="text" id="tsbBillNoInput" value="${currentBill.billNumber || nextAutoNo}" style="width:75px; font-size:13.5px; font-weight:900; font-family:monospace, sans-serif; padding:2px 6px; border:1px solid #94a3b8; border-radius:4px; text-align:center; color:#1e3a8a; background:#ffffff;" placeholder="No." />
            </div>
            <div style="display:flex; align-items:center; gap:5px; background:#f8fafc; padding:3px 8px; border-radius:6px; border:1px solid #cbd5e1;" title="Optional Bill Name or Reference">
              <span style="font-size:11.5px; font-weight:800; color:#334155;">नाम/Ref:</span>
              <input type="text" id="tsbBillNameInput" value="${currentBill.billName || ''}" style="width:115px; font-size:12px; font-weight:700; padding:2px 6px; border:1px solid #94a3b8; border-radius:4px; color:#1e3a8a; background:#ffffff;" placeholder="बिल का नाम" />
            </div>
            <button class="quick-action-btn btn-sm btn-primary" id="tsbSaveBillBtn" style="background:linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);">
              💾 Save Bill
            </button>
            <button class="quick-action-btn btn-sm btn-outline" id="tsbPrintBillBtn" style="background:#ffffff; color:#1e3a8a; border-color:#2563eb; font-weight:700;">
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
      const printBtn = document.getElementById('tsbPrintBillBtn');
      const tsbBillNoInput = document.getElementById('tsbBillNoInput');
      const tsbBillNameInput = document.getElementById('tsbBillNameInput');

      if (tsbBillNoInput) {
        tsbBillNoInput.oninput = () => {
          const val = tsbBillNoInput.value.trim();
          if (val) {
            currentBill.billNumber = val;
            const liveVal = document.getElementById('mddLiveBillNoVal');
            if (liveVal) liveVal.textContent = val;
            const liveInp = document.getElementById('mddLiveBillNo');
            if (liveInp) liveInp.value = val;
          }
        };
      }

      if (tsbBillNameInput) {
        tsbBillNameInput.oninput = () => {
          currentBill.billName = tsbBillNameInput.value.trim();
        };
      }

      const editNoBtn = document.getElementById('mddEditBillNoBtn');
      if (editNoBtn) {
        editNoBtn.onclick = () => {
          const currentVal = currentBill.billNumber || nextAutoNo;
          const newVal = prompt('बिल नंबर बदलें (Enter custom Bill Number):', currentVal);
          if (newVal !== null && newVal.trim() !== '') {
            currentBill.billNumber = newVal.trim();
            if (tsbBillNoInput) tsbBillNoInput.value = currentBill.billNumber;
            renderView(activeMode);
            showToast(`Bill number changed to #${currentBill.billNumber}`, 'info', 'Bill No. Updated');
          }
        };
      }

      const liveNoInput = document.getElementById('mddLiveBillNo');
      if (liveNoInput) {
        liveNoInput.oninput = () => {
          const val = liveNoInput.value.trim();
          if (val) {
            currentBill.billNumber = val;
            if (tsbBillNoInput) tsbBillNoInput.value = val;
          }
        };
      }

      if (liveBtn) liveBtn.onclick = () => renderView('live');
      if (blankBtn) blankBtn.onclick = () => renderView('pure_blank');
      if (filledBtn) filledBtn.onclick = () => renderView('filled');
      if (printBtn) {
        printBtn.onclick = () => {
          if (isLive) this.syncLiveSheetDataToCurrent(currentBill);
          const billEl = document.getElementById('printableMddBill');
          if (billEl) autoFitBillToOnePage(billEl);
          document.body.classList.add('is-printing-bill', 'bill-modal-active', 'modal-open');
          window.print();
        };
      }
      if (openFormBtn) {
        openFormBtn.onclick = () => {
          if (isLive) this.syncLiveSheetDataToCurrent(currentBill);
          this.closeModal('billPreviewModal');
          this.openNewBillModal(currentBill);
        };
      }

      if (saveBillBtn) {
        saveBillBtn.onclick = () => {
          if (isLive) this.syncLiveSheetDataToCurrent(currentBill);
          if (tsbBillNameInput) currentBill.billName = tsbBillNameInput.value.trim();
          const saved = store.addBill(currentBill);
          currentBill.id = saved.id;
          currentBill.billNumber = saved.billNumber;
          currentBill.billName = saved.billName;
          showToast(`Bill #${saved.billNumber} for ${saved.customerName} successfully saved!`, 'success', 'Saved');
          renderView('filled');
        };
      }

      if (isLive) {
        this.bindLiveSheetEvents(currentBill);
      }
    };

    renderView(activeMode);
    this.openModal('billPreviewModal');
  }

  syncLiveSheetDataToCurrent(bill) {
    const billNoInput = document.getElementById('mddLiveBillNo') || document.getElementById('tsbBillNoInput');
    const billNameInput = document.getElementById('tsbBillNameInput');
    const custInput = document.getElementById('mddLiveCustomer');
    const addrInput = document.getElementById('mddLiveAddress');
    const vehInput = document.getElementById('mddLiveVehicle');
    const dateInput = document.getElementById('mddLiveDate');
    if (billNoInput && billNoInput.value.trim()) bill.billNumber = billNoInput.value.trim();
    if (billNameInput && billNameInput.value.trim()) bill.billName = billNameInput.value.trim();
    if (custInput) bill.customerName = custInput.value.trim() || 'मेसर्स ग्राहक';
    if (addrInput) bill.address = addrInput.value.trim() || '';
    if (vehInput) bill.vehicle = vehInput.value.trim() || '';
    if (dateInput) bill.date = formatToDMY(dateInput.value) || formatToDMY(new Date());

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
        if (dateInput) bill.date = formatToDMY(dateInput.value) || formatToDMY(new Date());
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
        <td style="width:75px; text-align:center; font-weight:800; font-size:14px; color:#334155; padding:2px 4px;">${idx}</td>
        <td style="padding:2px 8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
            <input type="text" class="mdd-sheet-table-input mdd-live-desc" value="${desc}" style="font-weight:600; flex:1;" />
            <div style="display:flex; align-items:center; gap:2px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:4px; padding:1px 6px;" title="मात्रा / Quantity">
              <span style="font-size:12px; font-weight:800; color:#64748b;">x</span>
              <input type="number" class="mdd-sheet-table-input mdd-live-qty" value="${qty || ''}" placeholder="Qty" min="0" step="any" style="width:50px; text-align:center; font-weight:800; font-size:13px; color:#1e3a8a;" />
            </div>
          </div>
        </td>
        <td style="width:100px; text-align:right; padding:2px 8px;"><input type="number" class="mdd-sheet-table-input mdd-live-rupees" value="${rupees}" style="text-align:right; font-weight:700; font-family:monospace, sans-serif; font-size:14px;" /></td>
        <td style="width:50px; text-align:center; padding:2px 4px;"><input type="number" class="mdd-sheet-table-input mdd-live-paise" value="${paise || '00'}" style="text-align:center; font-family:monospace, sans-serif; font-size:13px;" /></td>
      `;
      const spacer = tbody.querySelector('.mdd-plane-spacer-row');
      if (spacer) {
        tbody.insertBefore(targetRow, spacer);
      } else {
        tbody.appendChild(targetRow);
      }
    } else {
      const qtyInp = targetRow.querySelector('.mdd-live-qty');
      if (qtyInp) qtyInp.value = qty || '';
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
      <td style="width:75px; text-align:center; font-weight:800; font-size:14px; color:#334155; padding:2px 4px;">${idx}</td>
      <td style="padding:2px 8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <input type="text" class="mdd-sheet-table-input mdd-live-desc" placeholder="विवरण (Item / Service)" style="font-weight:600; flex:1;" />
          <div style="display:flex; align-items:center; gap:2px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:4px; padding:1px 6px;" title="मात्रा / Quantity">
            <span style="font-size:12px; font-weight:800; color:#64748b;">x</span>
            <input type="number" class="mdd-sheet-table-input mdd-live-qty" placeholder="Qty" min="0" step="any" style="width:50px; text-align:center; font-weight:800; font-size:13px; color:#1e3a8a;" />
          </div>
        </div>
      </td>
      <td style="width:100px; text-align:right; padding:2px 8px;"><input type="number" class="mdd-sheet-table-input mdd-live-rupees" placeholder="0" style="text-align:right; font-weight:700; font-family:monospace, sans-serif; font-size:14px;" /></td>
      <td style="width:50px; text-align:center; padding:2px 4px;"><input type="number" class="mdd-sheet-table-input mdd-live-paise" placeholder="00" style="text-align:center; font-family:monospace, sans-serif; font-size:13px;" /></td>
    `;
    const spacer = tbody.querySelector('.mdd-plane-spacer-row');
    if (spacer) {
      tbody.insertBefore(tr, spacer);
    } else {
      tbody.appendChild(tr);
    }
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
