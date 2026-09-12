// Dealership Top Bar with Quick Actions and Dealership Status
import React from 'react';
import { useDealership } from '../../context/DealershipContext.jsx';
import { Plus, Receipt, UserPlus, TrendingDown, Menu, Settings } from 'lucide-react';

export function TopBar({ onToggleMobile }) {
  const { openModal, settings } = useDealership();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-toggle-btn" onClick={onToggleMobile} aria-label="Toggle Navigation">
          <Menu size={22} />
        </button>
        <div className="showroom-pill">
          <span className="dot online"></span>
          <span className="name">{settings.name || 'Maa Durga Engineering'}</span>
          <span className="tag">VST Zetor Authorized</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Primary Dealership Quick Action: + New Bill */}
        <button
          className="btn btn-primary"
          onClick={() => openModal('billSheet')}
          title="Create Maa Durga Diesel Estimate / Cash Memo"
        >
          <Receipt size={16} />
          <span>+ Create Bill</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => openModal('lead')}
          title="Add Farmer Lead"
        >
          <UserPlus size={16} />
          <span>+ Lead</span>
        </button>

        <button
          className="btn btn-ghost"
          onClick={() => openModal('expense')}
          title="Log Showroom Expense"
        >
          <TrendingDown size={16} />
          <span>+ Expense</span>
        </button>

        <button
          className="btn-icon"
          onClick={() => openModal('settings')}
          title="Dealership Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
