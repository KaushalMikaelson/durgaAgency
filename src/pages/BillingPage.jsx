// Billing & Invoices Management Page (Maa Durga Diesel)
import React, { useState } from 'react';
import { useDealership } from '../context/DealershipContext.jsx';
import { Receipt, Printer, Edit, Trash2, Plus, Search } from 'lucide-react';

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

  const grandTotalBilled = bills.reduce((sum, b) => sum + Number(b.totalRupees || 0), 0);

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
      <div className="billing-stats-ribbon">
        <div className="ribbon-card">
          <span>कुल बिल संख्या (Total Bills)</span>
          <strong>{bills.length}</strong>
        </div>
        <div className="ribbon-card">
          <span>कुल बिलिंग राशि (Grand Revenue)</span>
          <strong className="font-mono text-emerald">₹{grandTotalBilled.toLocaleString('en-IN')}</strong>
        </div>
        <div className="ribbon-card">
          <span>अंतिम जारी बिल (Latest Bill No.)</span>
          <strong className="text-amber">#{bills[0]?.billNumber || '21'}</strong>
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
                  <th className="text-center" style={{ width: '130px' }}>कार्रवाई (Actions)</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => (
                  <tr key={bill.id || bill.billNumber}>
                    <td>
                      <span className="badge-bill-large">#{bill.billNumber}</span>
                    </td>
                    <td>{bill.date}</td>
                    <td>
                      <div className="cust-cell">
                        <strong>{bill.customerName}</strong>
                        {bill.phone && <small>{bill.phone}</small>}
                      </div>
                    </td>
                    <td>{bill.vehicle || '-'}</td>
                    <td>
                      <span className="badge-count">
                        {(bill.items || []).length} मदें ({bill.items?.[0]?.description?.slice(0, 24) || 'सामान'}...)
                      </span>
                    </td>
                    <td className="text-right font-mono font-bold font-lg text-emerald">
                      ₹{Number(bill.totalRupees || 0).toLocaleString('en-IN')}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
