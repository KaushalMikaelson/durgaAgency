// Utility for generating unique, filesystem-safe Bill filenames and managing Print-to-PDF titles

/**
 * Generates a clean, unique, filesystem-safe filename for a bill
 * Format: Bill_{BillNo}_{CustomerName}_{Date}
 * e.g. "Bill_86_Ramesh_Verma_28-09-2026"
 * 
 * @param {Object|HTMLElement} bill
 * @returns {string} Unique sanitized filename
 */
export function getBillUniqueFileName(bill) {
  let billNo = '';
  let cust = '';
  let dateStr = '';
  let billName = '';
  let vehicle = '';

  if (bill && typeof bill === 'object') {
    if (bill.nodeType === 1) {
      // DOM Element: Extract attributes or live inputs
      billNo = bill.getAttribute('data-bill-number') ||
               bill.querySelector('#mddLiveBillNo')?.value ||
               bill.querySelector('#mddLiveBillNoVal')?.textContent ||
               document.getElementById('tsbBillNoInput')?.value || '';
      
      cust = bill.getAttribute('data-customer-name') ||
             bill.querySelector('#mddLiveCustomer')?.value ||
             bill.querySelector('.mdd-cust-col .mdd-dots-line')?.textContent ||
             bill.querySelector('.bold-red')?.textContent || '';

      dateStr = bill.getAttribute('data-bill-date') ||
                bill.querySelector('#mddLiveDate')?.value ||
                bill.querySelector('.mdd-date-field .mdd-dots-line')?.textContent || '';

      billName = bill.getAttribute('data-bill-name') ||
                 document.getElementById('tsbBillNameInput')?.value || '';

      vehicle = bill.getAttribute('data-vehicle') || '';
    } else {
      // Plain bill object
      billNo = bill.billNumber || bill.number || '';
      cust = bill.customerName || bill.customer || '';
      dateStr = bill.date || '';
      billName = bill.billName || '';
      vehicle = bill.vehicle || '';
    }
  }

  // Fallback to active DOM if bill was null or incomplete
  if (!billNo || !cust) {
    const domBill = document.getElementById('printableMddBill') ||
                    document.getElementById('printableBillSlip') ||
                    document.querySelector('.maa-durga-slip');
    if (domBill) {
      if (!billNo) {
        billNo = domBill.getAttribute('data-bill-number') ||
                 domBill.querySelector('#mddLiveBillNo')?.value ||
                 domBill.querySelector('#mddLiveBillNoVal')?.textContent ||
                 document.getElementById('tsbBillNoInput')?.value || '';
      }
      if (!cust) {
        cust = domBill.getAttribute('data-customer-name') ||
               domBill.querySelector('#mddLiveCustomer')?.value ||
               domBill.querySelector('.mdd-cust-col .mdd-dots-line')?.textContent || '';
      }
      if (!dateStr) {
        dateStr = domBill.getAttribute('data-bill-date') ||
                  domBill.querySelector('#mddLiveDate')?.value ||
                  domBill.querySelector('.mdd-date-field .mdd-dots-line')?.textContent || '';
      }
    }
  }

  // Helper to sanitize strings for OS filenames (remove invalid chars: \ / : * ? " < > | #)
  const sanitize = (val) => {
    if (!val) return '';
    return String(val)
      .replace(/^मेसर्स\s*/i, '')
      .replace(/[/\\?%*:|"<>#]/g, '')
      .replace(/[\r\n\t]+/g, ' ')
      .trim()
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  const safeNo = sanitize(billNo) || 'Estimate';
  let safeCust = sanitize(cust);
  if (safeCust === 'मेसर्स_ग्राहक' || safeCust === 'ग्राहक' || safeCust === 'M_s_Customer') {
    safeCust = '';
  }
  const safeName = sanitize(billName);

  let safeDate = '';
  if (dateStr) {
    safeDate = sanitize(String(dateStr).split('T')[0].replace(/\//g, '-'));
  }
  if (!safeDate) {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, '0');
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const y = today.getFullYear();
    safeDate = `${d}-${m}-${y}`;
  }

  const parts = ['Bill', safeNo];
  if (safeCust) parts.push(safeCust);
  if (safeName && safeName !== safeCust) parts.push(safeName);
  if (!safeCust && !safeName) parts.push('Maa_Durga_Diesel');
  parts.push(safeDate);

  return parts.join('_');
}

/**
 * Triggers window.print() while dynamically setting document.title to the unique bill file name.
 * When the browser's "Save as PDF" dialog opens, it will automatically propose this unique name.
 * 
 * @param {Object|HTMLElement} bill
 * @param {Function} [prepareFn] Optional callback to execute before printing (e.g. DOM autofit)
 */
export function printBillWithUniqueTitle(bill, prepareFn) {
  const originalTitle = document.title;
  const uniqueTitle = getBillUniqueFileName(bill);

  if (typeof prepareFn === 'function') {
    try {
      prepareFn();
    } catch (err) {
      console.warn('prepareFn failed during printBillWithUniqueTitle:', err);
    }
  }

  // Set document title before print dialog opens so Chrome / Edge uses it as PDF name
  document.title = uniqueTitle;

  const restore = () => {
    document.title = originalTitle;
    window.removeEventListener('afterprint', restore);
  };
  window.addEventListener('afterprint', restore);

  try {
    window.print();
  } finally {
    // Safety fallback: restore original title after print dialog closes
    setTimeout(restore, 3000);
  }
}

// Global safety listener: auto-update document.title on beforeprint if printing a bill
if (typeof window !== 'undefined' && !window._hasBoundBillPrintTitleListener) {
  window._hasBoundBillPrintTitleListener = true;
  let savedOriginalTitle = '';

  window.addEventListener('beforeprint', () => {
    const billEl = document.querySelector('#directBillPrintContainer #printableMddBill') ||
                   document.getElementById('printableMddBill') ||
                   document.getElementById('printableBillSlip') ||
                   document.querySelector('.maa-durga-slip');
    const isPrintingBill = document.body.classList.contains('is-direct-printing') ||
                          document.body.classList.contains('is-printing-bill') ||
                          document.getElementById('billPreviewModal')?.classList.contains('active') ||
                          Boolean(billEl);

    if (isPrintingBill && billEl && !document.title.startsWith('Bill_')) {
      savedOriginalTitle = document.title;
      document.title = getBillUniqueFileName(billEl);
    }
  });

  window.addEventListener('afterprint', () => {
    if (savedOriginalTitle) {
      document.title = savedOriginalTitle;
      savedOriginalTitle = '';
    }
  });
}

/**
 * Direct silent printing via completely hidden off-screen iframe.
 * The parent page is NEVER affected, no preview modal or element is ever visible on screen.
 * 
 * @param {Object} bill
 * @param {string} billHTML
 */
export function printBillDirectIframe(bill, billHTML) {
  const originalTitle = document.title;
  const uniqueTitle = getBillUniqueFileName(bill);

  // Set document title for Save as PDF filename
  document.title = uniqueTitle;

  // Gather parent stylesheet and style tags
  const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map(el => el.outerHTML)
    .join('\n');

  // Create an entirely hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-99999px';
  iframe.style.top = '-99999px';
  iframe.style.width = '794px';
  iframe.style.height = '1123px';
  iframe.style.opacity = '0';
  iframe.style.visibility = 'hidden';
  iframe.style.pointerEvents = 'none';
  iframe.style.border = 'none';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="hi">
        <head>
          <meta charset="utf-8" />
          <title>${uniqueTitle}</title>
          ${styleTags}
          <style>
            @page {
              size: A4 portrait;
              margin: 4mm 6mm 4mm 6mm !important;
            }
            html, body {
              background: #ffffff !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              height: auto !important;
              font-size: 12pt !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print {
              display: none !important;
            }
            .mdd-bill-sheet {
              box-shadow: none !important;
              margin: 0 auto !important;
              width: 100% !important;
            }
          </style>
        </head>
        <body>
          ${billHTML}
        </body>
      </html>
    `);
    doc.close();

    const cleanup = () => {
      document.title = originalTitle;
      try {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      } catch (err) {}
    };

    setTimeout(() => {
      try {
        const billEl = iframe.contentDocument ? iframe.contentDocument.getElementById('printableMddBill') : null;
        if (billEl) {
          const actualHeight = billEl.scrollHeight || billEl.offsetHeight;
          if (actualHeight > 1060) {
            const scale = Math.max(0.78, Math.floor((1060 / actualHeight) * 1000) / 1000);
            billEl.style.transform = `scale(${scale})`;
            billEl.style.transformOrigin = 'top center';
          }
        }
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.warn('Iframe print error, fallback to window.print:', err);
        window.print();
      } finally {
        if (iframe.contentWindow) {
          iframe.contentWindow.addEventListener('afterprint', cleanup);
        }
        window.addEventListener('afterprint', cleanup);
        setTimeout(cleanup, 2500);
      }
    }, 200);
  } catch (e) {
    console.error('Failed to create print iframe:', e);
    window.print();
  }
}

// Attach to window for global access across vanilla JS and React
if (typeof window !== 'undefined') {
  window.getBillUniqueFileName = getBillUniqueFileName;
  window.printBillWithUniqueTitle = printBillWithUniqueTitle;
  window.printBillDirectIframe = printBillDirectIframe;
}
