// LocalStorage Data Store & State Management for Maa Durga Engineering OS
import {
  SHOWROOM_INFO,
  DEFAULT_TRACTORS,
  DEFAULT_LEADS,
  DEFAULT_EXPENSES,
  DEFAULT_CASH_TRANSACTIONS,
  DEFAULT_DEMOS,
  DEFAULT_QUOTES
} from './data.js';

const STORAGE_KEYS = {
  TRACTORS: 'mde_tractors_prod_v3',
  LEADS: 'mde_leads_prod_v2',
  EXPENSES: 'mde_expenses_prod_v2',
  CASH_TXNS: 'mde_cash_txns_prod_v2',
  DEMOS: 'mde_demos_prod_v2',
  QUOTES: 'mde_quotes_prod_v2',
  SETTINGS: 'mde_settings_prod_v3'
};

class DealershipStore {
  constructor() {
    this.subscribers = new Set();
    this.init();
  }

  init() {
    try {
      // Purge old pre-production keys so browser gets 100% clean slate
      const oldKeys = Object.keys(localStorage).filter(k => k.startsWith('mde_') && !k.includes('_prod_v2') && !k.includes('_prod_v3'));
      for (const k of oldKeys) {
        localStorage.removeItem(k);
      }
      // Purge previous v2 tractor key if present to upgrade immediately to VST Zetor
      if (localStorage.getItem('mde_tractors_prod_v2')) {
        localStorage.removeItem('mde_tractors_prod_v2');
      }
    } catch (e) {
      console.warn("Storage cleanup notice:", e);
    }

    try {
      const storedTractors = localStorage.getItem(STORAGE_KEYS.TRACTORS);
      // Auto-migrate if empty or if storing legacy non-VST models
      if (!storedTractors || !storedTractors.includes('VST Zetor')) {
        localStorage.setItem(STORAGE_KEYS.TRACTORS, JSON.stringify(DEFAULT_TRACTORS));
      }
    } catch (e) {
      console.warn("Storage write notice:", e);
    }

    if (!localStorage.getItem(STORAGE_KEYS.LEADS)) {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(DEFAULT_LEADS));
    } else {
      // Clean up any legacy accidental mock fallbacks on leads created previously
      try {
        const storedLeads = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS) || '[]');
        let changed = false;
        storedLeads.forEach(l => {
          if (l.village === 'Local Area') { l.village = ''; changed = true; }
          if (l.phone === '-') { l.phone = ''; changed = true; }
          if (l.crops && l.crops.length === 2 && l.crops[0] === 'Wheat' && l.crops[1] === 'Paddy' && l.landAcres === 5 && l.budgetMax === 750000 && !l.soilType) {
            l.crops = [];
            l.landAcres = null;
            l.budgetMax = null;
            changed = true;
          }
          if (l.nextAction === 'Send WhatsApp implement video & personalized EMI calculation.' && !l.interestedModelId) {
            l.nextAction = '';
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(storedLeads));
        }
      } catch (e) {
        console.warn("Lead sanitize notice:", e);
      }
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

    try {
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!storedSettings || !storedSettings.includes('VST Zetor')) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(SHOWROOM_INFO));
      }
    } catch (e) {
      console.warn("Settings storage notice:", e);
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    for (const cb of this.subscribers) {
      try {
        cb();
      } catch (err) {
        console.error("Subscriber notification error:", err);
      }
    }
  }

  // --- Getters ---
  getTractors() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRACTORS)) || [];
    } catch {
      return DEFAULT_TRACTORS;
    }
  }

  getLeads() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS)) || [];
    } catch {
      return DEFAULT_LEADS;
    }
  }

  getExpenses() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES)) || [];
    } catch {
      return DEFAULT_EXPENSES;
    }
  }

  getCashTransactions() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CASH_TXNS)) || [];
    } catch {
      return DEFAULT_CASH_TRANSACTIONS;
    }
  }

  getDemos() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.DEMOS)) || [];
    } catch {
      return DEFAULT_DEMOS;
    }
  }

  getQuotes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.QUOTES)) || [];
    } catch {
      return DEFAULT_QUOTES;
    }
  }

  getSettings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || SHOWROOM_INFO;
    } catch {
      return SHOWROOM_INFO;
    }
  }

  // --- Lead Operations ---
  addLead(leadData) {
    const leads = this.getLeads();
    const newId = `LEAD-${100 + leads.length + 1}`;
    const newLead = {
      id: newId,
      lastContactDate: new Date().toISOString().split('T')[0],
      ...leadData
    };
    leads.unshift(newLead);
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    this.notify();
    return newLead;
  }

  updateLead(leadId, updatedFields) {
    const leads = this.getLeads();
    const index = leads.findIndex(l => l.id === leadId);
    if (index !== -1) {
      leads[index] = { ...leads[index], ...updatedFields };
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
      this.notify();
      return leads[index];
    }
    return null;
  }

  deleteLead(leadId) {
    let leads = this.getLeads();
    leads = leads.filter(l => l.id !== leadId);
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    this.notify();
  }

  // --- Expense Operations ---
  addExpense(expenseData) {
    const expenses = this.getExpenses();
    const newId = `EXP-${800 + expenses.length + 1}`;
    
    // Auto-approval logic: Expenses < ₹5000 auto-approved; >= ₹5000 marked pending manager approval
    const isAutoApproved = expenseData.amount < 5000;
    const newExpense = {
      id: newId,
      date: expenseData.date || new Date().toISOString().split('T')[0],
      status: isAutoApproved ? 'Approved' : 'Pending Approval',
      approvedBy: isAutoApproved ? 'System (< ₹5,000)' : null,
      ...expenseData
    };
    expenses.unshift(newExpense);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));

    // Also record in Cash Flow out if approved immediately
    if (isAutoApproved) {
      this.addCashTransaction({
        date: newExpense.date,
        type: 'OUT',
        category: newExpense.category,
        amount: newExpense.amount,
        party: newExpense.paidTo || 'Expense Vendor',
        mode: newExpense.paymentMode || 'Cash',
        ref: newExpense.id
      });
    }

    this.notify();
    return newExpense;
  }

  approveExpense(expenseId, approverName = 'Showroom Director') {
    const expenses = this.getExpenses();
    const item = expenses.find(e => e.id === expenseId);
    if (item && item.status !== 'Approved') {
      item.status = 'Approved';
      item.approvedBy = approverName;
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
      
      // Post to cash out
      this.addCashTransaction({
        date: new Date().toISOString().split('T')[0],
        type: 'OUT',
        category: item.category,
        amount: item.amount,
        party: item.paidTo || 'Vendor',
        mode: item.paymentMode || 'Bank Transfer',
        ref: item.id
      });

      this.notify();
    }
  }

  deleteExpense(expenseId) {
    let expenses = this.getExpenses();
    expenses = expenses.filter(e => e.id !== expenseId);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    this.notify();
  }

  // --- Cash Transactions ---
  addCashTransaction(txnData) {
    const txns = this.getCashTransactions();
    const newId = `TXN-${300 + txns.length + 1}`;
    const newTxn = {
      id: newId,
      date: txnData.date || new Date().toISOString().split('T')[0],
      ...txnData
    };
    txns.unshift(newTxn);
    localStorage.setItem(STORAGE_KEYS.CASH_TXNS, JSON.stringify(txns));
    this.notify();
    return newTxn;
  }

  // --- Demo Operations ---
  addDemo(demoData) {
    const demos = this.getDemos();
    const newId = `DEMO-${String(demos.length + 1).padStart(2, '0')}`;
    const newDemo = {
      id: newId,
      status: 'Scheduled',
      ...demoData
    };
    demos.unshift(newDemo);
    localStorage.setItem(STORAGE_KEYS.DEMOS, JSON.stringify(demos));
    this.notify();
    return newDemo;
  }

  updateDemo(demoId, updatedFields) {
    const demos = this.getDemos();
    const idx = demos.findIndex(d => d.id === demoId);
    if (idx !== -1) {
      demos[idx] = { ...demos[idx], ...updatedFields };
      localStorage.setItem(STORAGE_KEYS.DEMOS, JSON.stringify(demos));
      this.notify();
      return demos[idx];
    }
    return null;
  }

  // --- Quote Operations ---
  addQuote(quoteData) {
    const quotes = this.getQuotes();
    const quoteNumber = `MDE/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/Q-${100 + quotes.length + 1}`;
    const newQuote = {
      quoteNumber,
      date: new Date().toISOString().split('T')[0],
      ...quoteData
    };
    quotes.unshift(newQuote);
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
    this.notify();
    return newQuote;
  }

  // --- Unit Economics & Tractor Profitability ---
  getTractorUnitEconomics(tractorId, chassisNo = null) {
    const tractors = this.getTractors();
    const tractor = tractors.find(t => t.id === tractorId);
    if (!tractor) return null;

    const expenses = this.getExpenses().filter(e => e.status === 'Approved');
    
    // Find expenses tagged directly to this model or specific chassis
    const matchedExpenses = expenses.filter(e => {
      if (!e.chassisTag) return false;
      if (chassisNo && e.chassisTag === chassisNo) return true;
      return tractor.chassisList && tractor.chassisList.includes(e.chassisTag);
    });

    const directExpensesTotal = matchedExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const purchaseCost = Number(tractor.dealerPurchaseCost || 0);
    const sellingPrice = Number(tractor.price || 0);
    const totalTrueCost = purchaseCost + directExpensesTotal;
    const actualMargin = sellingPrice - totalTrueCost;
    const marginPercent = totalTrueCost > 0 ? ((actualMargin / sellingPrice) * 100).toFixed(1) : 0;

    return {
      tractor,
      chassisNo,
      purchaseCost,
      directExpenses: matchedExpenses,
      directExpensesTotal,
      totalTrueCost,
      sellingPrice,
      actualMargin,
      marginPercent
    };
  }

  // --- Tractor Inventory Operations ---
  addTractor(tractorData) {
    const tractors = this.getTractors();
    const newId = `TRAC-${String(tractors.length + 1).padStart(3, '0')}`;
    const newTractor = {
      id: newId,
      status: Number(tractorData.stockCount) > 0 ? 'In Stock' : 'Available to Order',
      chassisList: tractorData.chassisList || [],
      ...tractorData
    };
    tractors.push(newTractor);
    localStorage.setItem(STORAGE_KEYS.TRACTORS, JSON.stringify(tractors));
    this.notify();
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
    }
  }

  // --- Showroom P&L & Cash Flow Aggregations (100% Dynamic) ---
  getFinancialSnapshot() {
    const quotes = this.getQuotes();
    const expenses = this.getExpenses().filter(e => e.status === 'Approved');
    const cashTxns = this.getCashTransactions();
    const tractors = this.getTractors();

    // Dynamic Sales Revenue: sum of quotes grand totals or cash "IN" from tractor sales/advance
    const quoteRevenue = quotes.reduce((sum, q) => sum + Number(q.grandTotal || 0), 0);
    const cashSalesRevenue = cashTxns
      .filter(t => t.type === 'IN' && (t.category === 'Tractor Sale' || t.category === 'Customer Advance'))
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const salesRevenue = Math.max(quoteRevenue, cashSalesRevenue);

    // Cost of goods sold: tractor purchase costs for quoted units
    let costOfGoodsSold = 0;
    for (const q of quotes) {
      const tr = tractors.find(t => t.id === q.tractorId || t.model === q.tractorModel || (q.tractorName && q.tractorName.includes(t.model)));
      if (tr && tr.dealerPurchaseCost) {
        costOfGoodsSold += Number(tr.dealerPurchaseCost);
      }
    }

    const grossProfit = Math.max(0, salesRevenue - costOfGoodsSold);

    // Itemized operating expenses
    const categoryTotals = {};
    let totalExpenses = 0;
    for (const exp of expenses) {
      const cat = exp.category || 'Other';
      const amt = Number(exp.amount || 0);
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
      totalExpenses += amt;
    }

    const netProfit = grossProfit - totalExpenses;

    // Cash In vs Cash Out
    let cashIn = 0;
    let cashOut = 0;
    for (const txn of cashTxns) {
      const amt = Number(txn.amount || 0);
      if (txn.type === 'IN') cashIn += amt;
      else if (txn.type === 'OUT') cashOut += amt;
    }

    const netCashFlow = cashIn - cashOut;

    return {
      salesRevenue,
      costOfGoodsSold,
      grossProfit,
      totalExpenses,
      netProfit,
      categoryTotals,
      cashIn,
      cashOut,
      netCashFlow
    };
  }

  resetToDefault() {
    localStorage.clear();
    this.init();
    this.notify();
  }
}

export const store = new DealershipStore();
