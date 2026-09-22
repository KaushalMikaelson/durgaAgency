// Showroom Expenses Ledger Page with Interactive Money Flow Pie/Donut Chart
import React, { useState, useMemo } from 'react';
import { useDealership } from '../context/DealershipContext.jsx';
import { TrendingDown, Plus, PieChart, Sparkles, X, Tag } from 'lucide-react';

const CATEGORY_COLORS = {
  'Fuel': '#d97706',
  'Diesel / Fuel': '#d97706',
  'Transport': '#2563eb',
  'Freight / Logistics': '#2563eb',
  'Repairs & PDI': '#059669',
  'PDI / Servicing': '#059669',
  'Salaries': '#db2777',
  'Staff Salaries & Incentives': '#db2777',
  'Showroom Rent': '#7c3aed',
  'Showroom Rent & Utilities': '#7c3aed',
  'Electricity': '#0891b2',
  'Customer & Tea/Food': '#f59e0b',
  'Tea & Refreshments': '#f59e0b',
  'Customer Welcome & Gifts': '#f59e0b',
  'Advertising': '#ea580c',
  'Marketing / Village Wall Painting': '#ea580c',
  'Commission / Brokerage': '#4f46e5',
  'Miscellaneous': '#64748b',
  'Other Operational': '#64748b',
  'Cash': '#10b981',
  'Bank Transfer': '#3b82f6',
  'UPI': '#8b5cf6',
  'Cheque': '#f59e0b',
  'Tagged Unit Cost': '#2563eb',
  'General Showroom': '#10b981'
};

const DEFAULT_PALETTE = ['#d97706', '#2563eb', '#059669', '#7c3aed', '#db2777', '#0891b2', '#f59e0b', '#ea580c', '#4f46e5', '#64748b', '#14b8a6', '#6366f1'];

export function ExpensesPage() {
  const { expenses, openModal } = useDealership();

  const [dimension, setDimension] = useState('category'); // 'category' | 'paymentMode' | 'chassisNature'
  const [period, setPeriod] = useState('all'); // 'all' | 'month' | '30days'
  const [activeFilter, setActiveFilter] = useState(null);
  const [hoveredSlice, setHoveredSlice] = useState(null);

  // 1. Period Filtering
  const filteredByPeriod = useMemo(() => {
    let list = [...expenses];
    if (period === 'month') {
      const currentMonth = new Date().toISOString().slice(0, 7);
      list = list.filter(e => (e.date || '').startsWith(currentMonth));
    } else if (period === '30days') {
      const cutoff = Date.now() - 30 * 86400000;
      list = list.filter(e => new Date(e.date).getTime() >= cutoff);
    }
    return list;
  }, [expenses, period]);

  // 2. Core Metrics
  const totalExpenseAmount = useMemo(() => {
    return filteredByPeriod.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [filteredByPeriod]);

  const chassisExpenses = useMemo(() => {
    return filteredByPeriod.filter(e => e.chassisTag && e.chassisTag.trim().length > 0);
  }, [filteredByPeriod]);

  const totalChassisCost = useMemo(() => {
    return chassisExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [chassisExpenses]);

  const totalGeneralOverhead = totalExpenseAmount - totalChassisCost;

  // 3. Grouping by dimension
  const groups = useMemo(() => {
    const groupMap = {};
    if (dimension === 'category') {
      filteredByPeriod.forEach(e => {
        const cat = e.category || 'Miscellaneous';
        if (!groupMap[cat]) groupMap[cat] = { key: cat, label: cat, amount: 0, count: 0 };
        groupMap[cat].amount += Number(e.amount || 0);
        groupMap[cat].count += 1;
      });
    } else if (dimension === 'paymentMode') {
      filteredByPeriod.forEach(e => {
        const mode = e.paymentMode || 'Cash';
        if (!groupMap[mode]) groupMap[mode] = { key: mode, label: `${mode} Outflow`, amount: 0, count: 0 };
        groupMap[mode].amount += Number(e.amount || 0);
        groupMap[mode].count += 1;
      });
    } else if (dimension === 'chassisNature') {
      groupMap['Tagged Unit Cost'] = { key: 'Tagged Unit Cost', label: 'Tractor Chassis Direct Cost', amount: 0, count: 0 };
      groupMap['General Showroom'] = { key: 'General Showroom', label: 'Showroom General Overhead', amount: 0, count: 0 };
      filteredByPeriod.forEach(e => {
        if (e.chassisTag && e.chassisTag.trim().length > 0) {
          groupMap['Tagged Unit Cost'].amount += Number(e.amount || 0);
          groupMap['Tagged Unit Cost'].count += 1;
        } else {
          groupMap['General Showroom'].amount += Number(e.amount || 0);
          groupMap['General Showroom'].count += 1;
        }
      });
    }

    const list = Object.values(groupMap)
      .filter(g => g.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    list.forEach((g, idx) => {
      g.color = CATEGORY_COLORS[g.key] || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length];
      g.percent = totalExpenseAmount > 0 ? ((g.amount / totalExpenseAmount) * 100).toFixed(1) : '0.0';
    });

    return list;
  }, [filteredByPeriod, dimension, totalExpenseAmount]);

  const topGroup = groups[0] || null;

  // 4. SVG Donut Arc Geometry
  const R = 85;
  const C = 2 * Math.PI * R; // 534.07075
  let accumulatedPercent = 0;
  const arcs = groups.map(g => {
    const percentVal = totalExpenseAmount > 0 ? (g.amount / totalExpenseAmount) : 0;
    const dashLength = percentVal * C;
    const gap = groups.length > 1 ? 2.5 : 0;
    const visibleDash = Math.max(0, dashLength - gap);
    const offset = -accumulatedPercent * C;
    accumulatedPercent += percentVal;
    return {
      ...g,
      dashArray: `${visibleDash.toFixed(2)} ${(C - visibleDash).toFixed(2)}`,
      dashOffset: offset.toFixed(2)
    };
  });

  // 5. Table Rows Filtering
  const tableExpenses = useMemo(() => {
    if (!activeFilter) return filteredByPeriod;
    if (dimension === 'category') {
      return filteredByPeriod.filter(e => (e.category || 'Miscellaneous') === activeFilter);
    }
    if (dimension === 'paymentMode') {
      return filteredByPeriod.filter(e => (e.paymentMode || 'Cash') === activeFilter);
    }
    if (dimension === 'chassisNature') {
      if (activeFilter === 'Tagged Unit Cost') {
        return filteredByPeriod.filter(e => e.chassisTag && e.chassisTag.trim().length > 0);
      }
      return filteredByPeriod.filter(e => !e.chassisTag || e.chassisTag.trim().length === 0);
    }
    return filteredByPeriod;
  }, [filteredByPeriod, activeFilter, dimension]);

  const handleGroupClick = (key) => {
    setActiveFilter(prev => (prev === key ? null : key));
  };

  return (
    <div className="page-container expenses-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Showroom Operational Expenses & Money Flow</h2>
          <p>Freight, PDI, staff, rent, diesel, and dealership overheads tagged to tractor chassis</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => openModal('expense')}>
            <Plus size={16} /> + Log Expense
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="expense-analytics-wrapper">
        <div className="expense-metrics-ribbon">
          <div className="expense-stat-card card-amber">
            <span className="stat-label">Total Outflow (Spend) 💸</span>
            <div className="stat-value font-mono">₹{totalExpenseAmount.toLocaleString('en-IN')}</div>
            <span className="stat-sub">{filteredByPeriod.length} expenses logged</span>
          </div>

          <div className="expense-stat-card card-rose">
            <span className="stat-label">Top Expense Category 🎯</span>
            <div className="stat-value" style={{ fontSize: '17px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {topGroup ? topGroup.label : 'None Yet'}
            </div>
            <span className="stat-sub">
              {topGroup ? `₹${topGroup.amount.toLocaleString('en-IN')} (${topGroup.percent}%)` : 'No data'}
            </span>
          </div>

          <div className="expense-stat-card card-blue">
            <span className="stat-label">Chassis Direct Costs 🏷️</span>
            <div className="stat-value font-mono">₹{totalChassisCost.toLocaleString('en-IN')}</div>
            <span className="stat-sub">{chassisExpenses.length} tractor-tagged costs</span>
          </div>

          <div className="expense-stat-card card-emerald">
            <span className="stat-label">Showroom Overhead 🏢</span>
            <div className="stat-value font-mono">₹{totalGeneralOverhead.toLocaleString('en-IN')}</div>
            <span className="stat-sub">Rent, fuel, staff & hospitality</span>
          </div>
        </div>

        {/* Donut Chart & Category Breakdown Panel */}
        <div className="expense-chart-panel">
          <div className="expense-chart-header">
            <div className="chart-title-area">
              <h3>
                <PieChart size={18} style={{ color: 'var(--primary)' }} /> Showroom Money Flow & Expense Distribution
              </h3>
              <p>Analyze operational spend breakdown by category, payment mode, or tractor unit cost.</p>
            </div>

            <div className="chart-controls-group">
              <div className="dimension-pills">
                <button
                  type="button"
                  className={`dimension-btn ${dimension === 'category' ? 'active' : ''}`}
                  onClick={() => { setDimension('category'); setActiveFilter(null); }}
                >
                  By Category
                </button>
                <button
                  type="button"
                  className={`dimension-btn ${dimension === 'paymentMode' ? 'active' : ''}`}
                  onClick={() => { setDimension('paymentMode'); setActiveFilter(null); }}
                >
                  By Payment Mode
                </button>
                <button
                  type="button"
                  className={`dimension-btn ${dimension === 'chassisNature' ? 'active' : ''}`}
                  onClick={() => { setDimension('chassisNature'); setActiveFilter(null); }}
                >
                  By Cost Nature
                </button>
              </div>

              <select
                className="form-select"
                style={{ width: 'auto', padding: '5px 10px', fontSize: '12px', height: '32px' }}
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="30days">Last 30 Days</option>
              </select>
            </div>
          </div>

          <div className="expense-chart-layout">
            {/* Donut Chart */}
            <div className={`expense-donut-container ${activeFilter ? 'has-active' : ''}`}>
              {totalExpenseAmount > 0 ? (
                <svg className="expense-pie-svg" viewBox="0 0 280 280">
                  {arcs.map(arc => {
                    const isActive = activeFilter === arc.key || (hoveredSlice && hoveredSlice.key === arc.key);
                    return (
                      <circle
                        key={arc.key}
                        className={`chart-arc ${isActive ? 'is-active' : ''}`}
                        cx="140"
                        cy="140"
                        r={R}
                        stroke={arc.color}
                        strokeWidth={isActive ? 44 : 36}
                        strokeDasharray={arc.dashArray}
                        strokeDashoffset={arc.dashOffset}
                        onMouseEnter={() => setHoveredSlice(arc)}
                        onMouseLeave={() => setHoveredSlice(null)}
                        onClick={() => handleGroupClick(arc.key)}
                        style={{ cursor: 'pointer' }}
                      />
                    );
                  })}
                </svg>
              ) : (
                <svg className="expense-pie-svg" viewBox="0 0 280 280">
                  <circle cx="140" cy="140" r="85" fill="none" stroke="var(--border-color)" strokeWidth="26" strokeDasharray="8 6" />
                </svg>
              )}

              <div className="donut-center-info">
                {hoveredSlice ? (
                  <>
                    <span className="center-sub">{hoveredSlice.label}</span>
                    <span className="center-val font-mono">₹{hoveredSlice.amount.toLocaleString('en-IN')}</span>
                    <span className="center-extra">{hoveredSlice.percent}% ({hoveredSlice.count} txns)</span>
                  </>
                ) : (
                  <>
                    <span className="center-sub">Total Outflow</span>
                    <span className="center-val font-mono">₹{totalExpenseAmount.toLocaleString('en-IN')}</span>
                    <span className="center-extra">{filteredByPeriod.length} Records</span>
                  </>
                )}
              </div>
            </div>

            {/* Breakdown Legend */}
            <div className="expense-breakdown-side">
              <div className="breakdown-header">
                <span>{dimension === 'category' ? 'Category' : dimension === 'paymentMode' ? 'Payment Method' : 'Cost Allocation'}</span>
                <span>Share of Spend (Click to Filter)</span>
              </div>

              {groups.length === 0 ? (
                <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
                  No expenses recorded for this period. Click <strong>+ Log Expense</strong> to record showroom costs.
                </div>
              ) : (
                <div className="expense-legend-grid">
                  {groups.map(g => {
                    const isSelected = activeFilter === g.key;
                    return (
                      <div
                        key={g.key}
                        className={`legend-row ${isSelected ? 'is-active' : ''}`}
                        onMouseEnter={() => setHoveredSlice(g)}
                        onMouseLeave={() => setHoveredSlice(null)}
                        onClick={() => handleGroupClick(g.key)}
                        title={`Click to filter ledger by ${g.label}`}
                      >
                        <div className="legend-top">
                          <div className="legend-left">
                            <span className="legend-color-dot" style={{ background: g.color }} />
                            <span className="legend-cat-name">{g.label}</span>
                            <span className="legend-cat-count">({g.count} txns)</span>
                          </div>
                          <div className="legend-right">
                            <span className="legend-amount font-mono">₹{g.amount.toLocaleString('en-IN')}</span>
                            <span className="legend-percent-badge">{g.percent}%</span>
                          </div>
                        </div>
                        <div className="legend-bar-track">
                          <div className="legend-bar-fill" style={{ width: `${g.percent}%`, background: g.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Indicator */}
      {activeFilter && (
        <div className="expense-active-filter-bar">
          <div className="active-filter-text">
            <span>🔍 Filtered by: <strong>{activeFilter}</strong></span>
            <span style={{ fontWeight: 'normal', opacity: 0.85 }}>({tableExpenses.length} entries)</span>
          </div>
          <button className="clear-filter-btn" onClick={() => setActiveFilter(null)}>
            ✕ Clear Filter
          </button>
        </div>
      )}

      {/* Ledger Table */}
      <div className="table-card">
        {tableExpenses.length === 0 ? (
          <div className="empty-state-large">
            <TrendingDown size={48} className="empty-icon" />
            <h4>{activeFilter ? `No expenses matching "${activeFilter}"` : 'No expenses logged yet'}</h4>
            <p>{activeFilter ? 'Try clearing the active filter to view all records.' : 'Log showroom costs, freight, or tractor PDI to track accurate dealer net margin.'}</p>
            {activeFilter ? (
              <button className="btn btn-outline" onClick={() => setActiveFilter(null)}>
                Clear Filter
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => openModal('expense')}>
                + Log First Expense
              </button>
            )}
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
                {tableExpenses.map((exp) => (
                  <tr key={exp.id}>
                    <td>{exp.date}</td>
                    <td>
                      <span
                        className="badge-stage"
                        style={{ cursor: 'pointer' }}
                        onClick={() => { setDimension('category'); setActiveFilter(exp.category); }}
                        title="Filter by category"
                      >
                        {exp.category}
                      </span>
                    </td>
                    <td>
                      {exp.chassisTag ? (
                        <span className="badge-warm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Tag size={12} /> {exp.chassisTag}
                        </span>
                      ) : '-'}
                    </td>
                    <td>{exp.description || exp.notes || '-'}</td>
                    <td>{exp.paymentMode || 'Cash'}</td>
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
