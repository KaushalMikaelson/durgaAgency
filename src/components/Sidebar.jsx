import React from 'react';

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand-header">
        <div className="brand-logo-badge">🚜</div>
        <div className="brand-info">
          <h1>Maa Durga Engineering</h1>
          <p>Tractor Showroom OS</p>
        </div>
      </div>

      <ul className="nav-menu">
        <li>
          <button className="nav-item-btn active" data-tab="dashboard">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            <span>Dashboard</span>
          </button>
        </li>
        <li>
          <button className="nav-item-btn" data-tab="leads">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Customers & Leads</span>
            <span className="nav-badge hot" id="hotLeadsBadge" style={{ display: 'none' }}>0 Hot</span>
          </button>
        </li>
        <li>
          <button className="nav-item-btn" data-tab="recommend">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>
            <span>Recommendation</span>
          </button>
        </li>
        <li>
          <button className="nav-item-btn" data-tab="inventory">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m10 11 11 .9a1 1 0 0 1 .8 1.1l-.66 5a1 1 0 0 1-1 .9H16"/><path d="M16 18h-5"/><path d="M7 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/><path d="M19 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/><path d="M7 11V4h7v7"/></svg>
            <span>Inventory & Margins</span>
          </button>
        </li>
        <li>
          <button className="nav-item-btn" data-tab="quotations">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>
            <span>Quotations</span>
          </button>
        </li>
        <li>
          <button className="nav-item-btn" data-tab="emi">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/></svg>
            <span>EMI & Harvest Calc</span>
          </button>
        </li>
        <li>
          <button className="nav-item-btn" data-tab="demos">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            <span>Field Demos</span>
          </button>
        </li>
        <li>
          <button className="nav-item-btn" data-tab="expenses">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span>Expenses</span>
            <span className="nav-badge" id="pendingExpBadge" style={{ display: 'none', background: 'rgba(245,158,11,0.25)', color: '#d97706' }}>1 Pending</span>
          </button>
        </li>
        <li>
          <button className="nav-item-btn" data-tab="cashflow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>
            <span>Cash & Bank</span>
          </button>
        </li>
        <li>
          <button className="nav-item-btn" data-tab="villageMap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
            <span>Village Sales Map</span>
          </button>
        </li>
        <li>
          <button className="nav-item-btn" data-tab="aiAdvisor">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
            <span>AI Business Advisor</span>
          </button>
        </li>
      </ul>

      <div className="sidebar-footer">
        <span>Dealer Code: UP-GKP-89</span>
        <span>v2.4 Pro</span>
      </div>
    </aside>
  );
}
