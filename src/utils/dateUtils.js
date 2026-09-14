// Date Formatting Utility (DD-MM-YYYY) for Maa Durga Engineering OS

export function formatToDMY(dateInput) {
  if (!dateInput) return '';
  const str = String(dateInput).trim();
  if (!str) return '';
  // Already in DD-MM-YYYY format
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) return str;
  // DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return str.replace(/\//g, '-');
  // YYYY-MM-DD or YYYY/MM/DD
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
