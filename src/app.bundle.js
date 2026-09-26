import { supabaseApi } from './services/supabaseApi.js';
import { supabase } from './lib/supabase.js';
import { getAnalyticsViewModel, renderBarChartSVG, renderDonutSVG } from './analyticsEngine.js';

// Maa Durga Engineering - Unified Self-Contained Bundle
// Works seamlessly in both HTTP and local file:// browser modes without CORS limitations

(function() {
  'use strict';

  // --- 1. SHOWROOM DATA & DEFAULTS ---
  const SHOWROOM_INFO = {
    name: "Maa Durga Engineering",
    tagline: "Authorized VST Zetor Agricultural Machinery & Tractor Sales, Service & Spares Dealership",
    address: "NH-28 Bypass Road, Near Kisan Mandi, Industrial Area, Gorakhpur - 273001, UP",
    phone: "+91 98380 12345",
    whatsapp: "919838012345",
    email: "sales@maadurgaengineering.in",
    gstin: "09AAACM4521K1ZF",
    bankName: "State Bank of India",
    accountNo: "3892010482910",
    ifsc: "SBIN0001248",
    authorizedBrands: ["VST Zetor", "VST Tillers Tractors", "Zetor"]
  };

  const DEFAULT_TRACTORS = [
    {
      id: "TRAC-001",
      brand: "VST Zetor",
      model: "4211 2WD",
      hp: 42,
      ptoHp: 38,
      engineCc: 2500,
      cylinders: 3,
      liftCapacityKg: 1800,
      transmission: "Fully Constant Mesh Helical (8 F + 2 R)",
      drive: "2WD",
      price: 745000,
      dealerPurchaseCost: 670000,
      stockCount: 0,
      bestSoil: ["All Types", "Sandy Loam", "Medium", "Loam"],
      recommendedAcresMin: 5,
      recommendedAcresMax: 18,
      compatibleImplements: ["Rotavator (5 ft)", "Cultivator (9 Tyne)", "Trolley (6-8 Ton)", "Thresher", "Sprayer"],
      popularCrops: ["Wheat", "Mustard", "Vegetables", "Paddy", "Pulses"],
      chassisList: [],
      warranty: "6 Years / 6000 Hours Warranty",
      status: "Available to Order"
    },
    {
      id: "TRAC-002",
      brand: "VST Zetor",
      model: "4211 4WD",
      hp: 42,
      ptoHp: 38,
      engineCc: 2500,
      cylinders: 3,
      liftCapacityKg: 1800,
      transmission: "Fully Constant Mesh Helical (8 F + 2 R)",
      drive: "4WD",
      price: 795000,
      dealerPurchaseCost: 715000,
      stockCount: 0,
      bestSoil: ["Wetland / Puddle", "Clay", "Black Soil", "Loam"],
      recommendedAcresMin: 6,
      recommendedAcresMax: 22,
      compatibleImplements: ["Rotavator (5-6 ft)", "Puddler", "Cultivator (9 Tyne)", "Trolley (8 Ton)"],
      popularCrops: ["Paddy / Rice", "Wheat", "Potato", "Sugarcane"],
      chassisList: [],
      warranty: "6 Years / 6000 Hours Warranty",
      status: "Available to Order"
    },
    {
      id: "TRAC-003",
      brand: "VST Zetor",
      model: "4511 2WD",
      hp: 47,
      ptoHp: 40.5,
      engineCc: 2979,
      cylinders: 3,
      liftCapacityKg: 1800,
      transmission: "Fully Constant Mesh Helical (8 F + 2 R) Side Shift",
      drive: "2WD",
      price: 770000,
      dealerPurchaseCost: 695000,
      stockCount: 0,
      bestSoil: ["Medium", "Loam", "Clay Loam", "All Types"],
      recommendedAcresMin: 8,
      recommendedAcresMax: 28,
      compatibleImplements: ["Rotavator (6 ft)", "Cultivator (11 Tyne)", "Trolley (8-10 Ton)", "MB Plough (2 Bottom)", "Thresher"],
      popularCrops: ["Wheat", "Paddy", "Sugarcane", "Potato", "Maize"],
      chassisList: [],
      warranty: "6 Years / 6000 Hours Warranty",
      status: "Available to Order"
    },
    {
      id: "TRAC-004",
      brand: "VST Zetor",
      model: "4511 4WD",
      hp: 47,
      ptoHp: 40.5,
      engineCc: 2979,
      cylinders: 3,
      liftCapacityKg: 1800,
      transmission: "Fully Constant Mesh Helical (8 F + 2 R)",
      drive: "4WD",
      price: 835000,
      dealerPurchaseCost: 750000,
      stockCount: 0,
      bestSoil: ["Heavy Black", "Clay", "Wet Puddling", "Loam"],
      recommendedAcresMin: 10,
      recommendedAcresMax: 35,
      compatibleImplements: ["Heavy Rotavator (6 ft)", "Laser Leveller", "Puddler", "MB Plough", "Heavy Trolley (10 Ton)"],
      popularCrops: ["Sugarcane", "Paddy", "Wheat", "Cotton", "Potato"],
      chassisList: [],
      warranty: "6 Years / 6000 Hours Warranty",
      status: "Available to Order"
    },
    {
      id: "TRAC-005",
      brand: "VST Zetor",
      model: "5011 2WD",
      hp: 50,
      ptoHp: 43.5,
      engineCc: 3220,
      cylinders: 3,
      liftCapacityKg: 2000,
      transmission: "Helical Constant Mesh (8 F + 2 R / Dual Clutch)",
      drive: "2WD",
      price: 820000,
      dealerPurchaseCost: 740000,
      stockCount: 0,
      bestSoil: ["Heavy Black", "Hard Soil", "Loam", "Medium"],
      recommendedAcresMin: 12,
      recommendedAcresMax: 45,
      compatibleImplements: ["Rotavator (6-7 ft)", "Cultivator (11-13 Tyne)", "MB Plough (2 Bottom Heavy)", "Trolley (10-12 Ton)", "Laser Leveller"],
      popularCrops: ["Sugarcane", "Wheat", "Paddy", "Cotton", "Potato"],
      chassisList: [],
      warranty: "6 Years / 6000 Hours Warranty",
      status: "Available to Order"
    },
    {
      id: "TRAC-006",
      brand: "VST Zetor",
      model: "5011 4WD",
      hp: 50,
      ptoHp: 43.8,
      engineCc: 3220,
      cylinders: 3,
      liftCapacityKg: 2000,
      transmission: "Helical Constant Mesh (8 F + 2 R / 16 F + 4 R Option)",
      drive: "4WD",
      price: 885000,
      dealerPurchaseCost: 798000,
      stockCount: 0,
      bestSoil: ["Heavy Black Soil", "Deep Clay", "Challenging Terrains", "Wet Puddling"],
      recommendedAcresMin: 15,
      recommendedAcresMax: 55,
      compatibleImplements: ["Heavy Rotavator (7 ft)", "Square Baler", "Heavy MB Plough (3 Bottom)", "Laser Leveller", "Heavy Haulage Trolley (12-14 Ton)"],
      popularCrops: ["Sugarcane", "Wheat", "Paddy", "Cotton", "Commercial Haulage"],
      chassisList: [],
      warranty: "6 Years / 6000 Hours Warranty",
      status: "Available to Order"
    }
  ];

  // Clean Slate - Zero Seed Data (100% Dynamic)
  const DEFAULT_LEADS = [];
  const DEFAULT_EXPENSES = [];
  const DEFAULT_CASH_TRANSACTIONS = [];
  const DEFAULT_DEMOS = [];
  const DEFAULT_QUOTES = [];

  const DEFAULT_BILLS = [];

  // --- 2. VECTOR ICONS ---
  const icons = {
    tractor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m10 11 11 .9a1 1 0 0 1 .8 1.1l-.66 5a1 1 0 0 1-1 .9H16"/><path d="M16 18h-5"/><path d="M7 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/><path d="M19 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/><path d="M7 11V4h7v7"/></svg>`,
    users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    rupee: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3a4 4 0 0 0 0-8"/></svg>`,
    quote: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>`,
    exchange: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>`,
    expense: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    bank: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>`,
    calculator: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/></svg>`,
    map: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>`,
    bot: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>`,
    flame: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
    phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
    print: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>`,
    sparkles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`
  };

  function renderIcon(name, extraClass = '') {
    const svg = icons[name] || icons.sparkles;
    const cls = extraClass ? ` class="${extraClass}"` : '';
    return svg.replace('<svg', `<svg width="18" height="18"${cls}`);
  }

  // --- ON-SCREEN TOAST NOTIFICATION SYSTEM ---
  function showToast(message, type = 'success', title = '') {
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

  // Intercept window.alert to automatically route through on-screen toast
  window.alert = function(msg) {
    showToast(String(msg), 'info', 'Showroom Notice');
  };
  window.showToast = showToast;

  // --- 3. STORAGE & STATE MANAGEMENT ---
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' || 
     window.location.hostname.startsWith('192.168.') || 
     window.location.hostname.endsWith('.local'));

  function isCloudSyncEnabled() {
    if (typeof localStorage !== 'undefined') {
      const mode = localStorage.getItem('MDE_DATA_SOURCE_MODE');
      if (mode === 'deployed') return true;
      if (mode === 'local') return false;
      if (localStorage.getItem('mde_override_cloud_sync') === 'true') return true;
      if (localStorage.getItem('mde_override_cloud_sync') === 'false') return false;
    }
    if (typeof window !== 'undefined' && window.__ENABLE_CLOUD_SYNC__ !== undefined) {
      return !!window.__ENABLE_CLOUD_SYNC__;
    }
    if (import.meta.env?.VITE_ENABLE_CLOUD_SYNC === 'true') return true;
    if (import.meta.env?.VITE_ENABLE_CLOUD_SYNC === 'false') return false;
    // Default: completely isolate localhost from deployed production data
    if (isLocalhost || import.meta.env?.DEV) return false;
    return true;
  }

  const getPrefix = () => isCloudSyncEnabled() ? 'mde_' : 'mde_local_dev_';

  const STORAGE_KEYS = {
    get TRACTORS() { return `${getPrefix()}tractors_prod_v3`; },
    get LEADS() { return `${getPrefix()}leads_prod_v2`; },
    get EXPENSES() { return `${getPrefix()}expenses_prod_v2`; },
    get CASH_TXNS() { return `${getPrefix()}cash_txns_prod_v2`; },
    get DEMOS() { return `${getPrefix()}demos_prod_v2`; },
    get QUOTES() { return `${getPrefix()}quotes_prod_v2`; },
    get BILLS() { return `${getPrefix()}bills_prod_v2`; },
    get SETTINGS() { return `${getPrefix()}settings_prod_v3`; }
  };

  function formatToDMY(dateInput) {
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

  function toIsoDate(dmyOrIso) {
    if (!dmyOrIso) return new Date().toISOString().split('T')[0];
    const str = String(dmyOrIso).trim();
    if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(str)) {
      const [d, m, y] = str.split(/[-/]/);
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    return str.split('T')[0];
  }

  function formatAdaptiveRupee(val) {
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

  function autoDetectExpenseCategory(text, currentCategory = '') {
    if (!text || typeof text !== 'string') return currentCategory || 'Miscellaneous';
    const str = text.toLowerCase().trim();
    if (!str) return currentCategory || 'Miscellaneous';

    // 1. Customer Tea / Hospitality / Snacks
    if (/\b(tea|chai|chai-paani|chaipani|chay|coffee|nashta|nasta|breakfast|lunch|dinner|food|snack|snacks|samosa|samosas|biscuit|biscuits|mithai|sweets|sweet|water|bisleri|cold\s*drink|colddrink|hospitality|refreshment|refreshments|guest)\b/i.test(str)) {
      return 'Customer & Tea/Food';
    }

    // 2. Repairs, Servicing & PDI (specifically pump service, tractor repair, mobil oil, lathe, etc.)
    if (/\b(pump\s*service|diesel\s*pump\s*service|fip\s*service|fip|nozzle|injector|service|servicing|repair|repairs|pdi|mechanic|mistry|mistri|teflon|grease|greasing|mobil|engine\s*oil|oil\s*change|filter|diesel\s*filter|air\s*filter|spare|spares|spare\s*parts|parts|battery|tyre|tire|tubeless|puncture|washing|car\s*wash|tractor\s*wash|welding|lathe|alignment|clutch|brake|hydraulic|chassis\s*repair)\b/i.test(str)) {
      return 'Repairs & PDI';
    }

    // 3. Fuel & Diesel (petrol pump fuel purchase, diesel for tractor delivery / van)
    if (/\b(diesel|petrol|fuel|cng|petrol\s*pump|fuel\s*station|hpcl|bpcl|ioc|iocl|tank\s*full|refuel)\b/i.test(str)) {
      return 'Fuel';
    }

    // 4. Inward Freight / Transport
    if (/\b(transport|transporter|logistics|freight|bhada|kiraya\s*gaadi|trolley|carrier|truck|lorry|unloading|loading|crane|recovery|towing|toll|challan|rto)\b/i.test(str)) {
      return 'Transport';
    }

    // 5. Staff Salaries & Advances
    if (/\b(salary|salaries|advance|staff|worker|workers|mechanic\s*salary|driver|wages|vetan|tankha|tanha|incentive|bonus)\b/i.test(str)) {
      return 'Salaries';
    }

    // 6. Showroom & Yard Rent
    if (/\b(showroom\s*rent|yard\s*rent|godown\s*rent|rent|kiraya|lease|mandi\s*yard)\b/i.test(str)) {
      return 'Showroom Rent';
    }

    // 7. Electricity & Utilities
    if (/\b(electricity|bijli|power|uppcl|light\s*bill|electric\s*bill|utility|utilities|water\s*bill)\b/i.test(str)) {
      return 'Electricity';
    }

    // 8. Advertising & Marketing
    if (/\b(ad|ads|advertising|banner|banners|flex|hoarding|poster|posters|wall\s*painting|marketing|pamphlet|pamphlets|leaflet|facebook|instagram|promotion)\b/i.test(str)) {
      return 'Advertising';
    }

    return currentCategory || 'Miscellaneous';
  }

  class DealershipStore {
    constructor() {
      this.subscribers = new Set();
      this.init();
      if (isCloudSyncEnabled()) {
        this.syncWithSupabase();
        this.setupRealtime();
      } else {
        console.log('🔒 [TractorOS Bundle] Isolated Localhost Mode: Cloud sync disabled to keep local dev separated from deployed data.');
      }
    }

    init() {
      try {
        const isProtectedKey = (k) => 
          k.includes('_prod_v2') || 
          k.includes('_prod_v3') || 
          k.startsWith('mde_local_dev_') || 
          k === 'mde_override_cloud_sync' ||
          k.startsWith('mde_seed_') ||
          k.startsWith('mde_last_');

        const oldKeys = Object.keys(localStorage).filter(k => k.startsWith('mde_') && !isProtectedKey(k));
        for (const k of oldKeys) {
          localStorage.removeItem(k);
        }
        // Purge previous v2 tractors to ensure instant upgrade to VST Zetor catalog
        if (localStorage.getItem('mde_tractors_prod_v2')) {
          localStorage.removeItem('mde_tractors_prod_v2');
        }
      } catch (e) {
        console.warn("Storage cleanup notice", e);
      }

      try {
        const storedTractors = localStorage.getItem(STORAGE_KEYS.TRACTORS);
        // Auto-upgrade if empty or storing non-VST models
        if (!storedTractors || !storedTractors.includes('VST Zetor')) {
          localStorage.setItem(STORAGE_KEYS.TRACTORS, JSON.stringify(DEFAULT_TRACTORS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.LEADS)) {
          localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(DEFAULT_LEADS));
        } else {
          try {
            const storedLeads = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS) || '[]');
            let changed = false;
            storedLeads.forEach(l => {
              if (l.village === 'Local Area') { l.village = ''; changed = true; }
              if (l.phone === '-') { l.phone = ''; changed = true; }
              if (l.landAcres === 5) { l.landAcres = null; changed = true; }
              if (l.crops && l.crops.length === 2 && l.crops[0] === 'Wheat' && l.crops[1] === 'Paddy') { l.crops = []; changed = true; }
              if (l.soilType === 'Medium') { l.soilType = ''; changed = true; }
              if (l.currentTractor === 'None (Rents)' || l.currentTractor === 'None') { l.currentTractor = ''; changed = true; }
              if (l.budgetMax === 750000) { l.budgetMax = null; changed = true; }
              if (!l.userSetScore) {
                l.buyingScore = null;
                changed = true;
              }
              if (l.nextAction && (l.nextAction.includes('Add to seasonal WhatsApp') || l.nextAction.includes('Send WhatsApp implement video'))) {
                l.nextAction = '';
                changed = true;
              }
            });
            if (changed) {
              localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(storedLeads));
            }
          } catch (err) {
            console.warn("Lead sanitize error", err);
          }
        }
        // --- Continuous purge: permanently eliminate seeded/fake data ---
        try {
          const expStored = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
          const isSeedExp = (e) => {
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
          const cleanExp = expStored.filter(e => !isSeedExp(e));
          let expCategoryUpdated = false;
          const autoAllocated = cleanExp.map(e => {
            const text = `${e.notes || ''} ${e.paidTo || ''} ${e.description || ''}`;
            const autoCat = autoDetectExpenseCategory(text, e.category);
            if (autoCat && autoCat !== e.category) {
              expCategoryUpdated = true;
              return { ...e, category: autoCat };
            }
            return e;
          });
          if (cleanExp.length !== expStored.length || expCategoryUpdated) {
            localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(autoAllocated));
          }
          const cashStored = JSON.parse(localStorage.getItem(STORAGE_KEYS.CASH_TXNS) || '[]');
          const cleanCash = cashStored.filter(t => !t.ref || (!/^EXP-10[1-9]$/.test(t.ref) && t.ref !== 'EXP-001' && t.ref !== 'EXP-002'));
          if (cleanCash.length !== cashStored.length) {
            localStorage.setItem(STORAGE_KEYS.CASH_TXNS, JSON.stringify(cleanCash));
          }
          if (typeof supabase !== 'undefined' && supabase) {
            supabase.from('expenses').delete().in('id', ['EXP-001', 'EXP-002']).then(() => {});
          }
        } catch (e) {
          console.warn("Seed purge error:", e);
        }
        if (!localStorage.getItem('mde_seed_purge_v1')) {
          localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify([]));
          localStorage.setItem(STORAGE_KEYS.CASH_TXNS, JSON.stringify([]));
          localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
          localStorage.setItem(STORAGE_KEYS.DEMOS, JSON.stringify([]));
          localStorage.setItem('mde_seed_purge_v1', 'done');
        }
        if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
          localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(DEFAULT_EXPENSES));
        }
        if (!localStorage.getItem(STORAGE_KEYS.CASH_TXNS)) {
          localStorage.setItem(STORAGE_KEYS.CASH_TXNS, JSON.stringify(DEFAULT_CASH_TRANSACTIONS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.DEMOS)) {
          localStorage.setItem(STORAGE_KEYS.DEMOS, JSON.stringify(DEFAULT_DEMOS));
        }
        if (!localStorage.getItem(STORAGE_KEYS.QUOTES)) {
          localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(DEFAULT_QUOTES));
        }
        const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (!storedSettings || !storedSettings.includes('VST Zetor')) {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(SHOWROOM_INFO));
        }
      } catch (e) {
        console.warn("Storage fallback to memory mode", e);
      }
    }

    async syncWithSupabase() {
      if (!isCloudSyncEnabled()) return;
      try {
        if (typeof supabaseApi === 'undefined' || !supabaseApi) return;
        const [bills, leads, tractors, expenses, cashTxns, demos, quotes, settings] = await Promise.all([
          supabaseApi.bills.getAll(),
          supabaseApi.leads.getAll(),
          supabaseApi.tractors.getAll(),
          supabaseApi.expenses.getAll(),
          supabaseApi.cashflow.getAll(),
          supabaseApi.demos.getAll(),
          supabaseApi.quotes.getAll(),
          supabaseApi.settings.get()
        ]);

        let updated = false;
        if (bills && bills.length > 0) {
          localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
          updated = true;
        } else {
          const localBills = this.getBills();
          if (localBills && localBills.length > 0) {
            for (const b of localBills) {
              await supabaseApi.bills.save(b).catch(e => console.warn(e));
            }
          }
        }

        if (leads && leads.length > 0) {
          localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
          updated = true;
        }

        if (tractors && tractors.length > 0) {
          localStorage.setItem(STORAGE_KEYS.TRACTORS, JSON.stringify(tractors));
          updated = true;
        }

        if (expenses) {
          const isSeed = (e) => {
            if (!e) return false;
            if (typeof e.id === 'string' && (e.id === 'EXP-001' || e.id === 'EXP-002' || /^EXP-10[1-9]$/.test(e.id))) return true;
            const text = `${e.notes || ''} ${e.paidTo || ''} ${e.description || ''} ${e.chassisTag || ''}`;
            return text.includes('Malur to Gorakhpur') ||
                   text.includes('canopy installation & engine oil') ||
                   text.includes('Shree Balaji Logistics') ||
                   text.includes('CH-4511-4WD-1102') ||
                   text.includes('CH-4211-8901');
          };
          const cleanExpenses = expenses.filter(e => !isSeed(e));
          localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(cleanExpenses));
          updated = true;
        }

        if (cashTxns && cashTxns.length > 0) {
          localStorage.setItem(STORAGE_KEYS.CASH_TXNS, JSON.stringify(cashTxns));
          updated = true;
        }

        if (demos && demos.length > 0) {
          localStorage.setItem(STORAGE_KEYS.DEMOS, JSON.stringify(demos));
          updated = true;
        }

        if (quotes && quotes.length > 0) {
          localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
          updated = true;
        }

        if (settings) {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
          updated = true;
        }

        if (updated) {
          this.notify();
        }
      } catch (err) {
        console.warn('Sync with Supabase notice:', err);
      }
    }

    setupRealtime() {
      if (!isCloudSyncEnabled()) return;
      try {
        if (typeof supabase === 'undefined' || !supabase || typeof supabase.channel !== 'function') return;
        supabase.channel('supabase-bundle-realtime')
          .on('postgres_changes', { event: '*', schema: 'public' }, () => {
            this.syncWithSupabase();
          })
          .subscribe();
      } catch (e) {
        console.warn('Realtime subscription notice:', e);
      }
    }

    subscribe(cb) {
      this.subscribers.add(cb);
      return () => this.subscribers.delete(cb);
    }

    notify() {
      for (const cb of this.subscribers) {
        try { cb(); } catch (e) { console.error(e); }
      }
    }

    getTractors() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRACTORS)) || DEFAULT_TRACTORS; } catch { return DEFAULT_TRACTORS; }
    }
    getLeads() {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS)) || DEFAULT_LEADS;
        const today = new Date().toISOString().split('T')[0];
        let needsSave = false;
        const leads = stored.map(lead => {
          const leadDate = lead.date || lead.createdAt || lead.lastContactDate || today;
          if (!lead.date || !lead.createdAt) {
            needsSave = true;
            return {
              ...lead,
              date: lead.date || leadDate,
              createdAt: lead.createdAt || leadDate
            };
          }
          return lead;
        });
        if (needsSave) {
          localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
        }
        return leads;
      } catch {
        return DEFAULT_LEADS;
      }
    }
    getExpenses() {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES)) || [];
        const isDemo = (e) => {
          if (!e) return false;
          if (typeof e.id === 'string' && /^EXP-10[1-9]$/.test(e.id)) return true;
          if (typeof e.id === 'string' && (e.id === 'EXP-001' || e.id === 'EXP-002')) return true;
          const text = `${e.notes || ''} ${e.paidTo || ''} ${e.description || ''}`;
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
                 text.includes('canopy installation & engine oil');
        };

        const cleaned = stored.filter(e => !isDemo(e));
        let categoryUpdated = false;
        const autoAllocated = cleaned.map(e => {
          const text = `${e.notes || ''} ${e.paidTo || ''} ${e.description || ''}`;
          const autoCat = autoDetectExpenseCategory(text, e.category);
          if (autoCat && autoCat !== e.category) {
            categoryUpdated = true;
            return { ...e, category: autoCat };
          }
          return e;
        });

        if (cleaned.length !== stored.length || categoryUpdated) {
          localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(autoAllocated));
        }

        return autoAllocated;
      } catch {
        return DEFAULT_EXPENSES;
      }
    }
    getCashTransactions() {
      try {
        let stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.CASH_TXNS)) || [];
        // 1. Filter out demo/seed references
        stored = stored.filter(t => !t.ref || (!/^EXP-10[1-9]$/.test(t.ref) && t.ref !== 'EXP-001' && t.ref !== 'EXP-002'));

        // 2. Fetch approved showroom expenses
        const approvedExpenses = this.getExpenses().filter(e => e.status === 'Approved');
        const approvedExpIds = new Set(approvedExpenses.map(e => e.id));

        // 3. Prune orphaned expense transactions
        stored = stored.filter(t => !t.ref || !t.ref.startsWith('EXP-') || approvedExpIds.has(t.ref));

        // 4. Ensure every approved expense is synced as a Cash/Bank OUT movement
        approvedExpenses.forEach(exp => {
          const party = exp.paidTo || 'Showroom Vendor';
          const mode = exp.paymentMode || 'Cash';
          const amt = Number(exp.amount || 0);
          const existing = stored.find(t => t.ref === exp.id);
          if (existing) {
            existing.amount = amt;
            existing.date = exp.date || existing.date;
            existing.category = exp.category || existing.category;
            existing.party = party;
            existing.partyName = party;
            existing.mode = mode;
            existing.paymentMode = mode;
            existing.type = 'OUT';
            existing.notes = exp.notes || exp.description || existing.notes || '';
          } else {
            stored.unshift({
              id: `TXN-${exp.id}`,
              date: exp.date || new Date().toISOString().split('T')[0],
              type: 'OUT',
              category: exp.category || 'Operational Expense',
              amount: amt,
              party: party,
              partyName: party,
              mode: mode,
              paymentMode: mode,
              ref: exp.id,
              notes: exp.notes || exp.description || ''
            });
          }
        });

        // 5. Fetch bills & ensure all paid bills are synced as Cash/Bank IN movements
        const bills = this.getBills();
        const validBillRefs = new Set();

        bills.forEach(b => {
          const total = Number(b.totalRupees || 0);
          let paid = total;
          if (b.paymentStatus === 'Due') {
            paid = 0;
          } else if (b.paymentStatus === 'Partial' && b.paidAmount !== undefined) {
            paid = Math.min(total, Math.max(0, Number(b.paidAmount) || 0));
          } else if (b.paidAmount !== undefined && b.paidAmount !== null && b.paidAmount !== '') {
            paid = Math.min(total, Math.max(0, Number(b.paidAmount) || 0));
          }
          if (b.paymentStatus === 'Paid' && paid === 0 && total > 0) {
            paid = total;
          }

          const billRef = b.billNumber ? `BILL-${b.billNumber}` : (b.id ? String(b.id) : '');
          if (billRef) validBillRefs.add(billRef);
          if (b.id) validBillRefs.add(String(b.id));

          const existing = stored.find(t => (billRef && t.ref === billRef) || (b.id && (t.ref === b.id || t.billId === b.id)));

          if (paid > 0) {
            const party = b.customerName || 'Cash Customer';
            const mode = b.paymentMode || 'Cash';
            const billNameStr = b.billName ? ` (${b.billName})` : '';
            const notes = `Official Bill #${b.billNumber || ''}${billNameStr} payment collection`;

            if (existing) {
              existing.amount = paid;
              existing.date = b.date || existing.date;
              existing.category = 'Customer Bill Collection';
              existing.party = party;
              existing.partyName = party;
              existing.mode = mode;
              existing.paymentMode = mode;
              existing.type = 'IN';
              existing.notes = notes;
              existing.ref = billRef || existing.ref;
            } else {
              stored.unshift({
                id: `TXN-BILL-${b.billNumber || b.id || Date.now().toString().slice(-4)}`,
                date: b.date || new Date().toISOString().split('T')[0],
                type: 'IN',
                category: 'Customer Bill Collection',
                amount: paid,
                party: party,
                partyName: party,
                mode: mode,
                paymentMode: mode,
                ref: billRef,
                billId: b.id,
                notes: notes
              });
            }
          } else if (existing) {
            stored = stored.filter(t => t !== existing);
          }
        });

        // 6. Prune orphaned bill transactions if the bill was deleted
        stored = stored.filter(t => !t.ref || !t.ref.startsWith('BILL-') || validBillRefs.has(t.ref));

        // 7. Deduplicate stored: ensure no duplicate IDs or references exist
        const seenIds = new Set();
        const seenRefs = new Set();
        stored = stored.filter(t => {
          if (t.id && seenIds.has(t.id)) return false;
          if (t.ref && seenRefs.has(t.ref)) return false;
          if (t.id) seenIds.add(t.id);
          if (t.ref) seenRefs.add(t.ref);
          return true;
        });

        // 8. Normalize all entries
        stored.forEach(t => {
          t.party = t.party || t.partyName || 'Showroom Party';
          t.partyName = t.partyName || t.party || 'Showroom Party';
          t.mode = t.mode || t.paymentMode || 'Cash';
          t.paymentMode = t.paymentMode || t.mode || 'Cash';
          t.amount = Number(t.amount || 0);
        });

        stored.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

        localStorage.setItem(STORAGE_KEYS.CASH_TXNS, JSON.stringify(stored));
        return stored;
      } catch {
        return DEFAULT_CASH_TRANSACTIONS;
      }
    }
    getDemos() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.DEMOS)) || DEFAULT_DEMOS; } catch { return DEFAULT_DEMOS; }
    }
    getQuotes() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.QUOTES)) || DEFAULT_QUOTES; } catch { return DEFAULT_QUOTES; }
    }
    getBills() {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.BILLS));
        if (stored && Array.isArray(stored)) {
          const cleaned = stored.filter(b => b.id !== 'BILL-086' && b.customerName !== 'किसान एग्रो सर्विस');
          if (cleaned.length !== stored.length) {
            localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(cleaned));
          }
          return cleaned.map(b => ({ ...b, date: formatToDMY(b.date) }));
        }
        return [];
      } catch { return []; }
    }
    getSettings() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || SHOWROOM_INFO; } catch { return SHOWROOM_INFO; }
    }

    addLead(leadData) {
      const leads = this.getLeads();
      const today = new Date().toISOString().split('T')[0];
      const newLead = {
        id: leadData.id || `LEAD-${100 + leads.length + 1}`,
        date: leadData.date || today,
        createdAt: leadData.createdAt || today,
        lastContactDate: leadData.lastContactDate || today,
        ...leadData
      };
      leads.unshift(newLead);
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
      this.notify();
      if (typeof supabaseApi !== 'undefined' && supabaseApi?.leads) {
        supabaseApi.leads.create(newLead).catch(e => console.warn('Supabase lead create failed:', e));
      }
      return newLead;
    }

    updateLead(id, updatedData) {
      const leads = this.getLeads();
      const index = leads.findIndex(l => l.id === id);
      if (index !== -1) {
        leads[index] = { ...leads[index], ...updatedData };
        localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
        this.notify();
        if (typeof supabaseApi !== 'undefined' && supabaseApi?.leads) {
          supabaseApi.leads.update(id, updatedData).catch(e => console.warn('Supabase lead update failed:', e));
        }
        return leads[index];
      }
      return null;
    }

    deleteLead(id) {
      const leads = this.getLeads().filter(l => l.id !== id);
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
      this.notify();
      if (typeof supabaseApi !== 'undefined' && supabaseApi?.leads) {
        supabaseApi.leads.delete(id).catch(e => console.warn('Supabase lead delete failed:', e));
      }
    }

    addExpense(expenseData) {
      const expenses = this.getExpenses();
      const isAutoApproved = Number(expenseData.amount) < 5000;
      const combinedText = `${expenseData.notes || ''} ${expenseData.paidTo || ''} ${expenseData.description || ''}`;
      const allocatedCat = autoDetectExpenseCategory(combinedText, expenseData.category || 'Miscellaneous');

      const newExpense = {
        id: expenseData.id || `EXP-${800 + expenses.length + 1}`,
        date: expenseData.date || new Date().toISOString().split('T')[0],
        status: isAutoApproved ? 'Approved' : 'Pending Approval',
        approvedBy: isAutoApproved ? 'System (< ₹5,000)' : null,
        ...expenseData,
        category: allocatedCat
      };
      expenses.unshift(newExpense);
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));

      if (isAutoApproved) {
        this.getCashTransactions();
      }
      this.notify();
      if (typeof supabaseApi !== 'undefined' && supabaseApi?.expenses) {
        supabaseApi.expenses.create(newExpense).catch(e => console.warn('Supabase expense create failed:', e));
      }
      return newExpense;
    }

    approveExpense(expenseId, approverName = 'Showroom Director') {
      const expenses = this.getExpenses();
      const item = expenses.find(e => e.id === expenseId);
      if (item && item.status !== 'Approved') {
        item.status = 'Approved';
        item.approvedBy = approverName;
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
        this.getCashTransactions();
        this.notify();
        if (typeof supabaseApi !== 'undefined' && supabaseApi?.expenses) {
          supabaseApi.expenses.create(item).catch(e => console.warn('Supabase expense approve failed:', e));
        }
      }
    }

    deleteExpense(id) {
      const expenses = this.getExpenses().filter(e => e.id !== id);
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));

      // Synchronously purge matching cash transaction
      try {
        const rawCash = JSON.parse(localStorage.getItem(STORAGE_KEYS.CASH_TXNS)) || [];
        const cleanCash = rawCash.filter(t => t.ref !== id);
        localStorage.setItem(STORAGE_KEYS.CASH_TXNS, JSON.stringify(cleanCash));
      } catch {}

      this.notify();
      if (typeof supabaseApi !== 'undefined') {
        if (supabaseApi.expenses) supabaseApi.expenses.delete(id).catch(e => console.warn('Supabase expense delete failed:', e));
        if (supabaseApi.cashflow?.deleteByRef) supabaseApi.cashflow.deleteByRef(id).catch(e => console.warn('Supabase cashflow delete failed:', e));
      }
    }

    addCashTransaction(txnData) {
      const txns = this.getCashTransactions();
      const newId = txnData.id || `TXN-${300 + txns.length + 1}`;
      const newTxn = {
        id: newId,
        date: txnData.date || new Date().toISOString().split('T')[0],
        type: txnData.type || 'IN',
        category: txnData.category || 'Operational',
        amount: Number(txnData.amount || 0),
        party: txnData.party || txnData.partyName || 'Showroom Party',
        partyName: txnData.partyName || txnData.party || 'Showroom Party',
        mode: txnData.mode || txnData.paymentMode || 'Cash',
        paymentMode: txnData.paymentMode || txnData.mode || 'Cash',
        ref: txnData.ref || null,
        notes: txnData.notes || ''
      };
      const existingIdx = txns.findIndex(t => (newTxn.ref && t.ref === newTxn.ref) || t.id === newTxn.id);
      if (existingIdx >= 0) {
        txns[existingIdx] = { ...txns[existingIdx], ...newTxn };
      } else {
        txns.unshift(newTxn);
      }
      localStorage.setItem(STORAGE_KEYS.CASH_TXNS, JSON.stringify(txns));
      this.notify();
      if (typeof supabaseApi !== 'undefined' && supabaseApi?.cashflow) {
        supabaseApi.cashflow.create(newTxn).catch(e => console.warn('Supabase cashflow create failed:', e));
      }
      return newTxn;
    }

    addDemo(demoData) {
      const demos = this.getDemos();
      const newId = demoData.id || `DEMO-${String(demos.length + 1).padStart(2, '0')}`;
      const newDemo = {
        id: newId,
        status: 'Scheduled',
        ...demoData
      };
      demos.unshift(newDemo);
      localStorage.setItem(STORAGE_KEYS.DEMOS, JSON.stringify(demos));
      this.notify();
      if (typeof supabaseApi !== 'undefined' && supabaseApi?.demos) {
        supabaseApi.demos.create(newDemo).catch(e => console.warn('Supabase demo create failed:', e));
      }
      return newDemo;
    }

    updateDemo(id, fields) {
      const demos = this.getDemos();
      const idx = demos.findIndex(d => d.id === id);
      if (idx !== -1) {
        demos[idx] = { ...demos[idx], ...fields };
        localStorage.setItem(STORAGE_KEYS.DEMOS, JSON.stringify(demos));
        this.notify();
        if (typeof supabaseApi !== 'undefined' && supabaseApi?.demos) {
          supabaseApi.demos.update(id, fields).catch(e => console.warn('Supabase demo update failed:', e));
        }
      }
    }

    addQuote(quoteData) {
      const quotes = this.getQuotes();
      const quoteNumber = quoteData.quoteNumber || `MDE/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/Q-${100 + quotes.length + 1}`;
      const newQuote = {
        quoteNumber,
        date: new Date().toISOString().split('T')[0],
        ...quoteData
      };
      quotes.unshift(newQuote);
      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
      this.notify();
      if (typeof supabaseApi !== 'undefined' && supabaseApi?.quotes) {
        supabaseApi.quotes.save(newQuote).catch(e => console.warn('Supabase quote save failed:', e));
      }
      return newQuote;
    }

    getNextBillNumber() {
      const bills = this.getBills();
      let maxNo = 86; // Based on authentic Maa Durga Diesel paper bill book baseline (#86)
      try {
        const storedSeq = parseInt(localStorage.getItem('mde_last_bill_seq'), 10);
        if (!isNaN(storedSeq) && storedSeq > maxNo) {
          maxNo = storedSeq;
        }
      } catch {}

      if (bills && Array.isArray(bills) && bills.length > 0) {
        bills.forEach(b => {
          if (!b) return;
          const raw = String(b.billNumber || '').trim();
          const matches = raw.match(/\d+/g);
          if (matches && matches.length > 0) {
            const val = parseInt(matches[matches.length - 1], 10);
            if (!isNaN(val) && val > maxNo) {
              maxNo = val;
            }
          }
        });
      }
      return String(maxNo + 1);
    }

    ensureUniqueBillNumber(requestedNumber, excludeBillId = null) {
      const bills = this.getBills();
      let num = String(requestedNumber || '').trim();
      if (!num) {
        num = this.getNextBillNumber();
      }

      const isDuplicate = (candidate) => {
        return bills.some(b => {
          if (!b) return false;
          if (excludeBillId && b.id === excludeBillId) return false;
          return String(b.billNumber || '').trim().toLowerCase() === candidate.toLowerCase();
        });
      };

      if (!isDuplicate(num)) {
        return num;
      }

      // Advance sequence until strictly unique
      const matches = num.match(/^(.*?)(\d+)$/);
      if (matches) {
        const prefix = matches[1];
        let baseInt = parseInt(matches[2], 10);
        let candidate = num;
        while (isDuplicate(candidate)) {
          baseInt++;
          candidate = prefix + baseInt;
        }
        return candidate;
      } else {
        let counter = 1;
        let candidate = `${num}-${counter}`;
        while (isDuplicate(candidate)) {
          counter++;
          candidate = `${num}-${counter}`;
        }
        return candidate;
      }
    }

    addBill(billData) {
      const bills = this.getBills();
      const billId = billData.id || `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      
      // Ensure every single bill has a strictly unique bill number
      const requestedNo = (billData.billNumber && String(billData.billNumber).trim() !== '')
        ? String(billData.billNumber).trim()
        : this.getNextBillNumber();
      const uniqueBillNumber = this.ensureUniqueBillNumber(requestedNo, billData.id || null);

      // Optional unique bill name / reference title
      const billName = billData.billName ? String(billData.billName).trim() : '';

      const newBill = {
        id: billId,
        billNumber: String(uniqueBillNumber),
        billName: billName,
        date: formatToDMY(billData.date || new Date()),
        customerName: billData.customerName || 'मेसर्स ग्राहक',
        address: billData.address || '',
        phone: billData.phone || '',
        vehicle: billData.vehicle || '',
        items: billData.items || [],
        totalRupees: Number(billData.totalRupees || 0),
        totalPaise: Number(billData.totalPaise || 0),
        amountWords: billData.amountWords || '',
        ...billData,
        id: billId,
        billNumber: String(uniqueBillNumber),
        billName: billName
      };
      newBill.date = formatToDMY(newBill.date);

      // Advance persistent sequence counter if numeric
      const matches = String(uniqueBillNumber).match(/\d+/g);
      if (matches && matches.length > 0) {
        const numVal = parseInt(matches[matches.length - 1], 10);
        if (!isNaN(numVal)) {
          try {
            const prevSeq = parseInt(localStorage.getItem('mde_last_bill_seq'), 10) || 86;
            if (numVal > prevSeq) {
              localStorage.setItem('mde_last_bill_seq', String(numVal));
            }
          } catch {}
        }
      }

      const existingIndex = bills.findIndex(b => b.id === billId);
      if (existingIndex >= 0) {
        bills[existingIndex] = { ...bills[existingIndex], ...newBill };
      } else {
        bills.unshift(newBill);
      }
      localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
      this.getCashTransactions();
      this.notify();
      if (typeof supabaseApi !== 'undefined' && supabaseApi?.bills) {
        supabaseApi.bills.save(newBill).catch(e => console.warn('Supabase bill save failed:', e));
      }
      return newBill;
    }

    deleteBill(billId) {
      if (!billId) return;
      const target = String(billId).trim();
      let bills = this.getBills();
      bills = bills.filter(b => {
        if (!b) return false;
        const bId = b.id ? String(b.id).trim() : '';
        const bNo = (b.billNumber !== undefined && b.billNumber !== null) ? String(b.billNumber).trim() : '';
        return bId !== target && bNo !== target;
      });
      localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
      this.getCashTransactions();
      this.notify();
      if (typeof supabaseApi !== 'undefined' && supabaseApi?.bills) {
        supabaseApi.bills.delete(target).catch(e => console.warn('Supabase bill delete failed:', e));
      }
    }

    addTractor(tractorData) {
      const tractors = this.getTractors();
      const newId = tractorData.id || `TRAC-${String(tractors.length + 1).padStart(3, '0')}`;
      const newTractor = {
        id: newId,
        status: Number(tractorData.stockCount) > 0 ? 'In Stock' : 'Available to Order',
        chassisList: tractorData.chassisList || [],
        ...tractorData
      };
      tractors.push(newTractor);
      localStorage.setItem(STORAGE_KEYS.TRACTORS, JSON.stringify(tractors));
      this.notify();
      if (typeof supabaseApi !== 'undefined' && supabaseApi?.tractors) {
        supabaseApi.tractors.add(newTractor).catch(e => console.warn('Supabase tractor add failed:', e));
      }
      return newTractor;
    }

    updateTractor(tractorId, updatedFields) {
      const tractors = this.getTractors();
      const index = tractors.findIndex(t => t.id === tractorId);
      if (index !== -1) {
        tractors[index] = { ...tractors[index], ...updatedFields };
        if (updatedFields.stockCount !== undefined) {
          tractors[index].status = Number(tractors[index].stockCount) > 0 ? 'In Stock' : 'Available to Order';
        }
        localStorage.setItem(STORAGE_KEYS.TRACTORS, JSON.stringify(tractors));
        this.notify();
        if (typeof supabaseApi !== 'undefined' && supabaseApi?.tractors) {
          supabaseApi.tractors.update(tractorId, updatedFields).catch(e => console.warn('Supabase tractor update failed:', e));
        }
        return tractors[index];
      }
      return null;
    }

    updateTractorStock(tractorId, deltaCount, newChassis = null) {
      const tractors = this.getTractors();
      const t = tractors.find(tr => tr.id === tractorId);
      if (t) {
        t.stockCount = Math.max(0, (Number(t.stockCount) || 0) + deltaCount);
        t.status = t.stockCount > 0 ? 'In Stock' : 'Available to Order';
        if (newChassis) {
          t.chassisList = t.chassisList || [];
          t.chassisList.push(newChassis);
        }
        localStorage.setItem(STORAGE_KEYS.TRACTORS, JSON.stringify(tractors));
        this.notify();
        if (typeof supabaseApi !== 'undefined' && supabaseApi?.tractors) {
          supabaseApi.tractors.update(tractorId, {
            stockCount: t.stockCount,
            chassisList: t.chassisList,
            status: t.status
          }).catch(e => console.warn('Supabase tractor stock update failed:', e));
        }
      }
    }

    getTractorUnitEconomics(tractorId, chassisNo = null) {
      const tractor = this.getTractors().find(t => t.id === tractorId);
      if (!tractor) return null;
      const expenses = this.getExpenses().filter(e => e.status === 'Approved');
      const matched = expenses.filter(e => {
        if (!e.chassisTag) return false;
        if (chassisNo && e.chassisTag === chassisNo) return true;
        return tractor.chassisList && tractor.chassisList.includes(e.chassisTag);
      });
      const directTotal = matched.reduce((s, e) => s + Number(e.amount || 0), 0);
      const purchaseCost = Number(tractor.dealerPurchaseCost || 0);
      const sellingPrice = Number(tractor.price || 0);
      const totalTrueCost = purchaseCost + directTotal;
      const actualMargin = sellingPrice - totalTrueCost;
      const marginPercent = totalTrueCost > 0 ? ((actualMargin / sellingPrice) * 100).toFixed(1) : 0;
      return {
        tractor,
        chassisNo,
        purchaseCost,
        directExpenses: matched,
        directExpensesTotal: directTotal,
        totalTrueCost,
        sellingPrice,
        actualMargin,
        marginPercent
      };
    }

    getFinancialSnapshot() {
      const expenses = this.getExpenses().filter(e => e.status === 'Approved');
      const cashTxns = this.getCashTransactions();
      const quotes = this.getQuotes();
      const tractors = this.getTractors();

      // Dynamic Sales Revenue: sum of quotes grand totals or cash "IN" or bill totals
      const quoteRevenue = quotes.reduce((sum, q) => sum + Number(q.grandTotal || 0), 0);
      const bills = this.getBills ? this.getBills() : [];
      const billRevenue = bills.reduce((sum, b) => sum + Number(b.totalRupees || 0), 0);
      const cashSalesRevenue = cashTxns
        .filter(t => t.type === 'IN')
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const salesRevenue = Math.max(quoteRevenue + billRevenue, cashSalesRevenue);

      // Cost of goods sold: tractor purchase costs for quoted units
      let costOfGoodsSold = 0;
      for (const q of quotes) {
        const tr = tractors.find(t => t.id === q.tractorId || t.model === q.tractorModel || (q.tractorName && q.tractorName.includes(t.model)));
        if (tr && tr.dealerPurchaseCost) {
          costOfGoodsSold += Number(tr.dealerPurchaseCost);
        }
      }

      const grossProfit = Math.max(0, salesRevenue - costOfGoodsSold);

      const categoryTotals = {};
      let totalExpenses = 0;
      for (const exp of expenses) {
        const cat = exp.category || 'Other';
        const amt = Number(exp.amount || 0);
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
        totalExpenses += amt;
      }

      const netProfit = grossProfit - totalExpenses;
      let cashIn = 0, cashOut = 0;
      for (const txn of cashTxns) {
        const amt = Number(txn.amount || 0);
        if (txn.type === 'IN') cashIn += amt;
        else if (txn.type === 'OUT') cashOut += amt;
      }
      return {
        salesRevenue,
        costOfGoodsSold,
        grossProfit,
        totalExpenses,
        netProfit,
        categoryTotals,
        cashIn,
        cashOut,
        netCashFlow: cashIn - cashOut
      };
    }
  }

  const store = new DealershipStore();

  // --- 4. DETERMINISTIC ALGORITHMS ---
  function calculateBuyingScore(lead) {
    if (!lead) return { score: null, category: null, probability: null, reasons: [], nextAction: '' };

    // 1. Direct user-managed score (if provided/edited by user)
    if (lead.buyingScore !== undefined && lead.buyingScore !== null && lead.buyingScore !== '') {
      const finalScore = Math.max(0, Math.min(100, Math.round(Number(lead.buyingScore))));
      let category = 'COLD';
      if (finalScore >= 75) category = 'HOT';
      else if (finalScore >= 50) category = 'WARM';

      return {
        score: finalScore,
        category,
        probability: `${finalScore}%`,
        reasons: ['User-managed score'],
        nextAction: lead.nextAction || (category === 'HOT' ? 'Call customer today: High purchase intent' : '')
      };
    }

    // 2. If not provided, remains empty!
    return {
      score: null,
      category: null,
      probability: null,
      reasons: [],
      nextAction: lead.nextAction || ''
    };
  }

  function suggestLeadBuyingScore(lead) {
    let score = 25;
    const reasons = [];
    const stage = lead.stage || 'New Enquiry';
    if (stage === 'Negotiation') { score += 35; reasons.push('Customer in active price negotiation'); }
    else if (stage === 'Price / Estimate Sent' || stage === 'Quotation Sent') { score += 25; reasons.push('Customer received price breakdown & estimate'); }
    else if (stage === 'Demo Scheduled' || stage === 'Demo Completed') { score += 22; reasons.push('Field demonstration interest'); }
    else if (stage === 'Needs Analyzed') { score += 15; reasons.push('Implement needs matched'); }

    const days = Number(lead.expectedPurchaseDays);
    if (days && days <= 7) { score += 25; reasons.push('Immediate purchase intended within 7 days'); }
    else if (days && days <= 15) { score += 18; reasons.push('Purchase planned within 2 weeks'); }
    else if (days && days <= 30) { score += 10; reasons.push('Planning purchase this harvest season'); }
    else if (days && days > 30) { score -= 10; reasons.push('Long-term horizon (> 30 days)'); }

    if (lead.financeRequired === true) { score += 8; reasons.push('Finance / KCC ready for processing'); }
    if (lead.exchangeWanted === true) { score += 10; reasons.push('Old tractor exchange evaluation in progress'); }

    const finalScore = Math.max(10, Math.min(98, Math.round(score)));
    let category = 'COLD';
    if (finalScore >= 75) category = 'HOT';
    else if (finalScore >= 50) category = 'WARM';

    return { score: finalScore, category, probability: `${finalScore}%`, reasons };
  }

  function getTodayCallsQueue(leadsList) {
    const scored = leadsList.map(lead => ({
      ...lead,
      computedScore: calculateBuyingScore(lead)
    }));
    return scored
      .filter(l => (l.computedScore && l.computedScore.category === 'HOT') || l.stage === 'Negotiation' || l.stage === 'Price / Estimate Sent' || l.stage === 'Quotation Sent')
      .sort((a, b) => (b.computedScore.score || 0) - (a.computedScore.score || 0));
  }

  function matchTractor({ landAcres, soilType = 'Medium', implementsNeeded = [], budgetMax, requiresHeavyTrolley = false, drivePreference = 'Any', tractorsList = [] }) {
    const acres = Number(landAcres) || 10;
    const budget = Number(budgetMax) || 1000000;
    let minHp = 35, maxHp = 65;
    if (acres <= 7) { minHp = 35; maxHp = 45; }
    else if (acres <= 15) { minHp = 42; maxHp = 52; }
    else if (acres <= 30) { minHp = 48; maxHp = 58; }
    else { minHp = 50; maxHp = 70; }

    const isHeavySoil = soilType.toLowerCase().includes('black') || soilType.toLowerCase().includes('clay');
    if (isHeavySoil) minHp += 3;

    const hasRotavator = implementsNeeded.some(i => i.toLowerCase().includes('rotavator'));
    const hasHeavyImplement = implementsNeeded.some(i => i.toLowerCase().includes('plough') || i.toLowerCase().includes('leveller'));
    if (hasRotavator) minHp = Math.max(minHp, 45);
    if (hasHeavyImplement) minHp = Math.max(minHp, 48);
    if (requiresHeavyTrolley) minHp = Math.max(minHp, 45);

    const scored = tractorsList.map(t => {
      let score = 0;
      const reasons = [];
      if (t.hp >= minHp && t.hp <= maxHp + 5) {
        score += 35;
        reasons.push(`Optimal ${t.hp} HP engine perfectly matches ${acres} acres workload`);
      } else if (t.hp >= minHp - 3) {
        score += 20;
        reasons.push(`Viable ${t.hp} HP for entry-level work`);
      }
      if (t.price <= budget) {
        score += 25;
        reasons.push(`Well within budget at ₹${(t.price / 100000).toFixed(2)} Lakh`);
      } else if (t.price <= budget * 1.1) {
        score += 15;
        reasons.push(`Slightly above budget but higher resale value`);
      }
      if (hasRotavator) {
        if (t.ptoHp >= 42) {
          score += 20;
          reasons.push(`High PTO power (${t.ptoHp} HP) handles 6-7 ft Rotavator without RPM drop`);
        } else {
          score += 10;
          reasons.push(`Suitable for 5 ft rotavator`);
        }
      }
      if (requiresHeavyTrolley || hasHeavyImplement) {
        if (t.liftCapacityKg >= 1800) {
          score += 15;
          reasons.push(`Heavy hydraulic lift capacity (${t.liftCapacityKg} kg) excellent for 10-12 ton trolley`);
        }
      }
      if (isHeavySoil && (t.drive.includes('4WD') || t.hp >= 50)) {
        score += 10;
        reasons.push(`Engine torque & grip well suited for heavy ${soilType} terrain`);
      }
      return { tractor: t, score, reasons };
    });

    scored.sort((a, b) => b.score - a.score);
    const bestMatch = scored[0] || null;
    const alternative = scored.slice(1).find(item => item.tractor.hp > (bestMatch?.tractor.hp || 0)) || scored[1] || null;
    return { recommendedHpRange: `${minHp} - ${maxHp} HP`, bestMatch, alternative, allRanked: scored };
  }

  function calculateTractorLoan({ tractorPrice, subsidyAmount = 0, downPayment = 0, tenureYears = 5, annualInterestRate = 10.5 }) {
    const price = Number(tractorPrice) || 0;
    const subsidy = Number(subsidyAmount) || 0;
    const down = Number(downPayment) || 0;
    const years = Number(tenureYears) || 5;
    const annualRate = Number(annualInterestRate) || 10.5;

    const netCost = Math.max(0, price - subsidy);
    const loanPrincipal = Math.max(0, netCost - down);
    const months = years * 12;
    const monthlyRate = annualRate / (12 * 100);

    let monthlyEmi = 0;
    if (loanPrincipal > 0 && monthlyRate > 0) {
      monthlyEmi = (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    }

    const totalPayment = down + (monthlyEmi * months);
    const totalInterest = Math.max(0, totalPayment - down - loanPrincipal);

    const biAnnualInstallments = years * 2;
    const biAnnualRate = annualRate / (2 * 100);
    let biAnnualEmi = 0;
    if (loanPrincipal > 0 && biAnnualRate > 0) {
      biAnnualEmi = (loanPrincipal * biAnnualRate * Math.pow(1 + biAnnualRate, biAnnualInstallments)) / (Math.pow(1 + biAnnualRate, biAnnualInstallments) - 1);
    }

    return {
      netTractorCost: Math.round(netCost),
      loanPrincipal: Math.round(loanPrincipal),
      downPayment: Math.round(down),
      subsidyAmount: Math.round(subsidy),
      tenureYears: years,
      annualInterestRate: annualRate,
      monthlyEmi: Math.round(monthlyEmi),
      biAnnualHarvestEmi: Math.round(biAnnualEmi),
      totalInterest: Math.round(totalInterest),
      totalRepayment: Math.round(totalPayment),
      principalPercent: totalPayment > 0 ? Math.round((loanPrincipal / totalPayment) * 100) : 100,
      interestPercent: totalPayment > 0 ? Math.round((totalInterest / totalPayment) * 100) : 0
    };
  }

  function evaluateUsedTractor({ brand, model, manufactureYear = 2018, meterHours = 3500, tyreConditionPercent = 65, engineCondition = 'Good', hydraulicsCondition = 'Good', ptoCondition = 'Good', transmissionCondition = 'Good', newTractorPrice = 840000 }) {
    const currentYear = new Date().getFullYear();
    const age = Math.max(1, currentYear - Number(manufactureYear));
    const hours = Number(meterHours) || 3000;
    const tyres = Number(tyreConditionPercent) || 50;

    let baseValue = 520000 - (age * 22000);
    if (hours > 5000) baseValue -= 35000;
    else if (hours > 3000) baseValue -= 18000;
    else if (hours < 1500) baseValue += 25000;

    if (tyres < 35) baseValue -= 28000;
    else if (tyres > 80) baseValue += 18000;

    if (engineCondition === 'Excellent') baseValue += 20000;
    else if (engineCondition === 'Average') baseValue -= 25000;
    else if (engineCondition === 'Poor') baseValue -= 50000;

    if (hydraulicsCondition === 'Poor') baseValue -= 20000;
    if (ptoCondition === 'Poor') baseValue -= 15000;
    if (transmissionCondition === 'Poor') baseValue -= 25000;

    baseValue = Math.max(120000, Math.round(baseValue / 5000) * 5000);
    const minVal = Math.round(baseValue * 0.94);
    const maxVal = Math.round(baseValue * 1.06);
    const effectivePrice = Math.max(0, newTractorPrice - baseValue);

    const checklist = [
      { item: "Engine Compression & Blow-by Smoke", status: engineCondition, critical: true },
      { item: "Hydraulic Lift Reaction & Oil Leakage", status: hydraulicsCondition, critical: true },
      { item: "Dual-Clutch & PTO Spline Play", status: ptoCondition, critical: true },
      { item: "Transmission Gearbox Grinding & Reverse Lock", status: transmissionCondition, critical: true },
      { item: "Tyre Lug Remaining Depth & Side Cracks", status: `${tyres}% Life`, critical: false },
      { item: "RC Book & Bank NOC Hypothecation Check", status: "Document Verification", critical: true }
    ];

    return { brand, model, manufactureYear, meterHours: hours, minValuation: minVal, maxValuation: maxVal, recommendedOffer: baseValue, newTractorPrice, effectivePurchaseAmount: effectivePrice, inspectionChecklist: checklist };
  }

  function generateFollowUpSequences(lead, tractor = null) {
    const customerName = lead.name || 'Kisan Bhai';
    const tractorName = tractor ? `${tractor.brand} ${tractor.model}` : (lead.interestedModel || 'Tractor');
    const acres = lead.landAcres ? `${lead.landAcres} acres` : 'your farm';
    const village = lead.village ? `Village ${lead.village}` : '';

    return [
      {
        day: 1,
        title: "Day 1: Showroom Visit Gratitude & Shortlisted Model",
        body: `Namaskar ${customerName} Ji 🙏\n\nThank you for visiting Maa Durga Engineering! Based on your requirement for ${acres} in ${village}, we shortlisted the powerful ${tractorName}.\n\n✓ Best in class fuel efficiency\n✓ High lifting capacity & heavy duty gearbox\n✓ 5-year warranty with showroom service\n\nBrochure attached. Looking forward to serving you!\n\nSales Team | Maa Durga Engineering\nGorakhpur - ${SHOWROOM_INFO.phone}`
      },
      {
        day: 3,
        title: "Day 3: Rotavator & Implement Field Video",
        body: `Namaskar ${customerName} Ji,\n\nField demonstration video of ${tractorName} with a 6-ft Rotavator:\n\n📹 Video: https://youtu.be/maadurga-field-demo\n\nNotice the zero RPM drop. Shall our demo team bring this tractor to your farm in ${village} this week?\n\nMaa Durga Engineering`
      },
      {
        day: 7,
        title: "Day 7: Easy Kisan Loan & Low Harvest EMI Scheme",
        body: `Namaskar ${customerName} Ji,\n\nWe have an exclusive financing tie-up with State Bank of India & HDFC Bank for ${tractorName}.\n\n💰 Minimum down payment\n🌾 Harvest-Cycle EMI: Pay only after Rabi & Kharif crop sales!\n📄 24-hour sanction\n\nShall we process your loan paperwork & price estimate today?\n\nFinance Desk | Maa Durga Engineering`
      },
      {
        day: 14,
        title: "Day 14: Seasonal Booking Check-in & Canopy Gift",
        body: `Namaskar ${customerName} Ji,\n\nHarvest season is beginning and stock of ${tractorName} is moving quickly. If you book before this Sunday, we provide a FREE heavy tractor canopy + 1st year free service kit.\n\nReply 'YES' to reserve your chassis!\n\nDirector, Maa Durga Engineering`
      }
    ];
  }

  function queryBusinessAdvisor(userQuestion) {
    const q = (userQuestion || '').toLowerCase();
    const leads = store.getLeads();
    const snapshot = store.getFinancialSnapshot();
    const expenses = store.getExpenses();
    const bills = store.getBills ? store.getBills() : [];
    const tractors = store.getTractors();

    if (q.includes('profit') || q.includes('margin') || q.includes('loss') || q.includes('why')) {
      const sortedCats = Object.entries(snapshot.categoryTotals).sort((a, b) => b[1] - a[1]);
      if (expenses.length === 0 && bills.length === 0) {
        return {
          title: "Showroom Financial Ledger (Clean Slate)",
          summary: "Currently no sales or operating expenses are recorded in the active ledger.",
          keyFindings: [
            "Gross Profit: ₹0 | Total Showroom Expenses: ₹0 | Net Profit: ₹0",
            "To track true landed margins, log showroom costs with '+ Expense' and tag freight/PDI to chassis numbers.",
            "Showroom bills, tractor sales and spare parts receipts automatically accrue into showroom revenue."
          ],
          recommendation: "Issue your first customer bill or log initial operational expenses to begin tracking live unit economics."
        };
      }

      const top1 = sortedCats[0] || ['Operational', 0];
      const top2 = sortedCats[1] || ['Utilities', 0];
      return {
        title: "Showroom Profitability & Margin Diagnostic",
        summary: `Gross Profit is ${formatAdaptiveRupee(snapshot.grossProfit)} against total showroom expenses of ${formatAdaptiveRupee(snapshot.totalExpenses)}, leaving Net Profit at ${formatAdaptiveRupee(snapshot.netProfit)}.`,
        keyFindings: [
          sortedCats.length > 0 ? `Highest recorded expense category is ${top1[0]} (₹${Number(top1[1]).toLocaleString('en-IN')})${sortedCats.length > 1 ? `, followed by ${top2[0]} (₹${Number(top2[1]).toLocaleString('en-IN')})` : ''}.` : 'No category expenses recorded yet.',
          `Total approved showroom expenses count: ${expenses.filter(e => e.status === 'Approved').length} records.`,
          `Net Cash Flow is ${formatAdaptiveRupee(snapshot.netCashFlow)} based on recorded cash in/out transactions.`
        ],
        recommendation: snapshot.netProfit < 0 ? "Operating overheads currently exceed gross margins; prioritize closing pending hot deals." : "Healthy dealer margins maintained. Keep monitoring freight and PDI costs tagged to chassis numbers."
      };
    }

    if (q.includes('call') || q.includes('lead') || q.includes('today') || q.includes('focus')) {
      if (leads.length === 0) {
        return {
          title: "Daily Calling Queue (Empty)",
          summary: "You have 0 active farmer leads in the CRM.",
          keyFindings: [
            "The calling queue is currently empty.",
            "Click '+ Lead' in the top header or customer tab to enter walk-in or referral enquiries.",
            "The algorithm will immediately calculate a 0-100 buying score and assign next action."
          ],
          recommendation: "Record walk-in farmers or phone enquiries to build your active sales calling queue."
        };
      }

      const hot = leads.filter(l => (l.buyingScore >= 75) || l.stage === 'Negotiation');
      const targetLeads = hot.length > 0 ? hot : leads.slice(0, 3);
      return {
        title: "Daily Sales Calling Priority Recommendation",
        summary: hot.length > 0 ? `You have ${hot.length} Hot Leads requiring immediate showroom contact today.` : `You have ${leads.length} customer leads in follow-up pipeline.`,
        keyFindings: targetLeads.map(l => `🔥 ${l.name} (${l.village || 'Sadar'}) — Score ${l.buyingScore || 70}/100. Stage: ${l.stage || 'Enquiry'}. Next: ${l.nextAction || 'Follow up on tractor requirement'}`),
        recommendation: targetLeads[0] ? `Call ${targetLeads[0].name} (${targetLeads[0].phone}) first to discuss financing or schedule a village demonstration.` : "Review lead pipeline."
      };
    }

    if (q.includes('village') || q.includes('area') || q.includes('map') || q.includes('demand')) {
      if (leads.length === 0) {
        return {
          title: "Village Territory Intelligence",
          summary: "No village data recorded yet.",
          keyFindings: [
            "Territory clustering activates automatically as you add customer leads with their village names.",
            "The system will highlight high-demand villages, dominant crops, and recommend route planning for field demonstration trolleys."
          ],
          recommendation: "Capture farmer village names during enquiry entry to generate geographic demand heatmaps."
        };
      }

      const villageCounts = {};
      for (const l of leads) {
        const v = l.village || 'Sadar / Town';
        villageCounts[v] = (villageCounts[v] || 0) + 1;
      }
      const sorted = Object.entries(villageCounts).sort((a, b) => b[1] - a[1]);
      const topV = sorted[0];

      return {
        title: "Village Territory & Rural Cluster Intelligence",
        summary: `Top agricultural demand cluster is Village ${topV[0]} with ${topV[1]} active leads.`,
        keyFindings: sorted.slice(0, 4).map(([vName, count]) => `Village ${vName}: ${count} active farmer ${count === 1 ? 'enquiry' : 'enquiries'}.`),
        recommendation: `Schedule field demonstration trolley route through Village ${topV[0]} to maximize farmer engagement.`
      };
    }

    return {
      title: "Maa Durga Engineering Sales Advisory",
      summary: `Analyzed your live showroom database containing ${leads.length} leads, ${tractors.length} tractor catalog models, and ${(store.getBills ? store.getBills() : []).length} showroom bills & estimates.`,
      keyFindings: [
        `Active Leads: ${leads.length} total (${leads.filter(l => (l.buyingScore || 0) >= 75).length} Hot priority).`,
        `Financials: Gross Profit ₹${(snapshot.grossProfit / 100000).toFixed(2)}L | Operating Expenses ₹${(snapshot.totalExpenses / 100000).toFixed(2)}L.`,
        `Physical Inventory: ${tractors.reduce((s, t) => s + (t.stockCount || 0), 0)} units currently in stock.`
      ],
      recommendation: leads.length === 0 ? "Start by adding customer leads or logging expenses using the top action buttons." : "Try asking: 'Why was profit lower this month?', 'Who should I call today?', or 'Show village demand breakdown'."
    };
  }

  // --- 4B. AUTHENTIC BILL BOOK TEMPLATE HELPERS (data/New Doc template) ---
  function numberToIndianWords(n) {
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

  function getMaaDurgaSvg() {
    return `<img src="/durga-maa-logo.jpg" alt="Maa Durga Logo" class="mdd-durga-logo" style="width:100%; height:100%; object-fit:contain; display:block;" onerror="this.onerror=null; this.src='/data/durga%20maa%20logo.jpg';" />`;
  }

  function getChakraSvg() {
    return `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#000000" stroke-width="3"/>
      <circle cx="50" cy="50" r="42" fill="none" stroke="#000000" stroke-width="1"/>
      <circle cx="50" cy="50" r="7" fill="#000000"/>
      <line x1="50" y1="4" x2="50" y2="96" stroke="#000000" stroke-width="2.5"/>
      <line x1="10.2" y1="27" x2="89.8" y2="73" stroke="#000000" stroke-width="2.5"/>
      <line x1="10.2" y1="73" x2="89.8" y2="27" stroke="#000000" stroke-width="2.5"/>
    </svg>`;
  }

  function autoFitBillToOnePage(billElement) {
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

  function renderMaaDurgaBillHTML(bill, isPureBlank = false, isLive = false) {
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

        <!-- Items Table Grid - Plain Sheet Inside -->
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

  // --- 5. UI CONTROLLER ---
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

      if (!this._subscribed) {
        this._subscribed = true;
        store.subscribe(() => {
          this.renderSidebar();
          this.renderCurrentView();
        });
      }
    }

    bindEvents() {
      const toggleBtn = document.getElementById('mobileMenuBtn');
      const sidebar = document.querySelector('.sidebar');
      if (toggleBtn && sidebar && !toggleBtn._hasBoundToggle) {
        toggleBtn._hasBoundToggle = true;
        toggleBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
      }

      document.querySelectorAll('.nav-item-btn').forEach(btn => {
        if (btn._hasBoundNav) return;
        btn._hasBoundNav = true;
        btn.addEventListener('click', () => {
          const tab = btn.dataset.tab;
          if (tab) {
            this.switchTab(tab);
            if (window.innerWidth <= 768 && sidebar) sidebar.classList.remove('open');
          }
        });
      });

      document.querySelectorAll('.modal-backdrop').forEach(modal => {
        if (modal._hasBoundModal) return;
        modal._hasBoundModal = true;
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
      if (tabName === 'billing') {
        this.currentTab = 'billing';
      } else {
        this.currentTab = tabName;
      }
      document.querySelectorAll('.nav-item-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === this.currentTab);
      });

      const titleEl = document.getElementById('topbarTitle');
      const subtitleEl = document.getElementById('topbarSubtitle');
      const titles = {
        dashboard: { title: "Executive Command Center", sub: "Daily sales calls, today's cash flow & monthly showroom P&L" },
        analytics: { title: "Summary Stats & Business Analytics", sub: "Comprehensive daily, weekly, monthly & yearly multi-metric intelligence" },
        summary: { title: "Summary Stats & Business Analytics", sub: "Comprehensive daily, weekly, monthly & yearly multi-metric intelligence" },
        leads: { title: "Customer & Lead CRM", sub: "Farmer profiles, village mapping & algorithmic buying score" },
        inventory: { title: "Tractor Inventory & Landed Margins", sub: "Live showroom stock, specifications & unit profitability" },
        billing: { title: "Billing & Bills Command Center (माँ दुर्गा डीजल)", sub: "Official Maa Durga Diesel bills, estimates & customer receipts" },
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
      if (hotBadge) hotBadge.textContent = `${hotCount} Hot`;

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
        case 'inventory':
          this.currentTab = 'dashboard';
          content.innerHTML = this.renderDashboardHTML();
          this.bindDashboardEvents();
          break;
        case 'billing':
          content.innerHTML = this.renderBillingHTML();
          this.bindBillingEvents();
          break;
        case 'emi':
          content.innerHTML = this.renderEmiHTML();
          this.bindEmiEvents();
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
        <div class="command-banner">
          <div class="command-banner-info">
            <h3>${renderIcon('flame')} ${todayCalls.length > 0 ? `Today's Priority: Call ${todayCalls.length} Hot Leads First` : 'Executive Command Center (Live Showroom)'}</h3>
            <p>${todayCalls.length > 0 ? 'Prioritized customer queues based on buying score, expected purchase date, and village demos.' : 'Ready for daily dealership operations. Capture leads, issue bills & estimates, and log showroom expenses dynamically.'}</p>
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
          <div class="metric-card success" onclick="window.app?.switchTab('analytics')" style="cursor: pointer;" title="View Summary & Analytics">
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
                <span class="chip-dot"></span> ${expenses.filter(e => e.status === 'Approved').length} Approved Vouchers
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

        <div class="dashboard-grid-2col">
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
                  ${todayCalls.length === 0 ? `
                    <tr>
                      <td colspan="6" style="text-align:center; padding:36px 20px; color:var(--text-muted);">
                        <div style="font-size:28px; margin-bottom:8px;">📋</div>
                        <div style="font-weight:700; font-size:14px; color:var(--text-secondary);">No customer calls in queue</div>
                        <div style="font-size:12px; margin-top:4px;">As you add farmer leads, prioritized hot calls will automatically appear here.</div>
                        <button class="quick-action-btn btn-sm btn-primary" style="margin:12px auto 0;" onclick="window.app.openNewLeadModal()">
                          ${renderIcon('plus')} Add First Lead
                        </button>
                      </td>
                    </tr>
                  ` : todayCalls.map(lead => {
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
                            <a href="tel:${lead.phone}" class="quick-action-btn btn-sm btn-primary" title="Call">
                              ${renderIcon('phone')} Call
                            </a>
                            <button class="quick-action-btn btn-sm btn-whatsapp open-wa-btn" data-lead-id="${lead.id}" title="Send WhatsApp">
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
              ${Object.keys(snapshot.categoryTotals).length === 0 ? `
                <div style="text-align:center; padding:36px 20px; color:var(--text-muted);">
                  <div style="font-size:28px; margin-bottom:8px;">💸</div>
                  <div style="font-weight:700; font-size:14px; color:var(--text-secondary);">No expenses recorded yet</div>
                  <div style="font-size:12px; margin-top:4px;">Log fuel, rent, staff salary advances, or trailer transport.</div>
                  <button class="quick-action-btn btn-sm btn-gold" style="margin:12px auto 0;" onclick="window.app.openFastExpenseModal()">
                    ${renderIcon('plus')} Record Expense
                  </button>
                </div>
              ` : Object.entries(snapshot.categoryTotals).map(([cat, amt]) => {
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

            <div style="margin-top:20px; padding:14px; background:var(--primary-light); border-radius:var(--radius-md); border:1px solid #bbf7d0;">
              <div style="font-size:12.5px; font-weight:800; color:var(--primary-dark); display:flex; align-items:center; gap:6px;">
                ${renderIcon('tractor')} Tractor Unit Margin Intelligence
              </div>
              <p style="font-size:11.5px; color:var(--primary); margin-top:4px; line-height:1.4;">
                Tagging inward freight & repair costs directly to chassis serial numbers reveals true net margins per unit (e.g. VST Zetor 5011: ₹68,500 true profit vs ₹80,000 nominal gross).
              </p>
            </div>
          </div>
        </div>
      `;
    }

    bindDashboardEvents() {
      const callBtn = document.getElementById('dashStartCallingBtn');
      if (callBtn) callBtn.addEventListener('click', () => this.switchTab('leads'));

      const addLeadBtn = document.getElementById('dashAddLeadBtn');
      if (addLeadBtn) addLeadBtn.addEventListener('click', () => this.openNewLeadModal());

      const fastExpBtn = document.getElementById('dashFastExpenseBtn');
      if (fastExpBtn) fastExpBtn.addEventListener('click', () => this.openFastExpenseModal());

      document.querySelectorAll('.open-wa-btn').forEach(btn => {
        btn.addEventListener('click', () => this.openWhatsAppSequenceModal(btn.dataset.leadId));
      });
    }

    renderLeadsHTML() {
      const leads = store.getLeads();
      const tractors = store.getTractors();

      return `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; gap:10px; align-items:center;">
            <input type="text" id="leadSearchInput" class="form-input" placeholder="Search farmer, village, phone..." style="width:260px;" />
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
                  <th>Farmer & Phone</th>
                  <th>Village & Land</th>
                  <th>Date Added</th>
                  <th>Current Tractor</th>
                  <th>Interested Model</th>
                  <th>Buying Score</th>
                  <th>Finance / Exchange</th>
                  <th>Next Action</th>
                  <th style="text-align:right; width:160px; min-width:160px; padding-right:14px;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${leads.length === 0 ? `
                  <tr>
                    <td colspan="9" style="text-align:center; padding:48px 20px; color:var(--text-muted);">
                      <div style="font-size:32px; margin-bottom:12px;">🌾</div>
                      <div style="font-weight:700; font-size:16px; color:var(--text-secondary);">No customer leads recorded yet</div>
                      <div style="font-size:13px; margin-top:6px; max-width:440px; margin-left:auto; margin-right:auto;">
                        Ready for live dealership operations. Click below to register your first farmer enquiry with land size, crops, village, and buying criteria.
                      </div>
                      <button class="quick-action-btn btn-primary" style="margin:16px auto 0;" onclick="window.app.openNewLeadModal()">
                        ${renderIcon('plus')} Register First Lead
                      </button>
                    </td>
                  </tr>
                ` : leads.map(lead => {
                  const scoreObj = calculateBuyingScore(lead);
                  const tractor = tractors.find(t => t.id === lead.interestedModelId);
                  const tractorNamePart = tractor ? `<strong style="color:var(--primary);">${tractor.brand} ${tractor.model}</strong>` : (lead.interestedModelName ? `<strong style="color:var(--primary);">${lead.interestedModelName}</strong>` : '');
                  const budgetPart = (lead.budgetMax !== null && lead.budgetMax !== undefined && lead.budgetMax !== '' && Number(lead.budgetMax) > 0) ? `<span style="font-size:11px; color:var(--text-secondary);">Budget: ₹${(Number(lead.budgetMax) / 100000).toFixed(1)}L</span>` : '';
                  const modelBudgetContent = (tractorNamePart && budgetPart) ? `${tractorNamePart}<br>${budgetPart}` : (tractorNamePart || budgetPart || '<span style="color:var(--text-muted);">-</span>');

                  const villagePart = lead.village ? `<strong>${lead.village}</strong>` : '';
                  const landPart = (lead.landAcres !== null && lead.landAcres !== undefined && lead.landAcres !== '' && Number(lead.landAcres) > 0) ? `<span style="font-size:11.5px; color:var(--text-secondary);">${lead.landAcres} Acres</span>` : '';
                  const villageLandContent = (villagePart && landPart) ? `${villagePart}<br>${landPart}` : (villagePart || landPart || '<span style="color:var(--text-muted);">-</span>');

                  const rawDate = lead.date || lead.createdAt || lead.lastContactDate || new Date().toISOString().split('T')[0];
                  const leadDate = formatToDMY(rawDate) || rawDate;

                  const finPart = lead.financeRequired === true ? `<span>Finance: <strong>Yes${lead.financeBank ? ' (' + lead.financeBank + ')' : ''}</strong></span>` : (lead.financeRequired === false ? '<span>Finance: <strong>Cash</strong></span>' : '');
                  const exPart = lead.exchangeWanted === true ? '<span>Exchange: <strong>Yes</strong></span>' : (lead.exchangeWanted === false ? '<span>Exchange: <strong>No</strong></span>' : '');
                  const finExContent = (finPart && exPart) ? `${finPart}<br>${exPart}` : (finPart || exPart || '<span style="color:var(--text-muted);">-</span>');

                  return `
                    <tr data-lead-id="${lead.id}">
                      <td>
                        <strong>${lead.name || 'Farmer Customer'}</strong><br>
                        ${lead.phone && lead.phone !== '-' ? `<span style="font-size:11px; color:var(--text-muted);">${lead.phone}</span><br>` : ''}
                        ${scoreObj.score !== null ? `
                          <span class="badge ${scoreObj.category === 'HOT' ? 'badge-hot' : (scoreObj.category === 'WARM' ? 'badge-warm' : 'badge-cold')}" style="cursor:pointer;" title="Click to edit score" onclick="window.app.openScoreModal('${lead.id}')">
                            ${scoreObj.category} (${scoreObj.score}/100) ✎
                          </span>
                        ` : `
                          <span class="badge" style="background:#f8fafc; color:#64748b; border:1px dashed #cbd5e1; cursor:pointer;" title="Click to set score" onclick="window.app.openScoreModal('${lead.id}')">
                            + Set Score
                          </span>
                        `}
                      </td>
                      <td>${villageLandContent}</td>
                      <td style="font-size:12px; white-space:nowrap; color:var(--text-secondary); font-weight:600;"><span style="color:var(--text-muted); margin-right:4px;">📅</span>${leadDate}</td>
                      <td style="font-size:12px;">${lead.currentTractor ? `<span>${lead.currentTractor}</span>` : '<span style="color:var(--text-muted);">-</span>'}</td>
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
                      <td style="text-align:right; width:160px; min-width:160px; padding-right:14px; white-space:nowrap;">
                        <div style="display:inline-flex; align-items:center; justify-content:flex-end; gap:6px; flex-wrap:nowrap;">
                          <a href="${lead.phone && lead.phone !== '-' ? `tel:${lead.phone}` : '#'}" class="quick-action-btn btn-sm btn-primary" title="Call" style="width:30px; height:30px; padding:0; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;">
                            ${renderIcon('phone')}
                          </a>
                          <button class="quick-action-btn btn-sm btn-whatsapp open-wa-btn" data-lead-id="${lead.id}" title="WhatsApp" style="width:30px; height:30px; padding:0; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;">
                            ${renderIcon('whatsapp')}
                          </button>
                          <button class="quick-action-btn btn-sm btn-outline edit-lead-btn" data-lead-id="${lead.id}" title="Edit Lead Details" style="width:30px; height:30px; padding:0; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;">
                            ${renderIcon('edit')}
                          </button>
                          <button class="quick-action-btn btn-sm btn-danger delete-lead-btn" data-lead-id="${lead.id}" title="Delete" style="width:30px; height:30px; padding:0; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;">
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
      if (addBtn) addBtn.addEventListener('click', () => this.openNewLeadModal());

      document.querySelectorAll('.open-wa-btn').forEach(btn => {
        btn.addEventListener('click', () => this.openWhatsAppSequenceModal(btn.dataset.leadId));
      });

      document.querySelectorAll('.edit-lead-btn').forEach(btn => {
        btn.addEventListener('click', () => this.openEditLeadModal(btn.dataset.leadId));
      });

      document.querySelectorAll('.delete-lead-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (confirm("Delete this customer lead?")) store.deleteLead(btn.dataset.leadId);
        });
      });

      const search = document.getElementById('leadSearchInput');
      const stageFilter = document.getElementById('leadStageFilter');
      const filterFn = () => {
        const q = (search.value || '').toLowerCase();
        const stage = stageFilter.value;
        document.querySelectorAll('#leadsTable tbody tr').forEach(row => {
          const text = row.textContent.toLowerCase();
          const matchesQuery = text.includes(q);
          let matchesStage = true;
          if (stage === 'HOT') matchesStage = text.includes('hot');
          else if (stage !== 'ALL') matchesStage = text.includes(stage.toLowerCase());
          row.style.display = (matchesQuery && matchesStage) ? '' : 'none';
        });
      };
      if (search) search.addEventListener('input', filterFn);
      if (stageFilter) stageFilter.addEventListener('change', filterFn);
    }

    renderRecommendationHTML() {
      return `
        <div class="dashboard-grid-2col" style="grid-template-columns: 1fr 1.3fr;">
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
                  <option value="Heavy Black / Clay">Heavy Black Soil / Sticky Clay</option>
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
                  <option value="4WD">4WD (Wet Paddy / Heavy Mud)</option>
                </select>
              </div>

              <button type="submit" class="quick-action-btn btn-primary" style="width:100%; justify-content:center; padding:12px; margin-top:8px;">
                ${renderIcon('sparkles')} Calculate Best Match
              </button>
            </form>
          </div>

          <div class="panel-card" id="recommendationResults"></div>
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
        const checked = Array.from(document.querySelectorAll('input[name="recImplements"]:checked')).map(cb => cb.value);

        const result = matchTractor({
          landAcres,
          soilType,
          implementsNeeded: checked,
          budgetMax,
          requiresHeavyTrolley: checked.some(i => i.includes('Trolley')),
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
            <button class="quick-action-btn btn-outline" id="recViewUnitMarginBtn">
              ${renderIcon('rupee')} View Unit Margin
            </button>
          </div>
        </div>

        ${tAlt ? `
          <div style="margin-top:20px; padding:16px; border:1px solid var(--border-color); border-radius:var(--radius-lg); background:var(--bg-main);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <span class="badge badge-info" style="margin-bottom:4px;">ALTERNATIVE UPGRADE</span>
                <h4 style="font-size:15px; font-weight:800;">${tAlt.brand} ${tAlt.model} (${tAlt.hp} HP)</h4>
                <p style="font-size:12px; color:var(--text-secondary);">₹${(tAlt.price / 100000).toFixed(2)} Lakh | Higher lift capacity (${tAlt.liftCapacityKg} kg)</p>
              </div>
              <button class="quick-action-btn btn-sm btn-outline" id="recViewAltMarginBtn">
                View Margins
              </button>
            </div>
          </div>
        ` : ''}
      `;

      const bestBillBtn = document.getElementById('recCreateBillBestBtn');
      if (bestBillBtn) bestBillBtn.addEventListener('click', () => this.openNewBillModal());

      const altMarginBtn = document.getElementById('recViewAltMarginBtn');
      if (altMarginBtn && tAlt) altMarginBtn.addEventListener('click', () => this.openUnitMarginModal(tAlt.id));

      const unitMarginBtn = document.getElementById('recViewUnitMarginBtn');
      if (unitMarginBtn) unitMarginBtn.addEventListener('click', () => this.openUnitMarginModal(tBest.id));
    }

    renderInventoryHTML() {
      const tractors = store.getTractors();
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
          <div style="font-size:13.5px; color:var(--text-secondary);">
            Physical Stock: <strong>${tractors.reduce((s, t) => s + (t.stockCount || 0), 0)} Units</strong> | <strong>${tractors.length} Models</strong> in Showroom Catalog
          </div>
          <div style="display:flex; gap:8px;">
            <button class="quick-action-btn btn-primary" onclick="window.app.openAddTractorModal()">
              ${renderIcon('plus')} Add Tractor / Stock
            </button>
            <button class="quick-action-btn btn-outline" onclick="window.app.openFastExpenseModal()">
              ${renderIcon('plus')} Tag Freight / Repair
            </button>
          </div>
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
                  <span class="badge ${t.stockCount > 0 ? 'badge-success' : 'badge-pending'}">
                    ${t.stockCount > 0 ? `${t.stockCount} In Stock` : '0 In Stock (Order)'}
                  </span>
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
                    Active Chassis: ${t.chassisList && t.chassisList.length > 0 ? t.chassisList.join(', ') : 'None currently assigned (Click + Stock to add)'}
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
        btn.addEventListener('click', () => this.openEditTractorModal(btn.dataset.tractorId));
      });
      document.querySelectorAll('.add-stock-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const chassis = prompt("Enter Chassis Serial Number for new incoming unit (optional):", "");
          store.updateTractorStock(btn.dataset.tractorId, 1, chassis ? chassis.trim() : null);
        });
      });
      document.querySelectorAll('.view-unit-margin-btn').forEach(btn => {
        btn.addEventListener('click', () => this.openUnitMarginModal(btn.dataset.tractorId));
      });
    }

    renderBillingHTML() {
      const bills = store.getBills ? store.getBills() : [];
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
                  <th style="text-align:right;">Total Amount (कुल दाम)</th>
                  <th style="text-align:center; width:130px;">Payment Status</th>
                  <th style="text-align:right; width:135px; min-width:135px;">Actions</th>
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
                      <td style="text-align:right;">
                        <strong style="font-size:14px; color:#1e3a8a; font-family:monospace, sans-serif;">₹${total.toLocaleString('en-IN')}${item.totalPaise ? '.' + String(item.totalPaise).padStart(2, '0') : ''}</strong>
                      </td>
                      <td style="text-align:center;">
                        ${statusBadge}
                      </td>
                      <td style="text-align:right; white-space:nowrap;">
                        <div class="bill-actions-wrap" style="display:inline-flex; gap:6px; align-items:center; justify-content:flex-end;">
                          <button class="quick-action-btn btn-sm btn-outline bill-action-btn edit-bill-btn" data-bill-id="${billKey}" onclick="window.app.editBill('${billKey}')" title="Edit Bill">
                            ${renderIcon('edit')}
                            <span class="btn-label">Edit</span>
                          </button>
                          <button class="quick-action-btn btn-sm btn-primary bill-action-btn print-bill-btn" data-bill-id="${billKey}" onclick="window.app.openBillPreviewById('${billKey}')" title="Print Bill">
                            ${renderIcon('print')}
                            <span class="btn-label">Print</span>
                          </button>
                          <button class="quick-action-btn btn-sm btn-outline delete-bill-btn bill-action-btn" data-bill-id="${billKey}" onclick="window.app.deleteBill('${billKey}')" title="Delete Bill" style="color:#ef4444; border-color:rgba(239, 68, 68, 0.4);">
                            ${renderIcon('trash')}
                            <span class="btn-label">Delete</span>
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
        showToast(`बिल क्र. #${billDisplayNo} सफलतापूर्वक हटाया गया / Bill #${billDisplayNo} deleted`, 'info', 'Bill Deleted');
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
      const phoneInput = document.getElementById('mddLivePhone');
      if (billNoInput && billNoInput.value.trim()) bill.billNumber = billNoInput.value.trim();
      if (billNameInput && billNameInput.value.trim()) bill.billName = billNameInput.value.trim();
      if (custInput) bill.customerName = custInput.value.trim() || 'मेसर्स ग्राहक';
      if (phoneInput) bill.phone = phoneInput.value.trim();
      if (addrInput) bill.address = addrInput.value.trim() || '';
      if (vehInput) bill.vehicle = vehInput.value.trim() || '';
      if (dateInput) bill.date = dateInput.value ? formatToDMY(dateInput.value) : formatToDMY(new Date());

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
          const phoneInput = document.getElementById('mddLivePhone');
          const addrInput = document.getElementById('mddLiveAddress');
          const vehInput = document.getElementById('mddLiveVehicle');
          const dateInput = document.getElementById('mddLiveDate');
          if (custInput) bill.customerName = custInput.value.trim() || 'मेसर्स ग्राहक';
          if (phoneInput) bill.phone = phoneInput.value.trim();
          if (addrInput) bill.address = addrInput.value.trim() || '';
          if (vehInput) bill.vehicle = vehInput.value.trim() || '';
          if (dateInput) bill.date = dateInput.value ? formatToDMY(dateInput.value) : formatToDMY(new Date());
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
        const price = Number(document.getElementById('emiTractorPrice')?.value) || 840000;
        const subsidy = Number(document.getElementById('emiSubsidy')?.value) || 0;
        const downPayment = Number(document.getElementById('emiDownPayment')?.value) || 200000;
        const tenureYears = Number(document.getElementById('emiTenure')?.value) || 5;
        const annualInterestRate = Number(document.getElementById('emiRate')?.value) || 10.5;

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

    renderDemosHTML() {
      const demos = store.getDemos();
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <div style="font-size:13px; color:var(--text-secondary);">
            Track field demonstrations across farmer villages
          </div>
          <button class="quick-action-btn btn-primary" onclick="window.app.openNewDemoModal()">
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
                  <th>Salesman</th>
                  <th>Diesel Mileage</th>
                  <th>Customer Reaction</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${demos.length === 0 ? `
                  <tr>
                    <td colspan="10" style="text-align:center; padding:44px 20px; color:var(--text-muted);">
                      <div style="font-size:32px; margin-bottom:10px;">🚜</div>
                      <div style="font-weight:700; font-size:15px; color:var(--text-secondary);">No field demos scheduled yet</div>
                      <div style="font-size:12px; margin-top:4px;">Log tractor demonstrations with rotavator or plough to track field performance and customer reactions.</div>
                      <button class="quick-action-btn btn-sm btn-primary" style="margin:14px auto 0;" onclick="window.app.openNewDemoModal()">
                        ${renderIcon('plus')} Schedule First Demo
                      </button>
                    </td>
                  </tr>
                ` : demos.map(d => `
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
                      <span style="font-size:11px; color:var(--text-secondary);">${d.reaction || ''}</span>
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
      document.querySelectorAll('.mark-demo-completed-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const rating = prompt("Enter customer reaction rating (1 to 5 stars):", "5");
          const diesel = prompt("Enter diesel consumption (e.g. 4.6 L/Acre):", "4.6 Litres / Acre");
          if (rating) {
            store.updateDemo(btn.dataset.demoId, {
              status: 'Completed',
              customerRating: Number(rating) || 5,
              dieselConsumedLtr: diesel || '4.5 L/Acre',
              reaction: 'Customer pleased with field speed.'
            });
          }
        });
      });
    }

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

      const tableRowsHTML = displayExpenses.length === 0 ? `
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
              <button class="quick-action-btn btn-sm btn-primary" style="margin:14px auto 0;" onclick="window.app.openFastExpenseModal()">
                ${renderIcon('plus')} Record First Expense
              </button>
            `}
          </td>
        </tr>
      ` : displayExpenses.map(e => {
        const catBadge = this.getExpenseCategoryBadge(e.category);
        return `
        <tr>
          <td><strong>${e.id}</strong></td>
          <td>${formatToDMY(e.date) || e.date}</td>
          <td>
            <span class="badge" style="background:${catBadge.bg}; color:${catBadge.color}; border:1px solid ${catBadge.border}; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:5px; padding:3px 9px;" onclick="window.app.filterExpensesByCategory('${e.category}')" title="Click to filter by ${e.category}">
              <span>${catBadge.icon}</span>
              <span>${e.category}</span>
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
            <span style="font-size:11px; color:var(--text-secondary);">${e.notes || (e.paidTo && e.description ? e.description : '') || ''}</span>
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
        `;
      }).join('');

      return `
        <!-- Top Action Bar -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
          <div style="font-size:13px; color:var(--text-secondary);">
            Automatic Rules: Expenses <strong>&lt; ₹5,000 auto-approved</strong> | <strong>&ge; ₹5,000 requires Director approval</strong>
          </div>
          <button class="quick-action-btn btn-primary" onclick="window.app.openFastExpenseModal()">
            ${renderIcon('plus')} Fast Expense Entry
          </button>
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
                ${tableRowsHTML}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    bindExpensesEvents() {
      // 1. Approve & Delete actions
      document.querySelectorAll('.approve-expense-btn').forEach(btn => {
        btn.addEventListener('click', () => store.approveExpense(btn.dataset.expId, 'Showroom Director (Approved)'));
      });
      document.querySelectorAll('.delete-expense-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (confirm("Delete this expense record?")) store.deleteExpense(btn.dataset.expId);
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
    }

    renderCashFlowHTML() {
      const snapshot = store.getFinancialSnapshot();
      const txns = store.getCashTransactions();
      return `
        <div style="background:linear-gradient(135deg, #091e13 0%, #173f27 100%); color:#fff; border-radius:var(--radius-lg); padding:20px 24px; margin-bottom:24px;">
          <h3 style="font-size:18px; font-weight:800; color:#fbbf24; margin-bottom:4px;">
            Cash Flow vs Profit: The Showroom Reality
          </h3>
          <p style="font-size:13px; color:#d1fae5; line-height:1.4;">
            Accounting Net Profit is <strong>${formatAdaptiveRupee(snapshot.netProfit)}</strong>, while Net Cash Flow is <strong>${formatAdaptiveRupee(snapshot.netCashFlow)}</strong>.
          </p>
        </div>

        <div class="metric-grid" style="grid-template-columns: repeat(3, 1fr);">
          <div class="metric-card success">
            <div class="metric-top">
              <span class="metric-label">Total Money In (Collections)</span>
              <div class="metric-icon-wrap success">${renderIcon('bank')}</div>
            </div>
            <div class="metric-value" style="color:var(--success);">+₹${snapshot.cashIn.toLocaleString('en-IN')}</div>
          </div>

          <div class="metric-card danger">
            <div class="metric-top">
              <span class="metric-label">Total Money Out (Payments)</span>
              <div class="metric-icon-wrap danger">${renderIcon('expense')}</div>
            </div>
            <div class="metric-value" style="color:var(--danger);">-₹${snapshot.cashOut.toLocaleString('en-IN')}</div>
          </div>

          <div class="metric-card gold">
            <div class="metric-top">
              <span class="metric-label">Net Cash Balance</span>
              <div class="metric-icon-wrap gold">${renderIcon('rupee')}</div>
            </div>
            <div class="metric-value">+₹${snapshot.netCashFlow.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div class="panel-card">
          <div class="panel-header">
            <div class="panel-title">${renderIcon('bank')} Recent Cash & Bank Movements</div>
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
                  <th>Flow</th>
                  <th>Category</th>
                  <th>Amount (₹)</th>
                  <th>Party / Source</th>
                  <th>Payment Mode</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                ${txns.length === 0 ? `
                  <tr>
                    <td colspan="8" style="text-align:center; padding:44px 20px; color:var(--text-muted);">
                      <div style="font-size:32px; margin-bottom:10px;">🏦</div>
                      <div style="font-weight:700; font-size:15px; color:var(--text-secondary);">No cash movements recorded yet</div>
                      <div style="font-size:12px; margin-top:4px;">Record customer token advances, margin payments, or bank loan credits.</div>
                      <button class="quick-action-btn btn-sm btn-primary" style="margin:14px auto 0;" onclick="document.getElementById('openAddCashTxnBtn')?.click()">
                        ${renderIcon('plus')} Record Movement
                      </button>
                    </td>
                  </tr>
                ` : txns.map(t => `
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
      if (typeof showToast === 'function') {
        showToast('Analytics summary exported as CSV spreadsheet', 'success', 'Export Complete');
      }
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

    renderVillageMapHTML() {
      const leads = store.getLeads();
      if (leads.length === 0) {
        return `
          <div class="panel-card" style="text-align:center; padding:50px 20px;">
            <div style="font-size:36px; margin-bottom:12px;">🗺️</div>
            <h3 style="font-size:18px; font-weight:800; color:var(--text-primary);">No Village Enquiries Mapped Yet</h3>
            <p style="font-size:13px; color:var(--text-secondary); max-width:480px; margin:8px auto 20px;">
              As you record customer leads with their respective village names, this territory intelligence dashboard will automatically cluster demand, identify dominant regional crops, and optimize field demonstration routes.
            </p>
            <button class="quick-action-btn btn-primary" style="margin:0 auto;" onclick="window.app.openNewLeadModal()">
              ${renderIcon('plus')} Register First Customer Lead
            </button>
          </div>
        `;
      }

      const villageCounts = {};
      for (const l of leads) {
        const v = l.village || 'Sadar / Town';
        villageCounts[v] = (villageCounts[v] || 0) + 1;
      }
      const sorted = Object.entries(villageCounts).sort((a, b) => b[1] - a[1]);
      const maxCount = sorted.length > 0 ? sorted[0][1] : 1;
      const topVillage = sorted[0][0];
      const topCount = sorted[0][1];
      const villageLeads = leads.filter(l => (l.village || 'Sadar / Town') === topVillage);
      const crops = Array.from(new Set(villageLeads.flatMap(l => l.crops || []))).slice(0, 4).join(', ') || 'Mixed Crops';
      const avgBudget = villageLeads.length > 0 ? Math.round(villageLeads.reduce((s, l) => s + Number(l.budgetMax || 0), 0) / villageLeads.length) : 800000;

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
              ${sorted.map(([vName, count]) => {
                const widthPct = Math.round((count / maxCount) * 100);
                return `
                  <div class="village-bar-item">
                    <div class="village-name">${vName}</div>
                    <div class="village-bar-wrap">
                      <div class="village-bar-fill" style="width:${Math.max(12, widthPct)}%;">
                        ${count} Leads
                      </div>
                    </div>
                    <div class="village-stats">${count >= 2 ? '🔥 Hot Cluster' : 'Active'}</div>
                  </div>
                `;
              }).join('')}
            </div>

            <div style="margin-top:24px; padding:16px; background:var(--bg-main); border-radius:var(--radius-md); border:1px solid var(--border-color);">
              <div style="font-size:13px; font-weight:800; margin-bottom:6px;">Territory Route Planning:</div>
              <p style="font-size:12px; color:var(--text-secondary); line-height:1.4;">
                <strong>Village ${topVillage}</strong> has the highest concentration of enquiries (${topCount} farmer leads). Prioritize your field demonstration trolley route through Village ${topVillage} this week.
              </p>
            </div>
          </div>

          <div class="panel-card">
            <div class="panel-header">
              <div class="panel-title">Cluster Profile: Village ${topVillage}</div>
            </div>
            <div style="display:flex; flex-direction:column; gap:12px; font-size:13px;">
              <div style="display:flex; justify-content:space-between; padding-bottom:6px; border-bottom:1px solid var(--border-subtle);">
                <span style="color:var(--text-secondary);">Active Leads:</span>
                <strong style="color:var(--primary);">${topCount} Farmers</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding-bottom:6px; border-bottom:1px solid var(--border-subtle);">
                <span style="color:var(--text-secondary);">Dominant Crops:</span>
                <strong>${crops}</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding-bottom:6px; border-bottom:1px solid var(--border-subtle);">
                <span style="color:var(--text-secondary);">Average Farmer Budget:</span>
                <strong>₹${(avgBudget / 100000).toFixed(2)} Lakh</strong>
              </div>
            </div>

            <div style="margin-top:20px;">
              <button class="quick-action-btn btn-primary" style="width:100%; justify-content:center;" onclick="showToast('Demonstration route planned for Village ${topVillage}!', 'info', 'Demo Tour Planned')">
                ${renderIcon('calendar')} Plan Demonstration Tour
              </button>
            </div>
          </div>
        </div>
      `;
    }

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
        const userDiv = document.createElement('div');
        userDiv.className = 'ai-bubble user';
        userDiv.textContent = questionText;
        container.appendChild(userDiv);

        const reply = queryBusinessAdvisor(questionText);
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
        pill.addEventListener('click', () => handleQuery(pill.dataset.prompt));
      });
    }

    openNewLeadModal() {
      // populate tractor models
      const modelSelect = document.getElementById('nlModelSelect');
      if (modelSelect) {
        const tractors = store.getTractors();
        modelSelect.innerHTML = `<option value="">-- Select Tractor Model (Optional) --</option>` +
          tractors.map(t => `<option value="${t.id}">${t.brand} ${t.model} (₹${(t.price / 100000).toFixed(2)}L)</option>`).join('');
      }

      // bind suggest score button
      const calcScoreBtn = document.getElementById('nlCalcScoreBtn');
      if (calcScoreBtn) {
        calcScoreBtn.onclick = () => {
          const tempLead = {
            expectedPurchaseDays: Number(document.getElementById('nlDays').value) || null,
            financeRequired: document.getElementById('nlFinance').value === 'Yes',
            exchangeWanted: document.getElementById('nlExchange').value === 'Yes'
          };
          const suggested = suggestLeadBuyingScore(tempLead);
          document.getElementById('nlScore').value = suggested.score;
          showToast(`Suggested Score: ${suggested.score}/100 (${suggested.category}). You can adjust it anytime!`, 'info', 'Score Suggestion');
        };
      }

      this.openModal('newLeadModal');
      const form = document.getElementById('newLeadForm');
      if (form) {
        form.onsubmit = (e) => {
          e.preventDefault();
          const name = document.getElementById('nlName').value.trim() || 'Farmer Customer';
          const phone = document.getElementById('nlPhone').value.trim();
          const village = document.getElementById('nlVillage').value.trim();
          const acresVal = document.getElementById('nlAcres').value.trim();
          const acres = acresVal ? Number(acresVal) : null;
          const cropVal = document.getElementById('nlCrop') ? document.getElementById('nlCrop').value.trim() : '';
          const crop = cropVal ? cropVal.split(',').map(c => c.trim()).filter(Boolean) : [];
          const soilType = document.getElementById('nlSoilType') ? document.getElementById('nlSoilType').value.trim() : '';
          const currentTractor = document.getElementById('nlCurrentTractor') ? document.getElementById('nlCurrentTractor').value.trim() : '';
          const modelId = document.getElementById('nlModelSelect').value || null;
          const budgetVal = document.getElementById('nlBudget').value.trim();
          const budget = budgetVal ? Number(budgetVal) : null;
          const financeVal = document.getElementById('nlFinance').value;
          const finance = financeVal === 'Yes' ? true : (financeVal === 'No' ? false : null);
          const exchangeVal = document.getElementById('nlExchange').value;
          const exchange = exchangeVal === 'Yes' ? true : (exchangeVal === 'No' ? false : null);
          const daysVal = document.getElementById('nlDays').value;
          const days = daysVal ? Number(daysVal) : null;
          const scoreVal = document.getElementById('nlScore') ? document.getElementById('nlScore').value.trim() : '';
          const buyingScore = scoreVal !== '' ? Math.max(0, Math.min(100, Number(scoreVal))) : null;
          const nextAction = document.getElementById('nlNextAction') ? document.getElementById('nlNextAction').value.trim() : '';

          const newLead = store.addLead({
            name,
            phone,
            village,
            landAcres: acres,
            crops: crop,
            soilType,
            currentTractor,
            interestedModelId: modelId,
            budgetMax: budget,
            financeRequired: finance,
            exchangeWanted: exchange,
            expectedPurchaseDays: days,
            buyingScore,
            userSetScore: buyingScore !== null,
            nextAction,
            stage: 'New Enquiry'
          });

          form.reset();
          this.closeAllModals();
          showToast(`Lead for <strong>${newLead.name}</strong> saved! ${buyingScore !== null ? `Score: <strong>${buyingScore}/100</strong>` : 'Score: <em>Not Set (Editable)</em>'}`, 'success', 'Lead Captured');
        };
      }
    }

    setQuickScore(val) {
      const input = document.getElementById('qsScoreInput');
      const slider = document.getElementById('qsSlider');
      const badge = document.getElementById('qsScoreBadge');
      if (input) input.value = val;
      if (slider) slider.value = val === '' ? 50 : val;
      if (badge) {
        if (val === '') {
          badge.className = 'badge';
          badge.textContent = 'No Score';
          badge.style.background = '#f1f5f9';
          badge.style.color = '#64748b';
        } else {
          const num = Number(val);
          const cat = num >= 75 ? 'HOT' : (num >= 50 ? 'WARM' : 'COLD');
          badge.className = `badge ${cat === 'HOT' ? 'badge-hot' : (cat === 'WARM' ? 'badge-warm' : 'badge-cold')}`;
          badge.textContent = `${cat} (${num}/100)`;
        }
      }
    }

    openScoreModal(leadId) {
      const lead = store.getLeads().find(l => l.id === leadId);
      if (!lead) return;

      const leadIdEl = document.getElementById('qsLeadId');
      const nameEl = document.getElementById('qsLeadName');
      const infoEl = document.getElementById('qsLeadInfo');
      const input = document.getElementById('qsScoreInput');
      const slider = document.getElementById('qsSlider');
      const actionInput = document.getElementById('qsNextAction');

      if (leadIdEl) leadIdEl.value = lead.id;
      if (nameEl) nameEl.textContent = lead.name || 'Farmer Customer';
      if (infoEl) infoEl.textContent = `Village: ${lead.village || 'Not specified'} | Contact: ${lead.phone || 'Not specified'}`;
      if (actionInput) actionInput.value = lead.nextAction || '';

      const currentScore = (lead.buyingScore !== undefined && lead.buyingScore !== null && lead.buyingScore !== '') ? Number(lead.buyingScore) : '';
      this.setQuickScore(currentScore);

      if (input && slider) {
        input.oninput = () => {
          const val = input.value.trim();
          if (val === '') {
            this.setQuickScore('');
          } else {
            const clamped = Math.max(0, Math.min(100, Number(val)));
            this.setQuickScore(clamped);
          }
        };
        slider.oninput = () => {
          this.setQuickScore(slider.value);
        };
      }

      const suggestBtn = document.getElementById('qsSuggestBtn');
      if (suggestBtn) {
        suggestBtn.onclick = () => {
          const sug = suggestLeadBuyingScore(lead);
          this.setQuickScore(sug.score);
          showToast(`Suggested Score: ${sug.score}/100 (${sug.category})`, 'info', 'Algorithm Suggestion');
        };
      }

      const form = document.getElementById('quickScoreForm');
      if (form) {
        form.onsubmit = (e) => {
          e.preventDefault();
          const rawScore = document.getElementById('qsScoreInput').value.trim();
          const newScore = rawScore !== '' ? Math.max(0, Math.min(100, Number(rawScore))) : null;
          const nextAct = document.getElementById('qsNextAction').value.trim();

          store.updateLead(lead.id, {
            buyingScore: newScore,
            userSetScore: newScore !== null,
            nextAction: nextAct
          });

          this.closeAllModals();
          showToast(`Score updated for <strong>${lead.name}</strong>!`, 'success', 'Score Saved');
        };
      }

      this.openModal('quickScoreModal');
    }

    openEditLeadModal(leadId) {
      const lead = store.getLeads().find(l => l.id === leadId);
      if (!lead) return;

      const tractors = store.getTractors();
      const modelSelect = document.getElementById('elModelSelect');
      if (modelSelect) {
        modelSelect.innerHTML = `<option value="">-- Select Tractor Model (Optional) --</option>` +
          tractors.map(t => `<option value="${t.id}">${t.brand} ${t.model} (₹${(t.price / 100000).toFixed(2)}L)</option>`).join('');
      }

      document.getElementById('elLeadId').value = lead.id;
      document.getElementById('elName').value = lead.name || '';
      document.getElementById('elPhone').value = lead.phone || '';
      document.getElementById('elVillage').value = lead.village || '';
      document.getElementById('elAcres').value = (lead.landAcres !== null && lead.landAcres !== undefined) ? lead.landAcres : '';
      if (document.getElementById('elCrop')) {
        document.getElementById('elCrop').value = (lead.crops && lead.crops.length > 0) ? lead.crops.join(', ') : '';
      }
      if (document.getElementById('elSoilType')) {
        document.getElementById('elSoilType').value = lead.soilType || '';
      }
      document.getElementById('elCurrentTractor').value = lead.currentTractor || '';
      if (modelSelect) modelSelect.value = lead.interestedModelId || '';
      document.getElementById('elBudget').value = (lead.budgetMax !== null && lead.budgetMax !== undefined) ? lead.budgetMax : '';
      document.getElementById('elStage').value = lead.stage || 'New Enquiry';
      document.getElementById('elFinance').value = lead.financeRequired === true ? 'Yes' : (lead.financeRequired === false ? 'No' : '');
      document.getElementById('elExchange').value = lead.exchangeWanted === true ? 'Yes' : (lead.exchangeWanted === false ? 'No' : '');
      document.getElementById('elScore').value = (lead.buyingScore !== null && lead.buyingScore !== undefined) ? lead.buyingScore : '';
      document.getElementById('elNextAction').value = lead.nextAction || '';

      const form = document.getElementById('editLeadForm');
      if (form) {
        form.onsubmit = (e) => {
          e.preventDefault();
          const name = document.getElementById('elName').value.trim() || 'Farmer Customer';
          const phone = document.getElementById('elPhone').value.trim();
          const village = document.getElementById('elVillage').value.trim();
          const acresVal = document.getElementById('elAcres').value.trim();
          const acres = acresVal ? Number(acresVal) : null;
          const cropVal = document.getElementById('elCrop') ? document.getElementById('elCrop').value.trim() : '';
          const crop = cropVal ? cropVal.split(',').map(c => c.trim()).filter(Boolean) : (lead.crops || []);
          const soilType = document.getElementById('elSoilType') ? document.getElementById('elSoilType').value.trim() : (lead.soilType || '');
          const currentTractor = document.getElementById('elCurrentTractor').value.trim();
          const modelId = document.getElementById('elModelSelect').value || null;
          const budgetVal = document.getElementById('elBudget').value.trim();
          const budget = budgetVal ? Number(budgetVal) : null;
          const stage = document.getElementById('elStage').value;
          const financeVal = document.getElementById('elFinance').value;
          const finance = financeVal === 'Yes' ? true : (financeVal === 'No' ? false : null);
          const exchangeVal = document.getElementById('elExchange').value;
          const exchange = exchangeVal === 'Yes' ? true : (exchangeVal === 'No' ? false : null);
          const scoreVal = document.getElementById('elScore').value.trim();
          const buyingScore = scoreVal !== '' ? Math.max(0, Math.min(100, Number(scoreVal))) : null;
          const nextAction = document.getElementById('elNextAction').value.trim();

          store.updateLead(lead.id, {
            name,
            phone,
            village,
            landAcres: acres,
            crops: crop,
            soilType,
            currentTractor,
            interestedModelId: modelId,
            budgetMax: budget,
            stage,
            financeRequired: finance,
            exchangeWanted: exchange,
            buyingScore,
            userSetScore: buyingScore !== null,
            nextAction
          });

          this.closeAllModals();
          showToast(`Customer lead for <strong>${name}</strong> updated successfully!`, 'success', 'Lead Updated');
        };
      }

      this.openModal('editLeadModal');
    }

    openEditTractorModal(tractorId) {
      const tractor = store.getTractors().find(t => t.id === tractorId);
      if (!tractor) return;

      document.getElementById('etTractorId').value = tractor.id;
      document.getElementById('etBrand').value = tractor.brand || 'VST Zetor';
      document.getElementById('etModel').value = tractor.model || '';
      document.getElementById('etHp').value = tractor.hp || 45;
      document.getElementById('etPtoHp').value = tractor.ptoHp || 40;
      document.getElementById('etDrive').value = tractor.drive || '2WD';
      document.getElementById('etLift').value = tractor.liftCapacityKg || tractor.liftCapacity || 1800;
      document.getElementById('etPrice').value = tractor.price || 750000;
      document.getElementById('etCost').value = tractor.dealerPurchaseCost || tractor.dealerCost || 675000;
      document.getElementById('etStock').value = tractor.stockCount || 0;
      document.getElementById('etWarranty').value = tractor.warranty || '6 Years / 6000 Hours Warranty';

      const form = document.getElementById('editTractorForm');
      if (form) {
        form.onsubmit = (e) => {
          e.preventDefault();
          const brand = document.getElementById('etBrand').value.trim() || 'VST Zetor';
          const model = document.getElementById('etModel').value.trim();
          const hp = Number(document.getElementById('etHp').value) || 45;
          const ptoHp = Number(document.getElementById('etPtoHp').value) || 40;
          const drive = document.getElementById('etDrive').value || '2WD';
          const liftCapacityKg = Number(document.getElementById('etLift').value) || 1800;
          const price = Number(document.getElementById('etPrice').value) || 750000;
          const dealerPurchaseCost = Number(document.getElementById('etCost').value) || 675000;
          const stockCount = Number(document.getElementById('etStock').value) || 0;
          const warranty = document.getElementById('etWarranty').value.trim();

          store.updateTractor(tractor.id, {
            brand,
            model,
            hp,
            ptoHp,
            drive,
            liftCapacityKg,
            liftCapacity: liftCapacityKg,
            price,
            dealerPurchaseCost,
            dealerCost: dealerPurchaseCost,
            stockCount,
            warranty,
            status: stockCount > 0 ? 'In Stock' : 'Available to Order'
          });

          this.closeAllModals();
          showToast(`Tractor <strong>${brand} ${model}</strong> updated successfully!`, 'success', 'Inventory Updated');
        };
      }

      this.openModal('editTractorModal');
    }

    getExpenseCategoryBadge(cat) {
      const map = {
        'Customer & Tea/Food': { bg: 'rgba(245,158,11,0.15)', color: '#b45309', border: 'rgba(245,158,11,0.3)', icon: '☕' },
        'Repairs & PDI': { bg: 'rgba(5,150,105,0.15)', color: '#047857', border: 'rgba(5,150,105,0.3)', icon: '🔧' },
        'Fuel': { bg: 'rgba(217,119,6,0.15)', color: '#9a3412', border: 'rgba(217,119,6,0.3)', icon: '⛽' },
        'Transport': { bg: 'rgba(37,99,235,0.15)', color: '#1d4ed8', border: 'rgba(37,99,235,0.3)', icon: '🚛' },
        'Salaries': { bg: 'rgba(219,39,119,0.15)', color: '#be185d', border: 'rgba(219,39,119,0.3)', icon: '👥' },
        'Showroom Rent': { bg: 'rgba(124,58,237,0.15)', color: '#6d28d9', border: 'rgba(124,58,237,0.3)', icon: '🏢' },
        'Advertising': { bg: 'rgba(234,88,12,0.15)', color: '#c2410c', border: 'rgba(234,88,12,0.3)', icon: '📢' },
        'Electricity': { bg: 'rgba(8,145,178,0.15)', color: '#0e7490', border: 'rgba(8,145,178,0.3)', icon: '⚡' },
        'Miscellaneous': { bg: 'rgba(100,116,139,0.15)', color: '#475569', border: 'rgba(100,116,139,0.3)', icon: '📦' }
      };
      return map[cat] || { bg: 'rgba(100,116,139,0.15)', color: '#475569', border: 'rgba(100,116,139,0.3)', icon: '💸' };
    }

    openFastExpenseModal() {
      this.openModal('fastExpenseModal');
      const form = document.getElementById('fastExpenseForm');
      const notesInput = document.getElementById('feNotes');
      const paidToInput = document.getElementById('fePaidTo');
      const catSelect = document.getElementById('feCategory');
      const autoBadge = document.getElementById('feAutoCategoryBadge');

      let userChangedCategory = false;
      if (catSelect) {
        catSelect.onchange = () => {
          userChangedCategory = true;
          if (autoBadge) autoBadge.style.display = 'none';
        };
      }

      const checkAutoCategory = () => {
        if (userChangedCategory) return;
        const text = `${notesInput?.value || ''} ${paidToInput?.value || ''}`.trim();
        const detected = autoDetectExpenseCategory(text, '');
        if (detected && catSelect) {
          catSelect.value = detected;
          if (autoBadge) {
            autoBadge.style.display = 'inline-flex';
            autoBadge.textContent = `✨ Auto-allocated: ${detected}`;
          }
        } else if (!userChangedCategory && !text && autoBadge) {
          autoBadge.style.display = 'none';
        }
      };

      if (notesInput) notesInput.oninput = checkAutoCategory;
      if (paidToInput) paidToInput.oninput = checkAutoCategory;
      if (autoBadge) autoBadge.style.display = 'none';

      if (form) {
        form.onsubmit = (e) => {
          e.preventDefault();
          const amount = Number(document.getElementById('feAmount').value) || 0;
          const rawPaidTo = document.getElementById('fePaidTo').value.trim();
          const notes = document.getElementById('feNotes').value.trim();
          const chassisTag = document.getElementById('feChassisTag').value.trim() || null;
          const paymentMode = document.getElementById('feMode').value || 'Cash';

          let category = document.getElementById('feCategory').value;
          const textForDetection = `${notes} ${rawPaidTo}`.trim();
          const autoCat = autoDetectExpenseCategory(textForDetection, '');
          if (autoCat && (!category || category === 'Miscellaneous' || !userChangedCategory)) {
            category = autoCat;
          }

          let paidTo = rawPaidTo;
          if (!paidTo) {
            if (category === 'Customer & Tea/Food') paidTo = 'Tea Vendor / Counter';
            else if (category === 'Repairs & PDI') paidTo = 'Service Workshop';
            else paidTo = 'Vendor / Counter';
          }

          store.addExpense({ amount, category, paymentMode, paidTo, chassisTag, notes });
          this.closeAllModals();
          if (amount >= 5000) {
            showToast(`Expense of ₹${amount.toLocaleString('en-IN')} [${category}] logged! Pending manager approval (≥ ₹5,000).`, 'warning', 'Pending Approval');
          } else {
            showToast(`Expense of ₹${amount.toLocaleString('en-IN')} [${category}] logged and auto-approved!`, 'success', 'Expense Recorded');
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
            <span style="font-size:12px; color:var(--text-secondary);">Phone: ${lead.phone} | Village: ${lead.village}</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:16px;">
            ${sequences.map(seq => {
              let cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
              if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
              const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(seq.body)}`;
              return `
                <div style="border:1px solid var(--border-color); border-radius:var(--radius-md); padding:14px; background:var(--bg-main);">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span class="badge badge-info">${seq.title}</span>
                    <a href="${waUrl}" target="_blank" class="quick-action-btn btn-sm btn-whatsapp">
                      ${renderIcon('whatsapp')} Send on WhatsApp
                    </a>
                  </div>
                  <textarea readonly style="width:100%; height:85px; font-size:12px; font-family:inherit; padding:8px; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:#fff; resize:none;">${seq.body}</textarea>
                </div>
              `;
            }).join('')}
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
          <div style="margin-bottom:16px;">
            <h4 style="font-size:18px; font-weight:800; color:var(--primary-dark);">${t.brand} ${t.model} Unit Economics</h4>
            <p style="font-size:12px; color:var(--text-secondary);">True unit landed cost vs retail margin</p>
          </div>
          <div style="background:var(--bg-main); border-radius:var(--radius-lg); padding:16px; margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; font-size:13.5px; padding:4px 0;">
              <span>Retail Selling Price:</span>
              <span style="font-weight:800; color:var(--primary);">₹${unitEcon.sellingPrice.toLocaleString('en-IN')}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:13.5px; padding:4px 0;">
              <span>OEM Landed Purchase Cost:</span>
              <span style="font-weight:700;">-₹${unitEcon.purchaseCost.toLocaleString('en-IN')}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:13.5px; padding:4px 0; color:var(--danger);">
              <span>Direct Freight & PDI Prep Expenses:</span>
              <span style="font-weight:700;">-₹${unitEcon.directExpensesTotal.toLocaleString('en-IN')}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:16px; padding:8px 0; font-weight:900; color:var(--success); border-top:2px solid var(--border-color);">
              <span>True Dealer Unit Profit:</span>
              <span>₹${unitEcon.actualMargin.toLocaleString('en-IN')} (${unitEcon.marginPercent}%)</span>
            </div>
          </div>
        `;
      }
      this.openModal('unitMarginModal');
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

          store.addDemo({ leadName, village, tractorModel, implement, demoDate, salesman });
          this.closeAllModals();
          showToast(`Field demo with ${tractorModel} scheduled for ${leadName} on ${demoDate}!`, 'success', 'Demo Scheduled');
        };
      }
    }

    openGatePassModal() {
      this.openModal('gatePassModal');
      const tractorSelect = document.getElementById('gpTractorSelect');
      if (tractorSelect) {
        const tractors = store.getTractors();
        if (tractors.length > 0) {
          tractorSelect.innerHTML = tractors.map(t => `<option value="${t.brand} ${t.model} (${t.hp} HP)">${t.brand} ${t.model} (${t.hp} HP) - Stock: ${t.stockCount || 0}</option>`).join('');
        }
      }
      const form = document.getElementById('gatePassForm');
      if (form) {
        form.onsubmit = (e) => {
          e.preventDefault();
          const customer = document.getElementById('gpCustomer').value.trim() || 'Customer';
          const phone = document.getElementById('gpPhone').value.trim() || '-';
          const village = document.getElementById('gpVillage').value.trim() || 'Local Area';
          const model = document.getElementById('gpTractorSelect').value || (store.getTractors()[0] ? `${store.getTractors()[0].brand} ${store.getTractors()[0].model}` : 'VST Zetor 5011 4WD');
          const chassis = document.getElementById('gpChassis').value.trim() || ('VZ-' + Date.now().toString().slice(-6));
          const engine = document.getElementById('gpEngine').value.trim() || ('ENG-' + Date.now().toString().slice(-6));
          const battery = document.getElementById('gpBattery').value.trim() || 'Standard Battery';
          const bank = document.getElementById('gpBank').value.trim() || 'Cash / Self';

          this.closeAllModals();
          const previewBox = document.getElementById('quotePrintPreviewBody') || document.getElementById('billPreviewBody');
          if (previewBox) {
            const info = store.getSettings();
            previewBox.innerHTML = `
              <div class="quote-sheet">
                <div class="quote-header">
                  <div class="quote-brand">
                    <h2>${info.name}</h2>
                    <p>${info.tagline}</p>
                    <p>${info.address}</p>
                    <p>GSTIN: ${info.gstin} | Phone: ${info.phone}</p>
                  </div>
                  <div class="quote-meta">
                    <h3 style="font-size:16px; font-weight:800; color:var(--primary);">VEHICLE DELIVERY GATE PASS</h3>
                    <p><strong>Challan #:</strong> MDE/GP/${Date.now().toString().slice(-6)}</p>
                    <p><strong>Date:</strong> ${new Date().toISOString().split('T')[0]}</p>
                    <p><strong>Status:</strong> Handover Approved</p>
                  </div>
                </div>

                <div class="quote-parties">
                  <div>
                    <strong>Delivered To (Customer):</strong><br>
                    <span style="font-size:14px; font-weight:700;">${customer}</span><br>
                    Village: ${village}<br>
                    Contact: ${phone}
                  </div>
                  <div>
                    <strong>Financial Hypothecation:</strong><br>
                    Bank / Financier: <strong>${bank}</strong><br>
                    PDI Inspection: Passed 100% OK
                  </div>
                </div>

                <table class="quote-table">
                  <thead>
                    <tr>
                      <th>Vehicle Parameter</th>
                      <th>Verified Showroom Identification</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td><strong>Tractor Model</strong></td><td>${model}</td></tr>
                    <tr><td><strong>Chassis Number</strong></td><td><code style="font-size:13px; font-weight:700;">${chassis}</code></td></tr>
                    <tr><td><strong>Engine Number</strong></td><td><code style="font-size:13px; font-weight:700;">${engine}</code></td></tr>
                    <tr><td><strong>Battery Serial Number</strong></td><td>${battery}</td></tr>
                    <tr><td><strong>Transit Diesel Filled</strong></td><td>10.0 Litres (Complimentary)</td></tr>
                  </tbody>
                </table>

                <div style="margin-top:16px; padding:12px; background:#f9fafb; border-radius:6px; font-size:12px;">
                  <strong>Customer Delivery Acknowledgment:</strong><br>
                  I hereby confirm that I have taken delivery of the above described tractor along with 2 ignition keys, standard toolkit, owner's manual, top link, and warranty card in satisfactory working condition after complete showroom trial and explanation of operations.
                </div>

                <div class="quote-signatures" style="margin-top:36px;">
                  <div class="sign-line">Customer Signature / Thumb</div>
                  <div class="sign-line">Showroom Delivery In-Charge<br><strong>Maa Durga Engineering</strong></div>
                </div>
              </div>
            `;
          }
          this.openModal('billPreviewModal');
        };
      }
    }

    openBackupModal() {
      this.openModal('backupModal');
      const dlBtn = document.getElementById('downloadBackupBtn');
      if (dlBtn) {
        dlBtn.onclick = () => {
          const backupData = {
            exportDate: new Date().toISOString(),
            showroom: store.getSettings(),
            tractors: store.getTractors(),
            leads: store.getLeads(),
            expenses: store.getExpenses(),
            cashTxns: store.getCashTransactions(),
            demos: store.getDemos(),
            quotes: store.getQuotes()
          };
          const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Maa_Durga_Engineering_Backup_${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
        };
      }

      const resetBtn = document.getElementById('resetDataBtn');
      if (resetBtn) {
        resetBtn.onclick = () => {
          if (confirm("Are you sure you want to reset all data back to the clean default seed data? This will clear local changes.")) {
            store.resetToDefault();
            this.closeAllModals();
            showToast("Database reset to clean defaults successfully!", 'info', 'Database Reset');
          }
        };
      }
    }

    toggleLanguage() {
      this.lang = (this.lang === 'hi') ? 'en' : 'hi';
      const btn = document.getElementById('langToggleBtn');
      if (btn) {
        btn.textContent = this.lang === 'hi' ? '🌐 English' : '🌐 हिन्दी';
      }

      // Sidebar Hindi / English translations
      const sidebarTranslations = {
        dashboard: this.lang === 'hi' ? '📊 डैशबोर्ड' : '📊 Dashboard',
        leads: this.lang === 'hi' ? '👥 किसान एवं ग्राहक' : '👥 Customers & Leads',
        inventory: this.lang === 'hi' ? '🚜 स्टॉक एवं मुनाफा' : '🚜 Inventory & Margins',
        billing: this.lang === 'hi' ? '🧾 बिलिंग एवं पर्ची (माँ दुर्गा)' : '🧾 Billing & Bills',
        demos: this.lang === 'hi' ? '🚜 फील्ड डेमो ट्रायल' : '🚜 Field Demos',
        expenses: this.lang === 'hi' ? '💸 शोरूम खर्चे' : '💸 Expenses',
        cashflow: this.lang === 'hi' ? '🏦 रोकड़ एवं बैंक' : '🏦 Cash & Bank',
        villageMap: this.lang === 'hi' ? '🗺️ ग्रामीण बिक्री नक्शा' : '🗺️ Village Sales Map',
        aiAdvisor: this.lang === 'hi' ? '🤖 व्यापार सलाहकार' : '🤖 AI Business Advisor'
      };

      document.querySelectorAll('.nav-item-btn').forEach(b => {
        const tab = b.dataset.tab;
        const span = b.querySelector('span:first-of-type');
        if (span && sidebarTranslations[tab]) {
          span.textContent = sidebarTranslations[tab];
        }
      });

      this.switchTab(this.currentTab);
    }

    openLoanDocsModal() {
      this.openModal('loanDocsModal');
      const farmerSelect = document.getElementById('ldFarmerSelect');
      if (farmerSelect) {
        const leads = store.getLeads();
        if (leads.length === 0) {
          farmerSelect.innerHTML = `<option value="">-- No Farmer Leads Saved (Add lead first) --</option>`;
        } else {
          farmerSelect.innerHTML = `<option value="">-- Select Farmer Lead --</option>` +
            leads.map(l => `<option value="${l.name} (${l.village})">${l.name} - ${l.village} [${l.phone}]</option>`).join('');
        }
      }
      const waBtn = document.getElementById('sendLoanChecklistWaBtn');
      if (waBtn) {
        waBtn.onclick = () => {
          const farmer = document.getElementById('ldFarmerSelect').value || "Kisan";
          const bank = document.getElementById('ldBankSelect').value;
          const msg = `Namaskar ${farmer} Ji 🙏\n\nMaa Durga Engineering se Tractor Loan file update:\n\nAapka loan file ${bank} me process ho raha hai. Loan sanction aur delivery teji se pane ke liye kripya yeh baaki documents showroom me jama karein:\n\n1. Khasra / Khatauni (7/12 Land Records certified copy)\n2. Aadhaar & PAN Card self-attested copy\n3. Bank No-Due Certificate (NOC)\n\nSampark: +91 98380 12345 | Maa Durga Engineering`;
          window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
        };
      }
    }

    openAddTractorModal() {
      this.openModal('addTractorModal');
      const form = document.getElementById('addTractorForm');
      if (form) {
        form.onsubmit = (e) => {
          e.preventDefault();
          const brand = document.getElementById('ntBrand').value.trim() || 'VST Zetor';
          const model = document.getElementById('ntModel').value.trim() || 'Custom Model';
          const hp = parseInt(document.getElementById('ntHp').value, 10) || 45;
          const ptoHp = parseInt(document.getElementById('ntPtoHp').value, 10) || Math.round(hp * 0.88);
          const drive = document.getElementById('ntDrive').value || '2WD';
          const liftCapacity = parseInt(document.getElementById('ntLift').value, 10) || 1800;
          const price = parseFloat(document.getElementById('ntPrice').value) || 750000;
          const dealerCost = parseFloat(document.getElementById('ntCost').value) || 675000;
          const stockCount = parseInt(document.getElementById('ntStock').value, 10) || 1;
          const chassis = document.getElementById('ntChassis').value.trim();

          const chassisList = chassis ? [chassis] : [];

          store.addTractor({
            brand,
            model,
            hp,
            ptoHp,
            drive,
            liftCapacity,
            price,
            dealerCost,
            stockCount,
            chassisList,
            status: stockCount > 0 ? "In Stock" : "Available to Order",
            badge: stockCount > 0 ? "In Stock" : "Order Ready"
          });

          form.reset();
          this.closeAllModals();
          this.switchTab('dashboard');
          showToast(`Tractor model ${brand} ${model} added to inventory!`, 'success', 'Inventory Updated');
        };
      }
    }
  }

  // Initialize application
  function initTractorOS() {
    if (typeof window !== 'undefined') {
      window.TractorOSApp = TractorOSApp;
      window.app = new TractorOSApp();
      return window.app;
    }
  }

  if (typeof window !== 'undefined') {
    window.initTractorOS = initTractorOS;
    window.TractorOSApp = TractorOSApp;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        if (!window.app) initTractorOS();
      });
    } else {
      if (!window.app) initTractorOS();
    }
  }
})();

export const TractorOSApp = typeof window !== 'undefined' ? window.TractorOSApp : null;
export function initTractorOS() {
  if (typeof window !== 'undefined' && window.initTractorOS) {
    return window.initTractorOS();
  }
}
