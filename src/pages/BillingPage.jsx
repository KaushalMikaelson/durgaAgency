// Billing & Invoices Management Page (Maa Durga Diesel)
import React, { useState, useMemo } from 'react';
import { useDealership } from '../context/DealershipContext.jsx';
import { Receipt, Printer, Edit, Trash2, Plus, Search, Filter, X, RotateCcw, ArrowUpDown } from 'lucide-react';
import { formatToDMY } from '../utils/dateUtils.js';

function toIsoDate(dStr) {
  if (!dStr) return '';
  const str = String(dStr).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  const parts = str.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 2 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return '';
}

export function BillingPage() {
  const { bills, openModal, deleteBill } = useDealership();
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [amountFilter, setAmountFilter] = useState('all');
  const [villageFilter, setVillageFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // Extract unique villages from bills
  const uniqueVillages = useMemo(() => {
    const set = new Set();
    bills.forEach((b) => {
      const v = (b.village || b.address || '').trim();
      if (v) set.add(v);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [bills]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('all');
    setCustomFrom('');
    setCustomTo('');
    setAmountFilter('all');
    setVillageFilter('all');
    setSortBy('date-desc');
  };

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    statusFilter !== 'all' ||
    dateFilter !== 'all' ||
    amountFilter !== 'all' ||
    villageFilter !== 'all' ||
    sortBy !== 'date-desc'
  );

  // Compute filtered and sorted bills
  const filteredBills = useMemo(() => {
    const today = new Date();
    const todayIso = today.toISOString().slice(0, 10);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const sevenDaysAgoIso = sevenDaysAgo.toISOString().slice(0, 10);

    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const startOfThisMonth = new Date(currentYear, currentMonth, 1).toISOString().slice(0, 10);
    const endOfThisMonth = new Date(currentYear, currentMonth + 1, 0).toISOString().slice(0, 10);

    const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1).toISOString().slice(0, 10);
    const endOfLastMonth = new Date(currentYear, currentMonth, 0).toISOString().slice(0, 10);

    const term = searchTerm.toLowerCase().trim();

    const filtered = bills.filter((b) => {
      const total = Number(b.totalRupees || 0);
      let paid = total;
      if (b.paymentStatus === 'Due') {
        paid = 0;
      } else if (b.paymentStatus === 'Partial' && b.paidAmount !== undefined) {
        paid = Math.min(total, Math.max(0, Number(b.paidAmount) || 0));
      } else if (b.paidAmount !== undefined && b.paidAmount !== null && b.paidAmount !== '') {
        paid = Math.min(total, Math.max(0, Number(b.paidAmount) || 0));
      }
      const due = Math.max(0, total - paid);

      // 1. Text Search Filter
      if (term) {
        const billNo = String(b.billNumber || '').toLowerCase();
        const custName = String(b.customerName || '').toLowerCase();
        const vehicle = String(b.vehicle || '').toLowerCase();
        const phone = String(b.phone || '');
        const addr = String(b.village || b.address || '').toLowerCase();
        const itemsText = (b.items || []).map((i) => i.description || '').join(' ').toLowerCase();

        const matches =
          billNo.includes(term) ||
          custName.includes(term) ||
          vehicle.includes(term) ||
          phone.includes(term) ||
          addr.includes(term) ||
          itemsText.includes(term);

        if (!matches) return false;
      }

      // 2. Payment Status Filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'paid') {
          if (due > 0 || total <= 0) return false;
        } else if (statusFilter === 'due') {
          if (paid > 0 || total <= 0) return false;
        } else if (statusFilter === 'partial') {
          if (paid <= 0 || due <= 0) return false;
        } else if (statusFilter === 'pending') {
          if (due <= 0) return false;
        }
      }

      // 3. Date Preset & Custom Range Filter
      const bIso = toIsoDate(b.date);
      if (dateFilter === 'today') {
        if (bIso !== todayIso) return false;
      } else if (dateFilter === 'last7') {
        if (!bIso || bIso < sevenDaysAgoIso || bIso > todayIso) return false;
      } else if (dateFilter === 'thisMonth') {
        if (!bIso || bIso < startOfThisMonth || bIso > endOfThisMonth) return false;
      } else if (dateFilter === 'lastMonth') {
        if (!bIso || bIso < startOfLastMonth || bIso > endOfLastMonth) return false;
      } else if (dateFilter === 'custom') {
        if (customFrom && bIso < customFrom) return false;
        if (customTo && bIso > customTo) return false;
      }

      // 4. Amount Bracket Filter
      if (amountFilter !== 'all') {
        if (amountFilter === 'under5k' && total >= 5000) return false;
        if (amountFilter === '5k-20k' && (total < 5000 || total > 20000)) return false;
        if (amountFilter === '20k-50k' && (total < 20000 || total > 50000)) return false;
        if (amountFilter === 'above50k' && total <= 50000) return false;
      }

      // 5. Village / Address Filter
      if (villageFilter !== 'all') {
        const v = (b.village || b.address || '').trim().toLowerCase();
        if (v !== villageFilter.toLowerCase()) return false;
      }

      return true;
    });

    // Sort order
    return filtered.sort((a, b) => {
      const aTotal = Number(a.totalRupees || 0);
      const bTotal = Number(b.totalRupees || 0);
      const aPaid = a.paymentStatus === 'Due' ? 0 : (a.paidAmount !== undefined ? Number(a.paidAmount) || 0 : aTotal);
      const bPaid = b.paymentStatus === 'Due' ? 0 : (b.paidAmount !== undefined ? Number(b.paidAmount) || 0 : bTotal);
      const aDue = Math.max(0, aTotal - aPaid);
      const bDue = Math.max(0, bTotal - bPaid);
      const aNum = parseInt(a.billNumber, 10) || 0;
      const bNum = parseInt(b.billNumber, 10) || 0;
      const aIso = toIsoDate(a.date);
      const bIso = toIsoDate(b.date);

      switch (sortBy) {
        case 'date-asc':
          return (aIso || '').localeCompare(bIso || '') || aNum - bNum;
        case 'bill-desc':
          return bNum - aNum;
        case 'bill-asc':
          return aNum - bNum;
        case 'amount-desc':
          return bTotal - aTotal;
        case 'amount-asc':
          return aTotal - bTotal;
        case 'due-desc':
          return bDue - aDue;
        case 'date-desc':
        default:
          return (bIso || '').localeCompare(aIso || '') || bNum - aNum;
      }
    });
  }, [bills, searchTerm, statusFilter, dateFilter, customFrom, customTo, amountFilter, villageFilter, sortBy]);

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

  // Calculate filtered stats
  const filteredTotal = filteredBills.reduce((acc, b) => acc + Number(b.totalRupees || 0), 0);
  const filteredDue = filteredBills.reduce((acc, b) => {
    const tot = Number(b.totalRupees || 0);
    const pd = b.paymentStatus === 'Due' ? 0 : (b.paidAmount !== undefined ? Number(b.paidAmount) || 0 : tot);
    return acc + Math.max(0, tot - pd);
  }, 0);

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
      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="metric-card success">
          <div className="metric-card-header">
            <div className="metric-card-title-group">
              <span className="metric-card-title" style={{ color: '#059669' }}>Total Paid</span>
              <span className="metric-card-subtitle" style={{ color: '#10b981' }}>(जमा राशि)</span>
            </div>
            <div className="metric-icon success">₹</div>
          </div>
          <div className="metric-value" style={{ color: '#065f46' }}>₹{totalPaid.toLocaleString('en-IN')}</div>
          <div className="metric-badge-pill" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid rgba(16,185,129,0.2)' }}>
            <span>✅ {paidCount} Bills Fully Paid</span>
          </div>
        </div>

        <div className={`metric-card ${dueCount > 0 ? 'danger' : 'success'}`}>
          <div className="metric-card-header">
            <div className="metric-card-title-group">
              <span className="metric-card-title" style={{ color: dueCount > 0 ? '#dc2626' : '#059669' }}>Total Due</span>
              <span className="metric-card-subtitle" style={{ color: dueCount > 0 ? '#ef4444' : '#10b981' }}>(बकाया राशि)</span>
            </div>
            <div className={`metric-icon ${dueCount > 0 ? 'danger' : 'success'}`}>{dueCount > 0 ? '⏳' : '✨'}</div>
          </div>
          <div className="metric-value" style={{ color: dueCount > 0 ? '#b91c1c' : '#059669' }}>₹{totalDue.toLocaleString('en-IN')}</div>
          <div className="metric-badge-pill" style={{ background: dueCount > 0 ? '#fef2f2' : '#ecfdf5', color: dueCount > 0 ? '#b91c1c' : '#047857', border: `1px solid ${dueCount > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
            <span>{dueCount > 0 ? `⚠️ ${dueCount} Bills Pending / Due` : '✨ No Pending Dues'}</span>
          </div>
        </div>

        <div className="metric-card info">
          <div className="metric-card-header">
            <div className="metric-card-title-group">
              <span className="metric-card-title" style={{ color: '#1d4ed8' }}>Total Invoiced</span>
              <span className="metric-card-subtitle" style={{ color: '#3b82f6' }}>(कुल बिल)</span>
            </div>
            <div className="metric-icon info">🧾</div>
          </div>
          <div className="metric-value" style={{ color: '#1e40af' }}>₹{totalBilled.toLocaleString('en-IN')}</div>
          <div className="metric-badge-pill" style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid rgba(37,99,235,0.2)' }}>
            <span>📋 {bills.length} Total Bills Issued</span>
          </div>
        </div>
      </div>

      {/* Multi-Parameter Bill Filter Card */}
      <div className="bill-filter-card" style={{ marginBottom: '18px' }}>
        <div className="bill-filter-grid-primary">
          {/* Live Search */}
          <div className="bill-search-wrapper" style={{ flex: '1 1 280px' }}>
            <span className="search-icon"><Search size={15} /></span>
            <input
              type="text"
              className="bill-search-input"
              placeholder="खोजें: बिल #, नाम, फोन, गाँव, सामान..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="bill-search-clear-btn"
                onClick={() => setSearchTerm('')}
                title="खोज साफ़ करें"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Payment Status Dropdown */}
          <div className="bill-filter-select-item">
            <label>Payment Status (भुगतान)</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">सभी भुगतान (All Status)</option>
              <option value="paid">✓ Fully Paid (पूर्ण चुकता)</option>
              <option value="due">⚠️ Unpaid Due (पूर्ण बकाया)</option>
              <option value="partial">⏳ Partial Due (आंशिक बकाया)</option>
              <option value="pending">⚠️ All Pending Dues (सभी बकाया)</option>
            </select>
          </div>

          {/* Date Preset Dropdown */}
          <div className="bill-filter-select-item">
            <label>Date Range (दिनांक)</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">सभी दिनांक (All Time)</option>
              <option value="today">आज (Today)</option>
              <option value="last7">पिछले 7 दिन (Last 7 Days)</option>
              <option value="thisMonth">इस महीने (This Month)</option>
              <option value="lastMonth">पिछले महीने (Last Month)</option>
              <option value="custom">📅 कस्टम तारीख (Custom Range)</option>
            </select>
          </div>

          {/* Custom Date Pickers */}
          {dateFilter === 'custom' && (
            <div className="bill-custom-dates-wrap">
              <div className="bill-filter-select-item">
                <label>From (से)</label>
                <input
                  type="date"
                  className="bill-date-picker-input"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                />
              </div>
              <div className="bill-filter-select-item">
                <label>To (तक)</label>
                <input
                  type="date"
                  className="bill-date-picker-input"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Secondary Filter Row */}
        <div className="bill-filter-grid-secondary">
          {/* Amount Bracket Dropdown */}
          <div className="bill-filter-select-item">
            <label>Amount (राशि सीमा)</label>
            <select
              value={amountFilter}
              onChange={(e) => setAmountFilter(e.target.value)}
            >
              <option value="all">सभी राशि (All Amounts)</option>
              <option value="under5k">₹5,000 से कम (Under ₹5K)</option>
              <option value="5k-20k">₹5,000 - ₹20,000</option>
              <option value="20k-50k">₹20,000 - ₹50,000</option>
              <option value="above50k">₹50,000 से अधिक (&gt; ₹50K)</option>
            </select>
          </div>

          {/* Village / Location Dropdown */}
          <div className="bill-filter-select-item">
            <label>Village / City (गाँव / स्थान)</label>
            <select
              value={villageFilter}
              onChange={(e) => setVillageFilter(e.target.value)}
            >
              <option value="all">सभी गाँव / स्थान (All Locations)</option>
              {uniqueVillages.map((vil) => (
                <option key={vil} value={vil}>
                  📍 {vil}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order Dropdown */}
          <div className="bill-filter-select-item">
            <label>Sort By (क्रमबद्ध)</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date-desc">दिनांक: नया पहले (Date Newest)</option>
              <option value="date-asc">दिनांक: पुराना पहले (Date Oldest)</option>
              <option value="bill-desc">बिल संख्या: उच्च से निम्न (Bill # High-Low)</option>
              <option value="bill-asc">बिल संख्या: निम्न से उच्च (Bill # Low-High)</option>
              <option value="amount-desc">राशि: अधिकतम पहले (Amount High-Low)</option>
              <option value="amount-asc">राशि: न्यूनतम पहले (Amount Low-High)</option>
              <option value="due-desc">बकाया: सबसे ज्यादा पहले (Due Highest)</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary bill-clear-all-btn"
                onClick={resetFilters}
                style={{ height: '36px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RotateCcw size={13} /> फ़िल्टर हटाएं (Reset)
              </button>
            </div>
          )}
        </div>

        {/* Active Filter Chips & Summary Strip */}
        <div className="bill-active-filter-strip">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
              Showing {filteredBills.length} of {bills.length} bills:
            </span>

            {searchTerm && (
              <span className="bill-filter-chip-tag">
                Search: "{searchTerm}"
                <button type="button" onClick={() => setSearchTerm('')} title="Remove">✕</button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="bill-filter-chip-tag">
                Status: {statusFilter.toUpperCase()}
                <button type="button" onClick={() => setStatusFilter('all')} title="Remove">✕</button>
              </span>
            )}
            {dateFilter !== 'all' && (
              <span className="bill-filter-chip-tag">
                Date: {dateFilter}
                <button type="button" onClick={() => setDateFilter('all')} title="Remove">✕</button>
              </span>
            )}
            {amountFilter !== 'all' && (
              <span className="bill-filter-chip-tag">
                Amount: {amountFilter}
                <button type="button" onClick={() => setAmountFilter('all')} title="Remove">✕</button>
              </span>
            )}
            {villageFilter !== 'all' && (
              <span className="bill-filter-chip-tag">
                Location: {villageFilter}
                <button type="button" onClick={() => setVillageFilter('all')} title="Remove">✕</button>
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' }}>
            <span className="bill-stat-chip-pill">
              Filtered Total: <strong>₹{filteredTotal.toLocaleString('en-IN')}</strong>
            </span>
            {filteredDue > 0 && (
              <span className="bill-stat-chip-pill due">
                Filtered Due: <strong>₹{filteredDue.toLocaleString('en-IN')}</strong>
              </span>
            )}
          </div>
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
                        {Number(bill.discount) > 0 && (
                          <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 700 }}>
                            Discount: -₹{Number(bill.discount).toLocaleString('en-IN')}
                          </div>
                        )}
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
                            onClick={() => {
                              if (window.app?.printBillDirect) {
                                window.app.printBillDirect(bill);
                              } else if (window.app?.openBillPreviewById) {
                                window.app.openBillPreviewById(bill.id || bill.billNumber, true);
                              } else {
                                openModal('billPrint', bill);
                              }
                            }}
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
