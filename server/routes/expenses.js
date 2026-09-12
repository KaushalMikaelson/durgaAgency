// Showroom & Chassis-Tagged Expenses Router
import express from 'express';
import { db } from '../storage/db.js';

export const expensesRouter = express.Router();

// Get all expenses
expensesRouter.get('/', (req, res) => {
  const expenses = db.get('expenses');
  res.json({ success: true, data: expenses });
});

// Add new expense
expensesRouter.post('/', (req, res) => {
  const expData = req.body;
  const expenses = db.get('expenses');

  const newExp = {
    id: expData.id || `EXP-${Date.now()}`,
    date: expData.date || new Date().toISOString().split('T')[0],
    category: expData.category || 'Operational',
    chassisTag: expData.chassisTag || '',
    amount: Number(expData.amount) || 0,
    paymentMode: expData.paymentMode || 'Cash',
    description: expData.description || '',
    status: expData.status || 'Approved',
    createdAt: new Date().toISOString()
  };

  expenses.unshift(newExp);
  db.set('expenses', expenses);
  res.json({ success: true, data: newExp });
});

// Delete expense
expensesRouter.delete('/:id', (req, res) => {
  const { id } = req.params;
  let expenses = db.get('expenses');
  expenses = expenses.filter(e => e.id !== id);
  db.set('expenses', expenses);
  res.json({ success: true, message: 'Expense removed' });
});
