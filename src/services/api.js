// Unified REST API Client for Maa Durga Engineering OS
const API_BASE = '/api';

async function fetchJson(url, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (err) {
    console.warn(`API call failed for ${url}, falling back to localStorage:`, err);
    return null;
  }
}

export const api = {
  // Bills & Maa Durga Diesel Cash Memo
  bills: {
    getAll: () => fetchJson('/bills'),
    getNextNumber: async () => {
      try {
        const res = await fetch(`${API_BASE}/bills/next-number`);
        const data = await res.json();
        return data.nextNumber || '21';
      } catch (e) {
        return '21';
      }
    },
    save: (billData) => fetchJson('/bills', { method: 'POST', body: JSON.stringify(billData) }),
    delete: (id) => fetchJson(`/bills/${id}`, { method: 'DELETE' })
  },

  // CRM Leads
  leads: {
    getAll: () => fetchJson('/leads'),
    create: (lead) => fetchJson('/leads', { method: 'POST', body: JSON.stringify(lead) }),
    update: (id, updates) => fetchJson(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    delete: (id) => fetchJson(`/leads/${id}`, { method: 'DELETE' })
  },

  // Tractor Catalog & Inventory
  tractors: {
    getAll: () => fetchJson('/tractors'),
    update: (id, updates) => fetchJson(`/tractors/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    add: (tractor) => fetchJson('/tractors', { method: 'POST', body: JSON.stringify(tractor) }),
    getUnitEconomics: (id) => fetchJson(`/tractors/${id}/unit-economics`)
  },

  // Showroom Expenses
  expenses: {
    getAll: () => fetchJson('/expenses'),
    create: (exp) => fetchJson('/expenses', { method: 'POST', body: JSON.stringify(exp) }),
    delete: (id) => fetchJson(`/expenses/${id}`, { method: 'DELETE' })
  },

  // Cash Ledger & Financial Snapshot
  cashflow: {
    getAll: () => fetchJson('/cashflow'),
    create: (txn) => fetchJson('/cashflow', { method: 'POST', body: JSON.stringify(txn) }),
    getSnapshot: () => fetchJson('/cashflow/snapshot')
  },

  // Field Demos
  demos: {
    getAll: () => fetchJson('/demos'),
    create: (demo) => fetchJson('/demos', { method: 'POST', body: JSON.stringify(demo) }),
    update: (id, updates) => fetchJson(`/demos/${id}`, { method: 'PUT', body: JSON.stringify(updates) })
  },

  // Dealership Settings
  settings: {
    get: () => fetchJson('/settings'),
    update: (settings) => fetchJson('/settings', { method: 'PUT', body: JSON.stringify(settings) })
  },

  // AI Business Advisor
  ai: {
    query: (question) => fetchJson('/ai/query', { method: 'POST', body: JSON.stringify({ question }) })
  }
};
