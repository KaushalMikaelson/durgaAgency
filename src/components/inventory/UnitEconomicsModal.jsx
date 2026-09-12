// Tractor Unit Economics & Landed Margin Diagnostic Modal
import React from 'react';
import { useDealership } from '../../context/DealershipContext.jsx';
import { CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';

export function UnitEconomicsModal({ tractor, onClose }) {
  const { expenses } = useDealership();

  if (!tractor) return null;

  // Filter expenses tagged to this tractor's chassis
  const matchedExpenses = expenses.filter(e => {
    if (!e.chassisTag) return false;
    return tractor.chassisList && tractor.chassisList.includes(e.chassisTag);
  });

  const directExpensesTotal = matchedExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const purchaseCost = Number(tractor.dealerPurchaseCost || 0);
  const sellingPrice = Number(tractor.price || 0);
  const totalTrueCost = purchaseCost + directExpensesTotal;
  const actualMargin = sellingPrice - totalTrueCost;
  const marginPercent = totalTrueCost > 0 ? ((actualMargin / sellingPrice) * 100).toFixed(1) : 0;

  return (
    <div className="unit-economics-modal">
      <div className="ue-header">
        <h4>{tractor.brand} {tractor.model} ({tractor.hp} HP)</h4>
        <span className="stock-tag">{tractor.stockCount} in stock</span>
      </div>

      <div className="ue-grid">
        <div className="ue-card">
          <span className="ue-lbl">Showroom Ex-Showroom Price</span>
          <span className="ue-val font-mono">₹{sellingPrice.toLocaleString('en-IN')}</span>
        </div>
        <div className="ue-card">
          <span className="ue-lbl">Factory Invoice Purchase Cost</span>
          <span className="ue-val font-mono">₹{purchaseCost.toLocaleString('en-IN')}</span>
        </div>
        <div className="ue-card">
          <span className="ue-lbl">Chassis Tagged Logistics / PDI</span>
          <span className="ue-val font-mono">₹{directExpensesTotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="ue-card highlight-emerald">
          <span className="ue-lbl">True Net Dealer Margin</span>
          <span className="ue-val font-mono font-bold">₹{actualMargin.toLocaleString('en-IN')} ({marginPercent}%)</span>
        </div>
      </div>

      <div className="ue-breakdown">
        <h5>Itemized Direct Expenses (Tagged by Chassis)</h5>
        {matchedExpenses.length === 0 ? (
          <p className="empty-notice">No freight or PDI costs tagged to these chassis numbers yet. Use "+ Expense" to log landed costs.</p>
        ) : (
          <table className="table-mini">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Chassis</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {matchedExpenses.map((exp) => (
                <tr key={exp.id}>
                  <td>{exp.date}</td>
                  <td>{exp.category}</td>
                  <td><code>{exp.chassisTag}</code></td>
                  <td className="font-mono">₹{Number(exp.amount).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="modal-footer-actions">
        <button className="btn btn-primary" onClick={onClose}>
          Close Diagnostic
        </button>
      </div>
    </div>
  );
}
