import React from 'react';
import { isLocalhost, isCloudSyncEnabled } from '../store.js';

export function Topbar() {
  const toggleTheme = () => {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  };

  const isLocal = isLocalhost;
  const isCloud = isCloudSyncEnabled();

  const handleToggleDataSource = (enableCloud) => {
    localStorage.setItem('MDE_DATA_SOURCE_MODE', enableCloud ? 'deployed' : 'local');
    localStorage.setItem('mde_override_cloud_sync', enableCloud ? 'true' : 'false');
    window.location.reload();
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-toggle-btn" id="mobileMenuBtn" aria-label="Toggle Sidebar">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none">
            <line x1="3" x2="21" y1="12" y2="12" />
            <line x1="3" x2="21" y1="6" y2="6" />
            <line x1="3" x2="21" y1="18" y2="18" />
          </svg>
        </button>
        <div className="page-title-group">
          <h2 id="topbarTitle">Executive Command Center</h2>
          <span id="topbarSubtitle">Daily sales calls, today's cash flow & monthly showroom P&L</span>
        </div>
      </div>

      <div className="topbar-actions">
        {/* Toggle button ONLY visible in local mode */}
        {isLocal && (
          <div
            className="data-source-toggle"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#f1f5f9',
              border: '1.5px solid #cbd5e1',
              borderRadius: '20px',
              padding: '2px',
              gap: '3px',
              marginRight: '6px'
            }}
            title="Localhost Mode Switcher: Click to toggle between Local Isolated Data and Deployed Live Data"
          >
            <button
              type="button"
              id="btnSwitchToLocal"
              onClick={() => handleToggleDataSource(false)}
              style={{
                padding: '4px 10px',
                borderRadius: '16px',
                border: 'none',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: !isCloud ? '#ffffff' : 'transparent',
                color: !isCloud ? '#92400e' : '#64748b',
                boxShadow: !isCloud ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              🔒 Local Data
            </button>
            <button
              type="button"
              id="btnSwitchToDeployed"
              onClick={() => handleToggleDataSource(true)}
              style={{
                padding: '4px 10px',
                borderRadius: '16px',
                border: 'none',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: isCloud ? '#2563eb' : 'transparent',
                color: isCloud ? '#ffffff' : '#64748b',
                boxShadow: isCloud ? '0 1px 3px rgba(37,99,235,0.25)' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              ☁️ Deployed Data
            </button>
            <a
              href="https://durga-agency.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '4px 8px',
                borderRadius: '14px',
                fontSize: '11px',
                fontWeight: '700',
                color: '#2563eb',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                background: 'rgba(37, 99, 235, 0.08)'
              }}
              title="Open your live deployed website on Vercel in a new tab"
            >
              Live Site ↗
            </a>
          </div>
        )}
        <button className="quick-action-btn btn-outline" id="langToggleBtn" onClick={() => window.app?.toggleLanguage()}>
          🌐 हिन्दी
        </button>
        <button className="quick-action-btn btn-outline" id="themeToggleBtn" onClick={toggleTheme}>
          🌓 Theme
        </button>
        <button
          className="quick-action-btn btn-primary"
          style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', border: 'none', color: '#fff' }}
          onClick={() => window.app?.openNewBillModal()}
          title="Create Maa Durga Diesel Estimate / Cash Memo"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
            <path d="M14 8H8" />
            <path d="M16 12H8" />
            <path d="M13 16H8" />
          </svg>
          <span>+ Bill</span>
        </button>
        <button className="quick-action-btn btn-primary" onClick={() => window.app?.openNewLeadModal()}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" x2="12" y1="5" y2="19" />
            <line x1="5" x2="19" y1="12" y2="12" />
          </svg>
          <span>+ Lead</span>
        </button>
        <button className="quick-action-btn btn-gold" onClick={() => window.app?.openFastExpenseModal()}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" x2="12" y1="2" y2="22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <span>+ Expense</span>
        </button>
      </div>
    </header>
  );
}
