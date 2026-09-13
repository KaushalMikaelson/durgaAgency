import React from 'react';

export function Topbar() {
  const toggleTheme = () => {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
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
        <button className="quick-action-btn btn-outline" id="langToggleBtn" onClick={() => window.app?.toggleLanguage()}>
          🌐 हिन्दी
        </button>
        <button className="quick-action-btn btn-outline" id="themeToggleBtn" onClick={toggleTheme}>
          🌓 Theme
        </button>
        <button className="quick-action-btn btn-outline" onClick={() => window.app?.openLoanDocsModal()}>
          📄 Loan Files
        </button>
        <button className="quick-action-btn btn-outline" onClick={() => window.app?.openGatePassModal()}>
          🚚 Gate Pass
        </button>
        <button className="quick-action-btn btn-outline" onClick={() => window.app?.openBackupModal()}>
          💾 Backup
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
