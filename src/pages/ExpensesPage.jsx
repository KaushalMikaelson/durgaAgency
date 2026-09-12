// Showroom Expenses Ledger Page
import React from 'react';
import { useDealership } from '../context/DealershipContext.jsx';
import { TrendingDown, Plus, Trash2 } from 'lucide-react';

export function ExpensesPage() {
  const { expenses, openModal } = useDealership();

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div className="page-container expenses-page">
      <div className="page-header">
        <div>
          <h2>Showroom Operational Expenses</h2>
          <p>Freight, PDI, dealer brokerage, staff, and utilities tagged to tractor chassis</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => openModal('expense')}>
            <Plus size={16} /> + Log Expense
          </button>
        </div>
      </div>

      <div className="billing-stats-ribbon">
        <div className="ribbon-card">
          <span>Total Logged Expenses</span>
          <strong>{expenses.length} Records</strong>
        </div>
        <div className="ribbon-card">
          <span>Total Expense Outflow</span>
          <strong className="font-mono text-amber">₹{totalExpenseAmount.toLocaleString('en-IN')}</strong>
        </div>
      </div>

      <div className="table-card">
        {expenses.length === 0 ? (
          <div className="empty-state-large">
            <TrendingDown size={48} className="empty-icon" />
            <h4>No expenses logged yet</h4>
            <p>Log showroom costs, freight, or tractor PDI to track accurate dealer net margin.</p>
            <button className="btn btn-primary" onClick={() => openModal('expense')}>
              + Log First Expense
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-clean full-width">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Tagged Chassis</th>
                  <th>Description</th>
                  <th>Payment Mode</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td>{exp.date}</td>
                    <td><span className="badge-stage">{exp.category}</span></td>
                    <td>{exp.chassisTag ? <code>{exp.chassisTag}</code> : '-'}</td>
                    <td>{exp.description || '-'}</td>
                    <td>{exp.paymentMode}</td>
                    <td className="text-right font-mono font-bold text-amber">
                      ₹{Number(exp.amount).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
