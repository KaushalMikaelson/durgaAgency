// Central Dealership State Management Context for Maa Durga Engineering OS
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import { DEFAULT_TRACTORS, SHOWROOM_INFO } from '../data.js';

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

      if (billsData.status === 'fulfilled' && billsData.value) setBills(billsData.value);
      if (leadsData.status === 'fulfilled' && leadsData.value) setLeads(leadsData.value);
      if (tractorsData.status === 'fulfilled' && tractorsData.value) setTractors(tractorsData.value);
      if (expensesData.status === 'fulfilled' && expensesData.value) setExpenses(expensesData.value);
      if (cashData.status === 'fulfilled' && cashData.value) setCashTxns(cashData.value);
      if (demosData.status === 'fulfilled' && demosData.value) setDemos(demosData.value);
      if (settingsData.status === 'fulfilled' && settingsData.value) setSettings(settingsData.value);
      if (snapshotData.status === 'fulfilled' && snapshotData.value) setFinancialSnapshot(snapshotData.value);
    } catch (e) {
      console.warn("API refresh error:", e);
    }
  }, []);

  useEffect(() => {
    refreshAll();
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
      setBills(prev => prev.filter(b => b.id !== id && String(b.billNumber) !== id));
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
      const created = await api.expenses.create(expData);
      setExpenses(prev => [created, ...prev]);
      showToast(`Logged ₹${Number(expData.amount).toLocaleString('en-IN')} expense`, 'success');
      refreshAll();
    } catch (e) {
      showToast('Failed to log expense', 'error');
    }
  };

  const saveCashTxn = async (txnData) => {
    try {
      const created = await api.cashflow.create(txnData);
      setCashTxns(prev => [created, ...prev]);
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
