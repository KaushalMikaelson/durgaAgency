// Showroom Expense Logging Modal with Chassis Tagging
import React, { useState } from 'react';
import { useDealership } from '../../context/DealershipContext.jsx';

const EXPENSE_CATEGORIES = [
  'Freight / Logistics',
  'PDI / Servicing',
  'Commission / Brokerage',
  'Diesel / Fuel',
  'Showroom Rent & Utilities',
  'Staff Salaries & Incentives',
  'Tea & Refreshments',
  'Customer Welcome & Gifts',
  'Marketing / Village Wall Painting',
  'Other Operational'
];

export function ExpenseModal({ onClose }) {
  const { saveExpense, tractors } = useDealership();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [chassisTag, setChassisTag] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [description, setDescription] = useState('');

  // Collect all active chassis numbers from inventory
  const allChassis = tractors.flatMap(t => t.chassisList || []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    saveExpense({
      date,
      category,
      amount: Number(amount),
      chassisTag: chassisTag.trim(),
      paymentMode,
      description: description.trim(),
      status: 'Approved'
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="form-row">
        <div className="form-group flex-1">
          <label>Expense Date</label>
          <input
            type="date"
            required
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="form-group flex-1">
          <label>Category</label>
          <select
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group flex-1">
          <label>Amount (₹) *</label>
          <input
            type="number"
            required
            min="1"
            className="form-control"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 3500"
          />
        </div>
        <div className="form-group flex-1">
          <label>Payment Mode</label>
          <select
            className="form-control"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
          >
            <option value="Cash">Cash</option>
            <option value="UPI / QR">UPI / QR</option>
            <option value="Bank Transfer">Bank Transfer / NEFT</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Tag Specific Tractor Chassis (Optional - for True Landed Margins)</label>
        <div className="chassis-input-row">
          <input
            type="text"
            className="form-control"
            value={chassisTag}
            onChange={(e) => setChassisTag(e.target.value)}
            placeholder="e.g. CH-4511-4WD-1102"
          />
          {allChassis.length > 0 && (
            <select
              className="form-control chassis-select"
              onChange={(e) => setChassisTag(e.target.value)}
              value=""
            >
              <option value="">Choose Existing Chassis...</option>
              {allChassis.map((ch) => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="form-group">
        <label>Description / Notes</label>
        <textarea
          className="form-control"
          rows="2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Transport freight charges from depot to showroom"
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Log Expense
        </button>
      </div>
    </form>
  );
}
