// Cash Ledger & Financial Snapshot Router
import express from 'express';
import { db } from '../storage/db.js';

export const cashflowRouter = express.Router();

// Get all cash transactions
cashflowRouter.get('/', (req, res) => {
  const cashTransactions = db.get('cashTransactions');
  res.json({ success: true, data: cashTransactions });
});

// Record new transaction (IN / OUT)
cashflowRouter.post('/', (req, res) => {
  const txnData = req.body;
  const cashTransactions = db.get('cashTransactions');

  const newTxn = {
    id: txnData.id || `TXN-${Date.now()}`,
    date: txnData.date || new Date().toISOString().split('T')[0],
    type: txnData.type || 'IN',
    category: txnData.category || 'Tractor Sale',
    amount: Number(txnData.amount) || 0,
    partyName: txnData.partyName || 'Customer / Vendor',
    paymentMode: txnData.paymentMode || 'Cash',
    notes: txnData.notes || '',
    createdAt: new Date().toISOString()
  };

  cashTransactions.unshift(newTxn);
  db.set('cashTransactions', cashTransactions);
  res.json({ success: true, data: newTxn });
});

// Get financial snapshot & P&L
cashflowRouter.get('/snapshot', (req, res) => {
  const bills = db.get('bills');
  const expenses = db.get('expenses').filter(e => e.status === 'Approved');
  const cashTxns = db.get('cashTransactions');

  // Revenue from bills
  const billRevenue = bills.reduce((sum, b) => sum + Number(b.totalRupees || 0), 0);
  
  // Cash In / Cash Out
  let cashIn = 0;
  let cashOut = 0;
  for (const txn of cashTxns) {
    const amt = Number(txn.amount || 0);
    if (txn.type === 'IN') cashIn += amt;
    else if (txn.type === 'OUT') cashOut += amt;
  }

  // Operating Expenses breakdown
  const categoryTotals = {};
  let totalExpenses = 0;
  for (const exp of expenses) {
    const cat = exp.category || 'Other';
    const amt = Number(exp.amount || 0);
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
    totalExpenses += amt;
  }

  const netCashFlow = cashIn - cashOut;

  res.json({
    success: true,
    data: {
      billRevenue,
      cashIn,
      cashOut,
      netCashFlow,
      totalExpenses,
      categoryTotals
    }
  });
});
