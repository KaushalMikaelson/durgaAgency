// Cash & Bank Ledger Page
import React, { useState } from 'react';
import { useDealership } from '../context/DealershipContext.jsx';
import { Wallet, ArrowDownLeft, ArrowUpRight, Plus } from 'lucide-react';

export function CashFlowPage() {
  const { cashTxns, financialSnapshot, saveCashTxn } = useDealership();

  const [showAddTxn, setShowAddTxn] = useState(false);
  const [type, setType] = useState('IN');
  const [category, setCategory] = useState('Customer Advance');
  const [amount, setAmount] = useState('');
  const [partyName, setPartyName] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [notes, setNotes] = useState('');

  const handleCreateTxn = (e) => {
    e.preventDefault();
    if (!amount) return;
    saveCashTxn({
      date: new Date().toISOString().split('T')[0],
      type,
      category,
      amount: Number(amount),
      partyName: partyName.trim() || 'Showroom Party',
      paymentMode,
      notes: notes.trim()
    });
    setAmount('');
    setPartyName('');
    setNotes('');
    setShowAddTxn(false);
  };

  return (
    <div className="page-container cashflow-page">
      <div className="page-header">
        <div>
          <h2>Cash & Bank Ledger</h2>
          <p>Real-time cash in vs cash out, advances, and net liquidity</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowAddTxn(!showAddTxn)}>
            <Plus size={16} /> {showAddTxn ? 'Cancel' : '+ New Transaction'}
          </button>
        </div>
      </div>

      <div className="billing-stats-ribbon">
        <div className="ribbon-card">
          <span>Total Cash Inflow</span>
          <strong className="font-mono text-emerald">₹{(financialSnapshot.cashIn || 0).toLocaleString('en-IN')}</strong>
        </div>
        <div className="ribbon-card">
          <span>Total Cash Outflow</span>
          <strong className="font-mono text-amber">₹{(financialSnapshot.cashOut || 0).toLocaleString('en-IN')}</strong>
        </div>
        <div className="ribbon-card">
          <span>Net Liquidity Balance</span>
          <strong className="font-mono text-blue">₹{(financialSnapshot.netCashFlow || 0).toLocaleString('en-IN')}</strong>
        </div>
      </div>

      {showAddTxn && (
        <form onSubmit={handleCreateTxn} className="form-card add-txn-card">
          <h4>Record Cash / Bank Movement</h4>
          <div className="form-row">
            <div className="form-group flex-1">
              <label>Transaction Type</label>
              <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="IN">Cash IN (Deposit / Advance)</option>
                <option value="OUT">Cash OUT (Payment / Expense)</option>
              </select>
            </div>
            <div className="form-group flex-1">
              <label>Amount (₹)</label>
              <input
                type="number"
                required
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 25000"
              />
            </div>
            <div className="form-group flex-1">
              <label>Customer / Vendor Name</label>
              <input
                type="text"
                className="form-control"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                placeholder="Party Name"
              />
            </div>
            <div className="form-group flex-1">
              <label>Payment Mode</label>
              <select className="form-control" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                <option value="Cash">Cash</option>
                <option value="UPI / QR">UPI / QR</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Save Transaction</button>
        </form>
      )}

      <div className="table-card">
        <table className="table-clean full-width">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Party</th>
              <th>Mode</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {cashTxns.map((t) => (
              <tr key={t.id}>
                <td>{t.date}</td>
                <td>
                  <span className={`badge-pill ${t.type === 'IN' ? 'in-flow' : 'out-flow'}`}>
                    {t.type === 'IN' ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />} {t.type}
                  </span>
                </td>
                <td>{t.category}</td>
                <td><strong>{t.partyName}</strong></td>
                <td>{t.paymentMode}</td>
                <td className={`text-right font-mono font-bold ${t.type === 'IN' ? 'text-emerald' : 'text-amber'}`}>
                  {t.type === 'IN' ? '+' : '-'}₹{Number(t.amount).toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
