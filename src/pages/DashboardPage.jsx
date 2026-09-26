// Dealership Dashboard Overview Page
import React from 'react';
import { useDealership } from '../context/DealershipContext.jsx';
import { StatCard } from '../components/common/StatCard.jsx';
import { motion } from '../utils/motion.jsx';
import { Receipt, Users, Tractor, Wallet, Plus, Printer, Phone, ArrowRight, BarChart3 } from 'lucide-react';
import { formatToDMY } from '../utils/dateUtils.js';

export function DashboardPage() {
  const { bills, leads, tractors, financialSnapshot, openModal, setActiveTab } = useDealership();

  const inStockUnits = tractors.reduce((sum, t) => sum + (t.stockCount || 0), 0);
  const hotLeads = leads.filter(l => Number(l.buyingScore) >= 75 || l.stage === 'Negotiation');
  const recentBills = bills.slice(0, 5);

  return (
    <div className="page-container dashboard-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2>Showroom Executive Dashboard</h2>
          <p>Maa Durga Engineering • Authorized VST Zetor Dealership System</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => window.app ? window.app.switchTab('analytics') : setActiveTab('analytics')}>
            <BarChart3 size={16} /> 📊 Summary & Stats
          </button>
          <button className="btn btn-primary" onClick={() => openModal('billSheet')}>
            <Receipt size={16} /> + New Bill Book Entry
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="kpi-grid">
        <StatCard
          label="Total Bills Issued"
          value={bills.length}
          subtext={`₹${bills.reduce((s, b) => s + Number(b.totalRupees || 0), 0).toLocaleString('en-IN')} Total Recorded`}
          icon={Receipt}
          color="emerald"
        />
        <StatCard
          label="Active Leads Pipeline"
          value={leads.length}
          subtext={`${hotLeads.length} Hot purchase intent`}
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Tractors in Stock"
          value={`${inStockUnits} Units`}
          subtext={`${tractors.length} VST Zetor Models Cataloged`}
          icon={Tractor}
          color="amber"
        />
        <StatCard
          label="Net Showroom Cash Flow"
          value={`₹${(financialSnapshot.netCashFlow || 0).toLocaleString('en-IN')}`}
          subtext="Inflow vs Operating Expenses"
          icon={Wallet}
          color="purple"
        />
      </div>

      {/* Main Grid: Calling Queue & Recent Bills */}
      <div className="dashboard-columns">
        {/* Left Column: Today's Calling Queue */}
        <div className="dash-card flex-1">
          <div className="card-header">
            <h3>🔥 Today's Priority Calling Queue</h3>
            <button className="card-link-btn" onClick={() => setActiveTab('leads')}>
              View All Leads <ArrowRight size={14} />
            </button>
          </div>
          <div className="calling-queue-list">
            {hotLeads.length === 0 ? (
              <p className="empty-notice">No urgent calls scheduled. All active leads are in nurture stages.</p>
            ) : (
              hotLeads.slice(0, 4).map((lead) => (
                <div key={lead.id} className="calling-item">
                  <div className="calling-info">
                    <strong>{lead.name}</strong>
                    <span>{lead.village ? `Village ${lead.village}` : 'Gorakhpur'} • Score {lead.buyingScore}/100</span>
                    <p className="calling-action">👉 {lead.nextAction || 'Call to discuss price and delivery'}</p>
                  </div>
                  <a
                    href={`tel:${lead.phone}`}
                    className="btn-call-direct"
                    title={`Call ${lead.name}`}
                  >
                    <Phone size={15} /> Call
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Recent Maa Durga Diesel Bills */}
        <div className="dash-card flex-1">
          <div className="card-header">
            <h3>📄 Recent Maa Durga Diesel Bills</h3>
            <button className="card-link-btn" onClick={() => setActiveTab('billing')}>
              View All Bills <ArrowRight size={14} />
            </button>
          </div>
          <div className="recent-bills-table-box">
            {recentBills.length === 0 ? (
              <div className="empty-state">
                <p>No bills issued yet.</p>
                <button className="btn btn-secondary" onClick={() => openModal('billSheet')}>
                  Create First Bill
                </button>
              </div>
            ) : (
              <table className="table-clean">
                <thead>
                  <tr>
                    <th>क्र. (No.)</th>
                    <th>Date</th>
                    <th>मेसर्स (Customer)</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBills.map((b) => (
                    <tr key={b.id || b.billNumber}>
                      <td><span className="badge-bill">#{b.billNumber}</span></td>
                      <td><span className="font-mono">{formatToDMY(b.date)}</span></td>
                      <td><strong>{b.customerName}</strong></td>
                      <td className="font-mono font-bold">₹{Number(b.totalRupees || 0).toLocaleString('en-IN')}</td>
                      <td>
                        <button
                          className="btn-icon-small"
                          title="Print Bill"
                          onClick={() => openModal('billPrint', b)}
                        >
                          <Printer size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
