// Bills & Maa Durga Diesel Cash Memo Router
import express from 'express';
import { db } from '../storage/db.js';

export const billsRouter = express.Router();

// Get all bills
billsRouter.get('/', (req, res) => {
  const bills = db.get('bills');
  res.json({ success: true, data: bills });
});

// Calculate next auto-incrementing bill number
billsRouter.get('/next-number', (req, res) => {
  const bills = db.get('bills');
  let maxNo = 20; // Default baseline bill book series starting at 20
  for (const b of bills) {
    if (b.billNumber) {
      const num = parseInt(String(b.billNumber).replace(/\D/g, ''), 10);
      if (!isNaN(num) && num > maxNo) {
        maxNo = num;
      }
    }
  }
  const nextNumber = String(maxNo + 1);
  res.json({ success: true, nextNumber });
});

// Create or update bill
billsRouter.post('/', (req, res) => {
  const billData = req.body;
  if (!billData) {
    return res.status(400).json({ success: false, error: 'Bill data is required' });
  }

  const bills = db.get('bills');
  
  // Auto-generate bill number if empty
  let billNumber = billData.billNumber;
  if (!billNumber || String(billNumber).trim() === '') {
    let maxNo = 20;
    for (const b of bills) {
      if (b.billNumber) {
        const num = parseInt(String(b.billNumber).replace(/\D/g, ''), 10);
        if (!isNaN(num) && num > maxNo) maxNo = num;
      }
    }
    billNumber = String(maxNo + 1);
  }

  const newBill = {
    id: billData.id || `BILL-${Date.now()}`,
    billNumber: String(billNumber),
    date: billData.date || new Date().toISOString().split('T')[0],
    customerName: billData.customerName || 'मेसर्स ग्राहक',
    address: billData.address || '',
    phone: billData.phone || '',
    vehicle: billData.vehicle || '',
    items: billData.items || [],
    totalRupees: Number(billData.totalRupees || 0),
    totalPaise: Number(billData.totalPaise || 0),
    amountWords: billData.amountWords || '',
    createdAt: new Date().toISOString()
  };

  const existingIdx = bills.findIndex(b => b.id === newBill.id || String(b.billNumber) === String(newBill.billNumber));
  if (existingIdx >= 0) {
    bills[existingIdx] = { ...bills[existingIdx], ...newBill };
  } else {
    bills.unshift(newBill);
  }

  db.set('bills', bills);
  res.json({ success: true, data: newBill });
});

// Delete bill
billsRouter.delete('/:id', (req, res) => {
  const { id } = req.params;
  let bills = db.get('bills');
  bills = bills.filter(b => b.id !== id && String(b.billNumber) !== id);
  db.set('bills', bills);
  res.json({ success: true, message: 'Bill deleted successfully' });
});
