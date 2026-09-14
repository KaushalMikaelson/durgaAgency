// Cloud-Synced Data Store & State Management for Maa Durga Engineering OS
// Backed by Supabase PostgreSQL with local instant caching
import {
  SHOWROOM_INFO,
  DEFAULT_TRACTORS,
  DEFAULT_LEADS,
  DEFAULT_EXPENSES,
  DEFAULT_CASH_TRANSACTIONS,
  DEFAULT_DEMOS,
  DEFAULT_QUOTES
} from './data.js';
import { formatToDMY } from './utils/dateUtils.js';
import { supabaseApi } from './services/supabaseApi.js';
import { supabase } from './lib/supabase.js';

const STORAGE_KEYS = {
  TRACTORS: 'mde_tractors_prod_v3',
  LEADS: 'mde_leads_prod_v2',
  EXPENSES: 'mde_expenses_prod_v2',
  CASH_TXNS: 'mde_cash_txns_prod_v2',
  DEMOS: 'mde_demos_prod_v2',
  QUOTES: 'mde_quotes_prod_v2',
  BILLS: 'mde_bills_prod_v2',
  SETTINGS: 'mde_settings_prod_v3'
};

class DealershipStore {
  constructor() {
    this.subscribers = new Set();
    this.init();
    this.syncWithSupabase();
    this.setupRealtime();
  }

  init() {
    try {
      const oldKeys = Object.keys(localStorage).filter(k => k.startsWith('mde_') && !k.includes('_prod_v2') && !k.includes('_prod_v3'));
      for (const k of oldKeys) {
        localStorage.removeItem(k);
      }
      if (localStorage.getItem('mde_tractors_prod_v2')) {
        localStorage.removeItem('mde_tractors_prod_v2');
      }
    } catch (e) {
      console.warn("Storage cleanup notice:", e);
    }

    try {
      const storedTractors = localStorage.getItem(STORAGE_KEYS.TRACTORS);
      if (!storedTractors || !storedTractors.includes('VST Zetor')) {
        localStorage.setItem(STORAGE_KEYS.TRACTORS, JSON.stringify(DEFAULT_TRACTORS));
      }
    } catch (e) {
      console.warn("Storage write notice:", e);
    }

    if (!localStorage.getItem(STORAGE_KEYS.LEADS)) {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(DEFAULT_LEADS));
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

    try {
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!storedSettings || !storedSettings.includes('VST Zetor')) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(SHOWROOM_INFO));
      }
    } catch (e) {
      console.warn("Settings storage notice:", e);
    }
  }

  async syncWithSupabase() {
    try {
      if (!supabaseApi) return;
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
        // If Supabase table is empty but we have local bills, sync them to cloud
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

      if (expenses && expenses.length > 0) {
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
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
    try {
      if (!supabase || typeof supabase.channel !== 'function') return;
      supabase.channel('supabase-store-realtime')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {
          this.syncWithSupabase();
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription notice:', e);
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
    } catch {
      return [];
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
    const newId = leadData.id || `LEAD-${100 + leads.length + 1}`;
    const newLead = {
      id: newId,
      lastContactDate: new Date().toISOString().split('T')[0],
      ...leadData
    };
    leads.unshift(newLead);
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    this.notify();
    if (supabaseApi?.leads) {
      supabaseApi.leads.create(newLead).catch(e => console.warn('Supabase lead create failed:', e));
    }
    return newLead;
  }

  updateLead(leadId, updatedFields) {
    const leads = this.getLeads();
    const index = leads.findIndex(l => l.id === leadId);
    if (index !== -1) {
      leads[index] = { ...leads[index], ...updatedFields };
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
      this.notify();
      if (supabaseApi?.leads) {
        supabaseApi.leads.update(leadId, updatedFields).catch(e => console.warn('Supabase lead update failed:', e));
      }
      return leads[index];
    }
    return null;
  }

  deleteLead(leadId) {
    let leads = this.getLeads();
    leads = leads.filter(l => l.id !== leadId);
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    this.notify();
    if (supabaseApi?.leads) {
      supabaseApi.leads.delete(leadId).catch(e => console.warn('Supabase lead delete failed:', e));
    }
  }

  // --- Expense Operations ---
  addExpense(expenseData) {
    const expenses = this.getExpenses();
    const newId = expenseData.id || `EXP-${800 + expenses.length + 1}`;
    const isAutoApproved = Number(expenseData.amount) < 5000;
    const newExpense = {
      id: newId,
      date: expenseData.date || new Date().toISOString().split('T')[0],
      status: isAutoApproved ? 'Approved' : 'Pending Approval',
      approvedBy: isAutoApproved ? 'System (< ₹5,000)' : null,
      ...expenseData
    };
    expenses.unshift(newExpense);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));

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
    if (supabaseApi?.expenses) {
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
      if (supabaseApi?.expenses) {
        supabaseApi.expenses.create(item).catch(e => console.warn('Supabase expense approve failed:', e));
      }
    }
  }

  deleteExpense(expenseId) {
    let expenses = this.getExpenses();
    expenses = expenses.filter(e => e.id !== expenseId);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    this.notify();
    if (supabaseApi?.expenses) {
      supabaseApi.expenses.delete(expenseId).catch(e => console.warn('Supabase expense delete failed:', e));
    }
  }

  // --- Cash Transactions ---
  addCashTransaction(txnData) {
    const txns = this.getCashTransactions();
    const newId = txnData.id || `TXN-${300 + txns.length + 1}`;
    const newTxn = {
      id: newId,
      date: txnData.date || new Date().toISOString().split('T')[0],
      ...txnData
    };
    txns.unshift(newTxn);
    localStorage.setItem(STORAGE_KEYS.CASH_TXNS, JSON.stringify(txns));
    this.notify();
    if (supabaseApi?.cashflow) {
      supabaseApi.cashflow.create(newTxn).catch(e => console.warn('Supabase cashflow sync failed:', e));
    }
    return newTxn;
  }

  // --- Demo Operations ---
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
    if (supabaseApi?.demos) {
      supabaseApi.demos.create(newDemo).catch(e => console.warn('Supabase demo create failed:', e));
    }
    return newDemo;
  }

  updateDemo(demoId, updatedFields) {
    const demos = this.getDemos();
    const idx = demos.findIndex(d => d.id === demoId);
    if (idx !== -1) {
      demos[idx] = { ...demos[idx], ...updatedFields };
      localStorage.setItem(STORAGE_KEYS.DEMOS, JSON.stringify(demos));
      this.notify();
      if (supabaseApi?.demos) {
        supabaseApi.demos.update(demoId, updatedFields).catch(e => console.warn('Supabase demo update failed:', e));
      }
      return demos[idx];
    }
    return null;
  }

  // --- Quote Operations ---
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
    if (supabaseApi?.quotes) {
      supabaseApi.quotes.save(newQuote).catch(e => console.warn('Supabase quote sync failed:', e));
    }
    return newQuote;
  }

  getNextBillNumber() {
    const bills = this.getBills();
    let maxNo = 86;
    if (bills && Array.isArray(bills) && bills.length > 0) {
      const nums = bills.map(b => parseInt(b.billNumber, 10)).filter(n => !isNaN(n));
      if (nums.length > 0) {
        maxNo = Math.max(...nums);
      }
    }
    return String(maxNo + 1);
  }

  // --- Bill Operations ---
  addBill(billData) {
    const bills = this.getBills();
    const nextNo = this.getNextBillNumber();
    const billNumber = (billData.billNumber && String(billData.billNumber).trim() !== '')
      ? String(billData.billNumber).trim()
      : nextNo;
    const newBill = {
      id: billData.id || `BILL-${Date.now()}`,
      billNumber: String(billNumber),
      date: formatToDMY(billData.date || new Date()),
      customerName: billData.customerName || 'मेसर्स ग्राहक',
      address: billData.address || '',
      phone: billData.phone || '',
      vehicle: billData.vehicle || '',
      items: billData.items || [],
      totalRupees: Number(billData.totalRupees || 0),
      totalPaise: Number(billData.totalPaise || 0),
      amountWords: billData.amountWords || '',
      ...billData
    };
    newBill.date = formatToDMY(newBill.date);
    const existingIndex = bills.findIndex(b => (newBill.id && b.id === newBill.id) || String(b.billNumber) === String(billNumber));
    if (existingIndex >= 0) {
      bills[existingIndex] = { ...bills[existingIndex], ...newBill };
    } else {
      bills.unshift(newBill);
    }
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
    this.notify();
    if (supabaseApi?.bills) {
      supabaseApi.bills.save(newBill).catch(e => console.warn('Supabase bill sync failed:', e));
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
    this.notify();
    if (supabaseApi?.bills) {
      supabaseApi.bills.delete(target).catch(e => console.warn('Supabase bill delete failed:', e));
    }
  }

  // --- Unit Economics & Tractor Profitability ---
  getTractorUnitEconomics(tractorId, chassisNo = null) {
    const tractors = this.getTractors();
    const tractor = tractors.find(t => t.id === tractorId);
    if (!tractor) return null;

    const expenses = this.getExpenses().filter(e => e.status === 'Approved');
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
    if (supabaseApi?.tractors) {
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
      if (supabaseApi?.tractors) {
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
      if (supabaseApi?.tractors) {
        supabaseApi.tractors.update(tractorId, {
          stockCount: t.stockCount,
          chassisList: t.chassisList,
          status: t.status
        }).catch(e => console.warn('Supabase tractor stock sync failed:', e));
      }
    }
  }

  // --- Showroom P&L & Cash Flow Aggregations ---
  getFinancialSnapshot() {
    const quotes = this.getQuotes();
    const expenses = this.getExpenses().filter(e => e.status === 'Approved');
    const cashTxns = this.getCashTransactions();
    const tractors = this.getTractors();

    const quoteRevenue = quotes.reduce((sum, q) => sum + Number(q.grandTotal || 0), 0);
    const cashSalesRevenue = cashTxns
      .filter(t => t.type === 'IN' && (t.category === 'Tractor Sale' || t.category === 'Customer Advance'))
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const salesRevenue = Math.max(quoteRevenue, cashSalesRevenue);

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
