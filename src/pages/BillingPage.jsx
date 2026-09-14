// Billing & Invoices Management Page (Maa Durga Diesel)
import React, { useState } from 'react';
import { useDealership } from '../context/DealershipContext.jsx';
import { Receipt, Printer, Edit, Trash2, Plus, Search } from 'lucide-react';
import { formatToDMY } from '../utils/dateUtils.js';

export function BillingPage() {
  const { bills, openModal, deleteBill } = useDealership();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBills = bills.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      (b.billNumber && String(b.billNumber).toLowerCase().includes(term)) ||
      (b.customerName && b.customerName.toLowerCase().includes(term)) ||
      (b.vehicle && b.vehicle.toLowerCase().includes(term)) ||
      (b.phone && b.phone.includes(term))
    );
  });

  let totalBilled = 0;
  let totalPaid = 0;
  let totalDue = 0;
  let paidCount = 0;
  let dueCount = 0;

  bills.forEach((b) => {
    const total = Number(b.totalRupees || 0);
    totalBilled += total;
    let paid = total;
    if (b.paymentStatus === 'Due') {
      paid = 0;
    } else if (b.paymentStatus === 'Partial' && b.paidAmount !== undefined) {
      paid = Math.min(total, Math.max(0, Number(b.paidAmount) || 0));
    } else if (b.paidAmount !== undefined && b.paidAmount !== null && b.paidAmount !== '') {
      paid = Math.min(total, Math.max(0, Number(b.paidAmount) || 0));
    }
    const due = Math.max(0, total - paid);
    totalPaid += paid;
    totalDue += due;
    if (due <= 0 && total > 0) {
      paidCount++;
    } else if (due > 0) {
      dueCount++;
    }
  });

  const nextAutoNo = bills.length > 0
    ? Math.max(...bills.map(b => parseInt(b.billNumber, 10)).filter(n => !isNaN(n)), 86) + 1
    : 87;

  return (
    <div className="page-container billing-page">
      {/* Top Title & Header */}
      <div className="page-header">
        <div>
          <h2>माँ दुर्गा डीजल - बिल बुक एवं रसीदें</h2>
          <p>Maa Durga Diesel Estimate & Cash Memo Register • डीलर बिल बुक रिकॉर्ड</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => openModal('billSheet')}>
            <Receipt size={16} /> + नया बिल बनाएं (Create New Bill)
          </button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="billing-stats-ribbon" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <div className="ribbon-card" style={{ borderTop: '4px solid #10b981' }}>
          <span style={{ color: '#059669', fontWeight: 700 }}>Total Paid (जमा राशि)</span>
          <strong className="font-mono" style={{ color: '#059669', fontSize: '20px' }}>₹{totalPaid.toLocaleString('en-IN')}</strong>
          <small style={{ color: '#059669', fontWeight: 600 }}>✅ {paidCount} Bills Paid</small>
        </div>
        <div className="ribbon-card" style={{ borderTop: '4px solid #ef4444' }}>
          <span style={{ color: '#dc2626', fontWeight: 700 }}>Total Due (बकाया राशि)</span>
          <strong className="font-mono" style={{ color: '#dc2626', fontSize: '20px' }}>₹{totalDue.toLocaleString('en-IN')}</strong>
          <small style={{ color: dueCount > 0 ? '#dc2626' : '#10b981', fontWeight: 600 }}>
            {dueCount > 0 ? `⚠️ ${dueCount} Bills Due` : '✨ No Pending Dues'}
          </small>
        </div>
        <div className="ribbon-card" style={{ borderTop: '4px solid #2563eb' }}>
          <span style={{ color: '#1d4ed8', fontWeight: 700 }}>Total Invoiced (कुल बिल)</span>
          <strong className="font-mono" style={{ color: '#1d4ed8', fontSize: '20px' }}>₹{totalBilled.toLocaleString('en-IN')}</strong>
          <small style={{ color: '#64748b' }}>📋 {bills.length} Total Bills</small>
        </div>
        <div className="ribbon-card" style={{ borderTop: '4px solid #f59e0b' }}>
          <span style={{ color: '#d97706', fontWeight: 700 }}>Next Auto Bill No.</span>
          <strong className="font-mono" style={{ color: '#b45309', fontSize: '20px' }}>#{nextAutoNo}</strong>
          <small style={{ color: '#64748b' }}>Auto Generated</small>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="table-search-bar">
        <div className="search-input-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="बिल नंबर, ग्राहक का नाम, वाहन नंबर या फोन से खोजें..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Bills Table Card */}
      <div className="table-card">
        {filteredBills.length === 0 ? (
          <div className="empty-state-large">
            <Receipt size={48} className="empty-icon" />
            <h4>कोई बिल नहीं मिला</h4>
            <p>खोज शब्द बदलें या नया "माँ दुर्गा डीजल" बिल बनाएं।</p>
            <button className="btn btn-primary" onClick={() => openModal('billSheet')}>
              <Plus size={16} /> नया बिल बनाएं (+ Create Bill)
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-clean full-width">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>बिल क्र.</th>
                  <th style={{ width: '110px' }}>दिनांक</th>
                  <th>मेसर्स (ग्राहक का नाम)</th>
                  <th>गाड़ी / वाहन</th>
                  <th>सामान (Items)</th>
                  <th className="text-right">कुल योग (Total)</th>
                  <th className="text-center" style={{ width: '130px' }}>भुगतान स्थिति</th>
                  <th className="text-center" style={{ width: '130px' }}>कार्रवाई (Actions)</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => {
                  const total = Number(bill.totalRupees || 0);
                  let paid = total;
                  if (bill.paymentStatus === 'Due') {
                    paid = 0;
                  } else if (bill.paymentStatus === 'Partial' && bill.paidAmount !== undefined) {
                    paid = Math.min(total, Math.max(0, Number(bill.paidAmount) || 0));
                  } else if (bill.paidAmount !== undefined && bill.paidAmount !== null && bill.paidAmount !== '') {
                    paid = Math.min(total, Math.max(0, Number(bill.paidAmount) || 0));
                  }
                  const due = Math.max(0, total - paid);

                  return (
                    <tr key={bill.id || bill.billNumber}>
                      <td>
                        <span className="badge-bill-large">#{bill.billNumber}</span>
                      </td>
                      <td><span className="font-mono">{formatToDMY(bill.date)}</span></td>
                      <td>
                        <div className="cust-cell">
                          <strong>{bill.customerName}</strong>
                          {bill.phone && <small style={{ display: 'block', color: '#64748b' }}>📞 {bill.phone}</small>}
                        </div>
                      </td>
                      <td>{bill.vehicle || '-'}</td>
                      <td>
                        <span className="badge-count">
                          {(bill.items || []).length} मदें ({bill.items?.[0]?.description?.slice(0, 24) || 'सामान'}...)
                        </span>
                      </td>
                      <td className="text-right font-mono font-bold font-lg text-emerald">
                        ₹{total.toLocaleString('en-IN')}
                      </td>
                      <td className="text-center">
                        {due <= 0 && total > 0 ? (
                          <span style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '3px 8px', fontSize: '11px', fontWeight: 700 }}>
                            ✓ Paid
                          </span>
                        ) : paid > 0 && due > 0 ? (
                          <span style={{ background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a', borderRadius: '12px', padding: '3px 8px', fontSize: '11px', fontWeight: 700 }} title={`Paid: ₹${paid.toLocaleString('en-IN')}`}>
                            ⏳ Due: ₹{due.toLocaleString('en-IN')}
                          </span>
                        ) : total > 0 ? (
                          <span style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '12px', padding: '3px 8px', fontSize: '11px', fontWeight: 700 }}>
                            ⚠️ Due
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>
                      <td className="text-center">
                        <div className="action-btns-row">
                          <button
                            className="btn-icon-action"
                            title="प्रिंट करें (Print Bill)"
                            onClick={() => openModal('billPrint', bill)}
                          >
                            <Printer size={15} />
                          </button>
                          <button
                            className="btn-icon-action"
                            title="संपादित करें (Edit Bill)"
                            onClick={() => openModal('billSheet', bill)}
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            className="btn-icon-action text-danger"
                            title="हटाएं (Delete Bill)"
                            onClick={() => {
                              if (window.confirm(`क्या आप बिल क्र. ${bill.billNumber} को हटाना चाहते हैं?`)) {
                                deleteBill(bill.id || bill.billNumber);
                              }
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
