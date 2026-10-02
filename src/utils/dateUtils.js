// Date Formatting Utility (DD-MM-YYYY) for Maa Durga Engineering OS

/**
 * Returns today's local date as YYYY-MM-DD without UTC timezone offset shift
 */
export function getLocalIsoDate(d = new Date()) {
  const dateObj = (d instanceof Date && !isNaN(d.getTime())) ? d : new Date();
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Formats any date input (Date object, timestamp, ISO string, DD/MM/YYYY, YYYY-MM-DD)
 * into standard Indian DD-MM-YYYY format.
 */
export function formatToDMY(dateInput) {
  if (!dateInput) return '';
  if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) return '';
    const day = String(dateInput.getDate()).padStart(2, '0');
    const month = String(dateInput.getMonth() + 1).padStart(2, '0');
    const year = dateInput.getFullYear();
    return `${day}-${month}-${year}`;
  }
  const str = String(dateInput).trim();
  if (!str) return '';

  // Already in DD-MM-YYYY format
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) return str;

  // DD/MM/YYYY format
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const parts = str.split('/');
    return `${String(parts[0]).padStart(2, '0')}-${String(parts[1]).padStart(2, '0')}-${parts[2]}`;
  }

  // YYYY-MM-DD or YYYY/MM/DD (ISO formats)
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(str)) {
    const [y, m, d] = str.split('T')[0].split(/[-/]/);
    return `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y}`;
  }

  // DD-MM-YYYY with single digits
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(str)) {
    const parts = str.split('-');
    return `${String(parts[0]).padStart(2, '0')}-${String(parts[1]).padStart(2, '0')}-${parts[2]}`;
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

/**
 * Converts any date format to YYYY-MM-DD for HTML input[type="date"]
 */
export function toIsoDate(dmyOrIso) {
  if (!dmyOrIso) return getLocalIsoDate();
  if (dmyOrIso instanceof Date) {
    return getLocalIsoDate(dmyOrIso);
  }
  const str = String(dmyOrIso).trim();
  if (!str) return getLocalIsoDate();

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(str)) {
    const [y, m, d] = str.split('T')[0].split(/[-/]/);
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  // DD-MM-YYYY or DD/MM/YYYY
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(str)) {
    const [d, m, y] = str.split(/[-/]/);
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  return str.split('T')[0];
}

/**
 * Safely parses any date string (including DD-MM-YYYY) into a numeric timestamp
 * preventing JavaScript from parsing DD-MM-YYYY as MM-DD-YYYY or NaN
 */
export function parseDateSafe(dateInput) {
  if (!dateInput) return 0;
  if (dateInput instanceof Date) return dateInput.getTime();
  if (typeof dateInput === 'number') return dateInput;

  const str = String(dateInput).trim();
  if (!str) return 0;

  // DD-MM-YYYY or DD/MM/YYYY
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(str)) {
    const [d, m, y] = str.split(/[-/]/);
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
    return isNaN(dateObj.getTime()) ? 0 : dateObj.getTime();
  }

  // YYYY-MM-DD or YYYY/MM/DD
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(str)) {
    const [y, m, d] = str.split('T')[0].split(/[-/]/);
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
    return isNaN(dateObj.getTime()) ? 0 : dateObj.getTime();
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

