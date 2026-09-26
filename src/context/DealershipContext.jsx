import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import { DEFAULT_TRACTORS, SHOWROOM_INFO } from '../data.js';
import { supabase } from '../lib/supabase.js';
import { autoDetectExpenseCategory } from '../utils/expenseClassifier.js';

const DealershipContext = createContext(null);

export function DealershipProvider({ children }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeModal, setActiveModal] = useState(null); // { type: string, data?: any }
  const [toasts, setToasts] = useState([]);

  // Live state collections
  const [bills, setBills] = useState([]);
  const [leads, setLeads] = useState([]);
  const [tractors, setTractors] = useState(DEFAULT_TRACTORS);
  const [expenses, setExpenses] = useState([]);
  const [cashTxns, setCashTxns] = useState([]);
  const [demos, setDemos] = useState([]);
  const [settings, setSettings] = useState(SHOWROOM_INFO);
  const [financialSnapshot, setFinancialSnapshot] = useState({
    billRevenue: 0,
    cashIn: 0,
    cashOut: 0,
    netCashFlow: 0,
    totalExpenses: 0
  });

  const showToast = useCallback((message, type = 'success', title = '') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  }, []);

  const openModal = useCallback((type, data = null) => {
    setActiveModal({ type, data });
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  // Fetch initial data from API with localStorage fallback
  const refreshAll = useCallback(async () => {
    try {
      const [billsData, leadsData, tractorsData, expensesData, cashData, demosData, settingsData, snapshotData] = await Promise.allSettled([
        api.bills.getAll(),
        api.leads.getAll(),
        api.tractors.getAll(),
        api.expenses.getAll(),
        api.cashflow.getAll(),
        api.demos.getAll(),
        api.settings.get(),
        api.cashflow.getSnapshot()
      ]);

      const fetchedExpenses = (expensesData.status === 'fulfilled' && expensesData.value) ? expensesData.value : [];
      const rawExpenses = fetchedExpenses.map(e => {
        const text = `${e.notes || ''} ${e.paidTo || ''} ${e.description || ''}`;
        const autoCat = autoDetectExpenseCategory(text, e.category);
        return autoCat ? { ...e, category: autoCat } : e;
      });
      let rawCash = (cashData.status === 'fulfilled' && cashData.value) ? [...cashData.value] : [];

      if (rawExpenses.length > 0) {
        const approvedExpenses = rawExpenses.filter(e => e.status === 'Approved');
        approvedExpenses.forEach(exp => {
          if (!rawCash.some(t => t.ref === exp.id)) {
            rawCash.unshift({
              id: `TXN-${exp.id}`,
              date: exp.date || new Date().toISOString().split('T')[0],
              type: 'OUT',
              category: exp.category || 'Operational Expense',
              amount: Number(exp.amount || 0),
              party: exp.paidTo || 'Showroom Vendor',
              partyName: exp.paidTo || 'Showroom Vendor',
              mode: exp.paymentMode || 'Cash',
              paymentMode: exp.paymentMode || 'Cash',
              ref: exp.id,
              notes: exp.notes || ''
            });
          }
        });
      }

      const rawBills = (billsData.status === 'fulfilled' && billsData.value) ? billsData.value : [];
      if (rawBills.length > 0) {
        rawBills.forEach(b => {
          const total = Number(b.totalRupees || 0);
          let paid = total;
          if (b.paymentStatus === 'Due') {
            paid = 0;
          } else if (b.paymentStatus === 'Partial' && b.paidAmount !== undefined) {
            paid = Math.min(total, Math.max(0, Number(b.paidAmount) || 0));
          } else if (b.paidAmount !== undefined && b.paidAmount !== null && b.paidAmount !== '') {
            paid = Math.min(total, Math.max(0, Number(b.paidAmount) || 0));
          }
          if (b.paymentStatus === 'Paid' && paid === 0 && total > 0) paid = total;

          const billRef = b.billNumber ? `BILL-${b.billNumber}` : (b.id ? String(b.id) : '');
          const existing = rawCash.find(t => (billRef && t.ref === billRef) || (b.id && (t.ref === b.id || t.billId === b.id)));

          if (paid > 0) {
            if (existing) {
              existing.amount = paid;
              existing.type = 'IN';
            } else {
              rawCash.unshift({
                id: `TXN-BILL-${b.billNumber || b.id}`,
                date: b.date || new Date().toISOString().split('T')[0],
                type: 'IN',
                category: 'Customer Bill Collection',
                amount: paid,
                party: b.customerName || 'Cash Customer',
                partyName: b.customerName || 'Cash Customer',
                mode: b.paymentMode || 'Cash',
                paymentMode: b.paymentMode || 'Cash',
                ref: billRef,
                billId: b.id,
                notes: `Official Bill #${b.billNumber || ''} payment collection`
              });
            }
          } else if (existing) {
            rawCash = rawCash.filter(t => t !== existing);
          }
        });
      }

      if (billsData.status === 'fulfilled' && billsData.value) setBills(rawBills);
      if (leadsData.status === 'fulfilled' && leadsData.value) setLeads(leadsData.value);
      if (tractorsData.status === 'fulfilled' && tractorsData.value) setTractors(tractorsData.value);
      if (expensesData.status === 'fulfilled') setExpenses(rawExpenses);
      setCashTxns(rawCash);
      if (demosData.status === 'fulfilled' && demosData.value) setDemos(demosData.value);
      if (settingsData.status === 'fulfilled' && settingsData.value) setSettings(settingsData.value);

      let calcCashIn = 0;
      let calcCashOut = 0;
      rawCash.forEach(t => {
        const amt = Number(t.amount || 0);
        if (t.type === 'IN') calcCashIn += amt;
        else if (t.type === 'OUT') calcCashOut += amt;
      });

      setFinancialSnapshot({
        billRevenue: rawBills.reduce((sum, b) => sum + Number(b.totalRupees || 0), 0),
        cashIn: calcCashIn,
        cashOut: calcCashOut,
        netCashFlow: calcCashIn - calcCashOut,
        totalExpenses: rawExpenses.filter(e => e.status === 'Approved').reduce((s, e) => s + Number(e.amount || 0), 0)
      });
    } catch (e) {
      console.warn("API refresh error:", e);
    }
  }, []);

  useEffect(() => {
    refreshAll();

    const channel = supabase?.channel?.('dealership-context-realtime')
      ?.on('postgres_changes', { event: '*', schema: 'public' }, () => {
        refreshAll();
      })
      ?.subscribe?.();

    return () => {
      if (channel && supabase?.removeChannel) {
        supabase.removeChannel(channel);
      }
    };
  }, [refreshAll]);

  // Operations
  const saveBill = async (billData) => {
    try {
      const saved = await api.bills.save(billData);
      if (saved) {
        setBills(prev => {
          const idx = prev.findIndex(b => b.id === saved.id || String(b.billNumber) === String(saved.billNumber));
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = saved;
            return next;
          }
          return [saved, ...prev];
        });
        showToast(`बिल क्र. ${saved.billNumber} सफलतापूर्वक सहेजा गया!`, 'success', 'बिल सुरक्षित');
        refreshAll();
        return saved;
      }
    } catch (e) {
      showToast('बिल सहेजने में त्रुटि हुई', 'error');
    }
  };

  const deleteBill = async (id) => {
    try {
      await api.bills.delete(id);
      setBills(prev => prev.filter(b => String(b.id) !== String(id) && String(b.billNumber) !== String(id)));
      showToast('बिल हटा दिया गया', 'info', 'बिल हटाया गया');
      refreshAll();
    } catch (e) {
      showToast('हटाने में त्रुटि हुई', 'error');
    }
  };

  const saveLead = async (leadData) => {
    try {
      if (leadData.id && leads.some(l => l.id === leadData.id)) {
        const updated = await api.leads.update(leadData.id, leadData);
        setLeads(prev => prev.map(l => l.id === leadData.id ? updated : l));
        showToast(`Lead updated for ${leadData.name}`, 'success');
      } else {
        const created = await api.leads.create(leadData);
        setLeads(prev => [created, ...prev]);
        showToast(`New lead recorded for ${leadData.name}`, 'success');
      }
      refreshAll();
    } catch (e) {
      showToast('Failed to save lead', 'error');
    }
  };

  const saveExpense = async (expData) => {
    try {
      const isAutoApproved = Number(expData.amount) < 5000 || expData.status === 'Approved';
      const created = await api.expenses.create({
        ...expData,
        status: isAutoApproved ? 'Approved' : (expData.status || 'Pending Approval'),
        approvedBy: isAutoApproved ? 'System (< ₹5,000)' : (expData.approvedBy || null)
      });
      setExpenses(prev => [created, ...prev]);

      if (isAutoApproved) {
        await api.cashflow.create({
          id: `TXN-${created.id}`,
          date: created.date || new Date().toISOString().split('T')[0],
          type: 'OUT',
          category: created.category || 'Operational Expense',
          amount: Number(created.amount || 0),
          partyName: created.paidTo || 'Vendor',
          paymentMode: created.paymentMode || 'Cash',
          ref: created.id,
          notes: created.notes || ''
        }).catch(e => console.warn(e));
      }

      showToast(`Logged ₹${Number(expData.amount).toLocaleString('en-IN')} expense`, 'success');
      refreshAll();
    } catch (e) {
      showToast('Failed to log expense', 'error');
    }
  };

  const deleteExpense = async (id) => {
    try {
      await api.expenses.delete(id);
      if (api.cashflow?.deleteByRef) {
        await api.cashflow.deleteByRef(id).catch(e => console.warn(e));
      }
      setExpenses(prev => prev.filter(e => e.id !== id));
      setCashTxns(prev => prev.filter(t => t.ref !== id));
      showToast('Expense record deleted', 'info');
      refreshAll();
    } catch (e) {
      showToast('Failed to delete expense', 'error');
    }
  };

  const saveCashTxn = async (txnData) => {
    try {
      const created = await api.cashflow.create(txnData);
      setCashTxns(prev => [created, ...prev]);

      if (txnData.type === 'OUT' && (!txnData.ref || !txnData.ref.startsWith('EXP-'))) {
        await api.expenses.create({
          date: txnData.date || new Date().toISOString().split('T')[0],
          category: txnData.category || 'Operational Expense',
          amount: Number(txnData.amount || 0),
          paidTo: txnData.partyName || txnData.party || 'Vendor',
          paymentMode: txnData.paymentMode || txnData.mode || 'Cash',
          status: 'Approved',
          approvedBy: 'Cash & Bank Entry',
          notes: txnData.notes || 'Recorded from Cash & Bank tab'
        }).catch(e => console.warn(e));
      }

      showToast(`Recorded ₹${Number(txnData.amount).toLocaleString('en-IN')} (${txnData.type})`, 'success');
      refreshAll();
    } catch (e) {
      showToast('Failed to record transaction', 'error');
    }
  };

  const updateTractorStock = async (tractorId, deltaCount, newChassis = null) => {
    try {
      const tractor = tractors.find(t => t.id === tractorId);
      if (!tractor) return;
      const newStock = Math.max(0, (tractor.stockCount || 0) + deltaCount);
      const chassisList = [...(tractor.chassisList || [])];
      if (newChassis && !chassisList.includes(newChassis)) {
        chassisList.push(newChassis);
      }
      const updated = await api.tractors.update(tractorId, { stockCount: newStock, chassisList });
      setTractors(prev => prev.map(t => t.id === tractorId ? { ...t, ...updated } : t));
      showToast(`Updated ${tractor.model} inventory (${newStock} units)`, 'success');
    } catch (e) {
      showToast('Failed to update stock', 'error');
    }
  };

  return (
    <DealershipContext.Provider value={{
      activeTab,
      setActiveTab,
      activeModal,
      openModal,
      closeModal,
      toasts,
      showToast,
      bills,
      leads,
      tractors,
      expenses,
      cashTxns,
      demos,
      settings,
      financialSnapshot,
      refreshAll,
      saveBill,
      deleteBill,
      saveLead,
      saveExpense,
      deleteExpense,
      saveCashTxn,
      updateTractorStock
    }}>
      {children}
    </DealershipContext.Provider>
  );
}

export function useDealership() {
  const ctx = useContext(DealershipContext);
  if (!ctx) throw new Error('useDealership must be used within DealershipProvider');
  return ctx;
}
